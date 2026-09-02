<script setup lang="ts">
import type { BookshelfEntry, BookshelfStatus } from '~/types/user'

const props = defineProps<{
  entry: BookshelfEntry
  isPublicProfile: boolean
}>()

const localePath = useLocalePath()

const { t } = useI18n()
const bookshelfStore = useBookshelfStore()

const dialogOpen = ref(false)
const deleteConfirmOpen = ref(false)
const deleting = ref(false)

async function handleSave(newStatus: BookshelfStatus) {
  await bookshelfStore.upsertStatus(props.entry.book_slug, newStatus)
}

function handleRemove() {
  bookshelfStore.removeItem(props.entry.book_slug)
}

async function handleDelete() {
  deleting.value = true
  try {
    await bookshelfStore.deleteMine(props.entry.book_slug)
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
    :status="entry.status"
    :updated-at="entry.updated_at"
    show-actions
  >
    <template #actions>
      <template v-if="!isPublicProfile">
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="dialogOpen = true"
        />
      </template>

      <v-btn
        icon="mdi-open-in-new"
        size="small"
        variant="text"
        :to="localePath(`/books/${entry.book_slug}`)"
      />

      <template v-if="!isPublicProfile">
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          @click="deleteConfirmOpen = true"
        />
      </template>
    </template>
  </BookUserRow>

  <BookshelfStatusDialog
    v-if="!isPublicProfile"
    v-model="dialogOpen"
    :current-status="entry.status"
    :slug="entry.book_slug"
    :on-save="handleSave"
    :on-remove="handleRemove"
  />

  <v-dialog
    v-if="!isPublicProfile"
    v-model="deleteConfirmOpen"
    max-width="360"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ t('bookshelf.removeConfirmTitle') }}
      </v-card-title>

      <v-card-text>
        {{ t('bookshelf.removeConfirmBody', {'title': entry.book_title}) }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="deleteConfirmOpen = false"
        >
          {{ t('common.cancel') }}
        </v-btn>

        <v-btn
          color="error"
          variant="elevated"
          :loading="deleting"
          @click="handleDelete"
        >
          {{ t('common.remove') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
