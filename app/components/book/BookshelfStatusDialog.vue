<script setup lang="ts">
import type { BookshelfStatus } from '~/types/user'

interface Props {
  modelValue: boolean
  currentStatus: BookshelfStatus | null
  slug: string
  onSave?: (status: BookshelfStatus) => Promise<void>
  onRemove?: () => Promise<void>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const bookPageStore = useBookPageStore()

const selectedStatus = ref<BookshelfStatus | null>(props.currentStatus)
const saving = ref(false)
const removing = ref(false)

const statusOptions: { label: string, value: BookshelfStatus, color: string, icon: string }[] = [
  { label: 'Want to Read', value: 'want_to_read', color: 'orange', icon: 'mdi-bookmark-outline' },
  { label: 'Reading', value: 'reading', color: 'blue', icon: 'mdi-book-open-page-variant' },
  { label: 'Read', value: 'read', color: 'green', icon: 'mdi-check-circle-outline' },
  { label: 'Abandoned', value: 'abandoned', color: 'grey', icon: 'mdi-close-circle-outline' },
]

watch(() => props.currentStatus, (val) => {
  selectedStatus.value = val
})

async function save() {
  if (!selectedStatus.value)
    return

  saving.value = true
  try {
    if (props.onSave) {
      await props.onSave(selectedStatus.value)
    }
    else {
      await bookPageStore.upsertBookshelf(props.slug, selectedStatus.value)
    }
    emit('update:modelValue', false)
    emit('saved')
  }
  catch {
    // Error handled in store
  }
  finally {
    saving.value = false
  }
}

async function remove() {
  removing.value = true
  try {
    if (props.onRemove) {
      await props.onRemove()
    }
    else {
      await bookPageStore.removeFromBookshelf(props.slug)
    }
    emit('update:modelValue', false)
    emit('saved')
  }
  catch {
    // Error handled in store
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">
        Set Reading Status
      </v-card-title>

      <v-card-text>
        <div class="d-flex flex-column gap-2">
          <v-chip
            v-for="opt in statusOptions"
            :key="opt.value"
            :color="selectedStatus === opt.value
              ? opt.color
              : undefined"
            :variant="selectedStatus === opt.value
              ? 'elevated'
              : 'outlined'"
            :prepend-icon="opt.icon"
            size="large"
            class="cursor-pointer justify-start"
            @click="selectedStatus = opt.value"
          >
            {{ opt.label }}
          </v-chip>

          <v-divider class="my-2" />

          <v-chip
            color="error"
            variant="outlined"
            prepend-icon="mdi-bookmark-remove"
            size="large"
            class="cursor-pointer justify-start"
            :loading="removing"
            @click="remove"
          >
            Remove from Bookshelf
          </v-chip>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="emit('update:modelValue', false)"
        >
          Cancel
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          :loading="saving"
          :disabled="!selectedStatus"
          @click="save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
