<script setup lang="ts">
interface Props {
  modelValue: boolean
  body: string
  isSpoiler: boolean
  onSave: (body: string, isSpoiler: boolean) => Promise<void>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- seeds an editable draft; reseeded by the watcher below each time the dialog opens
const editBody = ref(props.body)
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- seeds an editable draft; reseeded by the watcher below each time the dialog opens
const editIsSpoiler = ref(props.isSpoiler)
const saving = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) {
    editBody.value = props.body
    editIsSpoiler.value = props.isSpoiler
  }
})

async function save() {
  if (!editBody.value.trim())
    return
  saving.value = true
  try {
    await props.onSave(editBody.value, editIsSpoiler.value)
    emit('update:modelValue', false)
  }
  catch {
    // Error handled in store
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ t('comment.editComment') }}
      </v-card-title>

      <v-card-text class="d-flex flex-column gap-3">
        <v-textarea
          v-model="editBody"
          :label="t('comment.commentLabel')"
          rows="5"
          auto-grow
          variant="outlined"
        />

        <v-switch
          v-model="editIsSpoiler"
          :label="t('comment.containsSpoilers')"
          color="warning"
          hide-details
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="emit('update:modelValue', false)"
        >
          {{ t('common.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          :loading="saving"
          :disabled="!editBody.trim()"
          @click="save"
        >
          {{ t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
