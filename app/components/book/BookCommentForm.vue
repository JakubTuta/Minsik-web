<script setup lang="ts">
import type { BookComment } from '~/types/user'

interface Props {
  slug: string
  existingComment?: BookComment | null
}

const props = withDefaults(defineProps<Props>(), {
  existingComment: null,
})

const emit = defineEmits<{
  saved: []
  cancelled: []
}>()

const bookPageStore = useBookPageStore()

const body = ref(props.existingComment?.body ?? '')
const isSpoiler = ref(props.existingComment?.is_spoiler ?? false)
const saving = ref(false)
const error = ref('')

const isEdit = computed(() => !!props.existingComment)

watch(() => props.existingComment, (val) => {
  if (val) {
    body.value = val.body
    isSpoiler.value = val.is_spoiler
  }
})

async function submit() {
  if (!body.value.trim())
    return

  saving.value = true
  error.value = ''

  try {
    if (isEdit.value && props.existingComment) {
      await bookPageStore.updateComment(props.slug, props.existingComment.comment_id, body.value.trim(), isSpoiler.value)
    }
    else {
      await bookPageStore.createComment(props.slug, body.value.trim(), isSpoiler.value)
    }

    if (!isEdit.value) {
      body.value = ''
      isSpoiler.value = false
    }

    emit('saved')
  }
  catch (err: any) {
    error.value = err.response?.data?.error?.message || 'Failed to save comment'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <v-card
    variant="outlined"
    class="pa-4"
  >
    <div class="text-subtitle-2 font-weight-bold mb-3">
      {{ isEdit
        ? 'Edit Comment'
        : 'Leave a Comment' }}
    </div>

    <v-textarea
      v-model="body"
      placeholder="Share your thoughts about this book..."
      variant="outlined"
      rows="3"
      counter="5000"
      maxlength="5000"
      hide-details="auto"
      :error-messages="error
        ? [error]
        : []"
    />

    <div class="d-flex align-center justify-space-between mt-3">
      <v-checkbox
        v-model="isSpoiler"
        label="Contains spoilers"
        density="compact"
        hide-details
        color="warning"
      />

      <div class="d-flex gap-2">
        <v-btn
          v-if="isEdit"
          variant="text"
          size="small"
          @click="emit('cancelled')"
        >
          Cancel
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          size="small"
          :loading="saving"
          :disabled="!body.trim()"
          @click="submit"
        >
          {{ isEdit
            ? 'Update'
            : 'Post Comment' }}
        </v-btn>
      </div>
    </div>
  </v-card>
</template>
