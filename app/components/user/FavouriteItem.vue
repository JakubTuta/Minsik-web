<script setup lang="ts">
import type { FavouriteEntry } from '~/types/user'

const props = defineProps<{
  entry: FavouriteEntry
}>()

const favouritesStore = useFavouritesStore()

async function remove() {
  await favouritesStore.removeFavourite(props.entry.book_slug)
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
    :show-actions="true"
  >
    <template #actions>
      <v-btn
        icon
        size="small"
        variant="text"
        @click.stop="remove"
      >
        <v-icon
          icon="mdi-heart"
          color="red"
          size="20"
        />
      </v-btn>

      <v-btn
        icon="mdi-open-in-new"
        size="small"
        variant="text"
        :to="`/books/${entry.book_slug}`"
        :as="NuxtLink"
      />
    </template>
  </BookUserRow>
</template>
