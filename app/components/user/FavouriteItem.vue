<script setup lang="ts">
import type { FavouriteEntry } from '~/types/user'

const props = defineProps<{
  entry: FavouriteEntry
}>()

const authors = computed(() => props.entry.book.authors.map(a => a.name).join(', '))
const addedDate = computed(() => new Date(props.entry.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }))
</script>

<template>
  <NuxtLink
    :to="`/books/${entry.book.slug}`"
    class="text-decoration-none"
  >
    <v-card
      variant="outlined"
      class="d-flex flex-row gap-3 pa-3"
      hover
    >
      <v-img
        :src="entry.book.primary_cover_url || undefined"
        lazy-src="/placeholder-book-lazy.jpg"
        :alt="entry.book.title"
        width="60"
        height="90"
        cover
        rounded="sm"
        class="flex-shrink-0"
      />

      <div class="d-flex flex-column min-w-0 flex-grow-1 justify-center">
        <div class="d-flex justify-space-between gap-2 align-start">
          <div class="min-w-0">
            <div class="text-body-1 font-weight-medium text-truncate">
              {{ entry.book.title }}
            </div>

            <div class="text-caption text-medium-emphasis text-truncate">
              {{ authors }}
            </div>

            <div
              v-if="entry.book.series"
              class="text-caption text-medium-emphasis mt-1"
            >
              {{ entry.book.series.name }}
              <span v-if="entry.book.series_position">#{{ entry.book.series_position }}</span>
            </div>
          </div>

          <v-icon
            icon="mdi-heart"
            color="red"
            size="20"
            class="flex-shrink-0"
          />
        </div>

        <div class="text-caption text-disabled mt-2">
          Favourited {{ addedDate }}
        </div>
      </div>
    </v-card>
  </NuxtLink>
</template>
