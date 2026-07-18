<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author } from '~/types/api'

interface Props {
  modelValue: boolean
  title: string
  fields: EditFieldConfig[]
  originalData: Record<string, any>
  loading?: boolean
  error?: string
  authors?: Pick<Author, 'author_id' | 'name' | 'slug'>[]
}

const props = withDefaults(defineProps<Props>(), {
  error: '',
  authors: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: Record<string, any>]
  'removeAuthors': [authorIds: number[]]
}>()

const editedData = ref<Record<string, any>>({})
const authorsToRemove = ref<number[]>([])
const jsonStrings = ref<Record<string, string>>({})

watch(() => props.modelValue, (open) => {
  if (open) {
    editedData.value = { ...props.originalData }
    authorsToRemove.value = []
    jsonStrings.value = {}
    for (const field of props.fields) {
      if (field.type === 'json') {
        const v = props.originalData[field.key]
        jsonStrings.value[field.key] = v && typeof v === 'object'
          ? JSON.stringify(v, null, 2)
          : '{}'
      }
    }
  }
})

function getArrayValue(key: string): string {
  const val = editedData.value[key]
  if (!val)
    return ''

  return Array.isArray(val)
    ? val.join(', ')
    : String(val)
}

function setArrayValue(key: string, value: string) {
  editedData.value[key] = value
    ? value.split(',').map(s => s.trim()).filter(Boolean)
    : []
}

function setNumberValue(key: string, value: string) {
  editedData.value[key] = value === ''
    ? null
    : Number(value)
}

function updateJsonValue(key: string, value: string) {
  jsonStrings.value[key] = value
  try {
    editedData.value[key] = value ? JSON.parse(value) : {}
  }
  catch {
    // Keep previous parsed value until JSON is valid
  }
}

function handleSave() {
  if (authorsToRemove.value.length > 0)
    emit('removeAuthors', [...authorsToRemove.value])

  emit('save', { ...editedData.value })
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="700"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span>{{ title }}</span>

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="handleClose"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <v-row>
          <template
            v-for="field in fields"
            :key="field.key"
          >
            <v-col
              cols="12"
              :md="field.type === 'textarea'
                ? 12
                : 6"
            >
              <v-textarea
                v-if="field.type === 'textarea'"
                v-model="editedData[field.key]"
                :label="field.label"
                variant="outlined"
                density="compact"
                rows="3"
                auto-grow
              />

              <v-text-field
                v-else-if="field.type === 'number'"
                :model-value="editedData[field.key] ?? ''"
                :label="field.label"
                variant="outlined"
                density="compact"
                type="number"
                clearable
                @update:model-value="setNumberValue(field.key, $event)"
              />

              <v-text-field
                v-else-if="field.type === 'array'"
                :model-value="getArrayValue(field.key)"
                :label="`${field.label} (comma-separated)`"
                variant="outlined"
                density="compact"
                @update:model-value="setArrayValue(field.key, $event)"
              />

              <v-textarea
                v-else-if="field.type === 'json'"
                :model-value="jsonStrings[field.key] ?? '{}'"
                :label="`${field.label} (JSON)`"
                variant="outlined"
                density="compact"
                rows="3"
                auto-grow
                hint='Format: {"key": "value"}'
                persistent-hint
                style="font-family: monospace;"
                @update:model-value="updateJsonValue(field.key, $event)"
              />

              <v-text-field
                v-else
                v-model="editedData[field.key]"
                :label="field.label"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </template>

          <v-col
            v-if="authors.length > 0"
            cols="12"
          >
            <v-autocomplete
              v-model="authorsToRemove"
              :items="authors"
              item-title="name"
              item-value="author_id"
              label="Remove authors"
              placeholder="Select authors to remove"
              :custom-filter="(_: string, query: string, item?: any) =>
                item?.raw?.name?.toLowerCase().includes(query.toLowerCase())
                || item?.raw?.slug?.toLowerCase().includes(query.toLowerCase())"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              clearable
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn
          variant="text"
          @click="handleClose"
        >
          Cancel
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          @click="handleSave"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
