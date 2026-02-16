<script setup lang="ts">
import type { BookshelfEntry, BookshelfStatus } from '~/types/user'

const props = defineProps<{
  entry: BookshelfEntry
}>()

const statusConfig: Record<BookshelfStatus, { label: string, color: string, icon: string }> = {
  want_to_read: { label: 'Want to Read', color: 'orange', icon: 'mdi-bookmark-outline' },
  reading: { label: 'Reading', color: 'blue', icon: 'mdi-book-open-page-variant' },
  read: { label: 'Read', color: 'green', icon: 'mdi-check-circle' },
  abandoned: { label: 'Abandoned', color: 'grey', icon: 'mdi-close-circle' },
}

const status = computed(() => statusConfig[props.entry.status])
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

      <div class="min-w-0 flex-grow-1">
        <div class="d-flex justify-space-between flex-wrap gap-2 align-start">
          <div class="min-w-0">
            <div class="text-body-1 font-weight-medium text-truncate">
              {{ entry.book.title }}
            </div>

            <div class="text-caption text-medium-emphasis text-truncate">
              {{ authors }}
            </div>
          </div>

          <v-chip
            :color="status.color"
            :prepend-icon="status.icon"
            size="x-small"
            variant="tonal"
            class="flex-shrink-0"
          >
            {{ status.label }}
          </v-chip>
        </div>

        <div class="d-flex align-center mt-2 flex-wrap gap-3">
          <div
            v-if="entry.book.series"
            class="text-caption text-medium-emphasis"
          >
            {{ entry.book.series.name }}
            <span v-if="entry.book.series_position">#{{ entry.book.series_position }}</span>
          </div>

          <div class="text-caption text-disabled ml-auto">
            Added {{ addedDate }}
          </div>
        </div>
      </div>
    </v-card>
  </NuxtLink>
</template>
