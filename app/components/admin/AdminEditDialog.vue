<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'

interface Props {
  modelValue: boolean
  title: string
  fields: EditFieldConfig[]
  originalData: Record<string, any>
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: Record<string, any>]
}>()

const editedData = ref<Record<string, any>>({})

watch(() => props.modelValue, (open) => {
  if (open) {
    editedData.value = { ...props.originalData }
  }
})

function getArrayValue(key: string): string {
  const val = editedData.value[key]
  if (!val)
    return ''
  return Array.isArray(val) ? val.join(', ') : String(val)
}

function setArrayValue(key: string, value: string) {
  editedData.value[key] = value
    ? value.split(',').map(s => s.trim()).filter(Boolean)
    : []
}

function handleSave() {
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
              :md="field.type === 'textarea' ? 12 : 6"
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
                v-model.number="editedData[field.key]"
                :label="field.label"
                variant="outlined"
                density="compact"
                type="number"
              />

              <v-text-field
                v-else-if="field.type === 'array'"
                :model-value="getArrayValue(field.key)"
                :label="`${field.label} (comma-separated)`"
                variant="outlined"
                density="compact"
                @update:model-value="setArrayValue(field.key, $event)"
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
