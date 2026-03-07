<script setup lang="ts">
import type { CommentEntry } from '~/types/user'

defineProps<{
  entry: CommentEntry
  eager?: boolean
}>()
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
    :eager="eager"
  >
    <template #topRight>
      <v-chip
        v-if="entry.is_spoiler"
        size="small"
        color="warning"
        variant="tonal"
        prepend-icon="mdi-alert"
        class="flex-shrink-0"
      >
        Spoiler
      </v-chip>
    </template>

    <template #middle>
      <div
        class="text-body-2 text-medium-emphasis mt-2"
        style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;"
      >
        {{ entry.body }}
      </div>
    </template>
  </BookUserItemBase>
</template>
