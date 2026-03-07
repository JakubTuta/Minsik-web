<script setup lang="ts">
import type { FavouriteEntry } from '~/types/user'

const props = defineProps<{
  entry: FavouriteEntry
  eager?: boolean
}>()

const favouritesStore = useFavouritesStore()

async function remove() {
  await favouritesStore.removeFavourite(props.entry.book_slug)
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
    :eager="eager"
  >
    <template #topRight>
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
    </template>
  </BookUserItemBase>
</template>
