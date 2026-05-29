<script setup lang="ts">
import type { CommentEntry } from '~/types/user'

const props = defineProps<{
  entry: CommentEntry
}>()

const commentsStore = useUserCommentsStore()

const editDialogOpen = ref(false)
const deleteConfirmOpen = ref(false)
const deleting = ref(false)

async function handleSave(body: string, isSpoiler: boolean) {
  await commentsStore.updateComment(props.entry.book_slug, props.entry.comment_id, body, isSpoiler)
}

async function handleDelete() {
  deleting.value = true
  try {
    await commentsStore.deleteComment(props.entry.book_slug, props.entry.comment_id)
    deleteConfirmOpen.value = false
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <BookUserRow
    :slug="entry.book_slug"
    :title="entry.book_title"
    :cover-url="entry.book_cover_url"
    :author-names="entry.book_author_names"
    :author-slugs="entry.book_author_slugs"
    :series-name="entry.book_series_name"
    :updated-at="entry.updated_at"
    :show-actions="true"
  >
    <template #details>
      <v-chip
        v-if="entry.is_spoiler"
        size="small"
        color="warning"
        variant="tonal"
        prepend-icon="mdi-alert"
        class="flex-shrink-0 mt-2 align-self-start"
      >
        Spoiler
      </v-chip>

      <v-sheet
        color="surface-variant"
        rounded="lg"
        class="pa-3 mt-2 text-body-2"
        style="display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;"
      >
        {{ entry.body }}
      </v-sheet>
    </template>

    <template #actions>
      <v-btn
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click="editDialogOpen = true"
      />

      <v-btn
        icon="mdi-open-in-new"
        size="small"
        variant="text"
        :to="`/books/${entry.book_slug}`"
        :as="NuxtLink"
      />

      <v-btn
        icon="mdi-delete"
        size="small"
        variant="text"
        color="error"
        @click="deleteConfirmOpen = true"
      />
    </template>
  </BookUserRow>

  <CommentEditDialog
    v-model="editDialogOpen"
    :body="entry.body"
    :is-spoiler="entry.is_spoiler"
    :on-save="handleSave"
  />

  <v-dialog
    v-model="deleteConfirmOpen"
    max-width="360"
  >
    <v-card>
      <v-card-title class="text-h6">
        Delete comment?
      </v-card-title>

      <v-card-text>
        Your comment on "{{ entry.book_title }}" will be permanently deleted.
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="deleteConfirmOpen = false"
        >
          Cancel
        </v-btn>

        <v-btn
          color="error"
          variant="elevated"
          :loading="deleting"
          @click="handleDelete"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
