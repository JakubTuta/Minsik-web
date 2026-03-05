<script setup lang="ts">
import type { BookshelfEntry, BookshelfStatus } from '~/types/user'

const props = defineProps<{
  entry: BookshelfEntry
  isPublicProfile: boolean
}>()

const { isPublicProfile } = toRefs(props)

const bookshelfStore = useBookshelfStore()

const dialogOpen = ref(false)

const statusConfig: Record<BookshelfStatus, { label: string, color: string, icon: string }> = {
  want_to_read: { label: 'Want to Read', color: 'orange', icon: 'mdi-bookmark-outline' },
  reading: { label: 'Reading', color: 'blue', icon: 'mdi-book-open-page-variant' },
  read: { label: 'Read', color: 'green', icon: 'mdi-check-circle' },
  abandoned: { label: 'Abandoned', color: 'grey', icon: 'mdi-close-circle' },
}

const status = computed(() => statusConfig[props.entry.status])

async function handleSave(newStatus: BookshelfStatus) {
  await bookshelfStore.upsertStatus(props.entry.book_slug, newStatus)
}

async function handleRemove() {
  bookshelfStore.removeItem(props.entry.book_slug)
}
</script>

<template>
  <BookUserItemBase
    :slug="entry.book_slug"
    :title="entry.book_title"
    :cover-url="entry.book_cover_url"
    :author-names="entry.book_author_names"
    :author-slugs="entry.book_author_slugs"
    :series-name="entry.book_series_name"
    :series-slug="entry.book_series_slug"
  >
    <template #topRight>
      <v-btn
        :color="status.color"
        :prepend-icon="status.icon"
        size="small"
        variant="elevated"
        @click="isPublicProfile
          ? null
          : dialogOpen = true"
      >
        {{ status.label }}
      </v-btn>

      <BookshelfStatusDialog
        v-model="dialogOpen"
        :current-status="entry.status"
        :slug="entry.book_slug"
        :on-save="handleSave"
        :on-remove="handleRemove"
      />
    </template>
  </BookUserItemBase>
</template>
