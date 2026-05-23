<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { totalRatingCount, weightedRating } from '~/utils/format'

interface Props {
  books: BookSummary[]
  loading?: boolean
  booksCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  booksCount: 0,
})

function bookWeightedRating(book: BookSummary): number {
  return weightedRating(book.avg_rating, book.rating_count, book.ol_avg_rating, book.ol_rating_count)
}

function bookTotalRatings(book: BookSummary): number {
  return totalRatingCount(book.rating_count, book.ol_rating_count)
}

// Arrange: #2 left, #1 middle, #3 right (podium)
const podiumOrder = computed(() => {
  if (props.books.length === 0)
    return []
  const [first, second, third] = props.books
  return [
    second ? { book: second, rank: 2, topPadding: 'pt-6' } : null,
    first ? { book: first, rank: 1, topPadding: '' } : null,
    third ? { book: third, rank: 3, topPadding: 'pt-10' } : null,
  ].filter(Boolean) as { book: BookSummary, rank: number, topPadding: string }[]
})
</script>

<template>
  <div
    v-if="loading || books.length > 0"
    class="mb-8"
  >
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">
        Most acclaimed
      </h2>

      <NuxtLink
        v-if="booksCount > 0"
        to="#books-list"
        class="text-primary text-decoration-none text-body-2"
      >
        All {{ booksCount }} books →
      </NuxtLink>
    </div>

    <!-- Skeleton -->
    <v-row v-if="loading">
      <v-col
        v-for="i in 3"
        :key="i"
        cols="12"
        md="4"
      >
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <!-- Podium -->
    <v-row
      v-else
      align="end"
    >
      <v-col
        v-for="entry in podiumOrder"
        :key="entry.rank"
        cols="12"
        md="4"
        :class="entry.topPadding"
      >
        <NuxtLink
          :to="`/books/${entry.book.slug}`"
          class="text-decoration-none"
        >
          <v-card class="h-full">
            <v-card-text class="pa-4">
              <!-- Cover + rank row -->
              <div class="d-flex justify-space-between align-start mb-3">
                <v-img
                  :src="entry.book.primary_cover_url || undefined"
                  lazy-src="/placeholder-book-lazy.jpg"
                  :alt="entry.book.title"
                  width="100"
                  height="150"
                  cover
                  class="rounded flex-shrink-0"
                />

                <span
                  class="text-h3 font-weight-bold text-medium-emphasis"
                  style="opacity: 0.25; font-style: italic; line-height: 1; user-select: none;"
                >
                  #{{ entry.rank }}
                </span>
              </div>

              <!-- Title -->
              <p class="text-subtitle-1 font-weight-bold book-title mb-1">
                {{ entry.book.title }}
              </p>

              <!-- Year -->
              <p
                v-if="entry.book.original_publication_year"
                class="text-body-2 text-medium-emphasis mb-2"
              >
                {{ entry.book.original_publication_year }}
              </p>

              <!-- Rating -->
              <div class="d-flex align-center gap-2 mb-3">
                <RatingDisplay
                  :rating="bookWeightedRating(entry.book)"
                  :rating-count="bookTotalRatings(entry.book)"
                  size="small"
                />
              </div>

              <!-- Description -->
              <p
                v-if="entry.book.description"
                class="text-body-2 text-medium-emphasis"
                style="-webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;"
              >
                {{ entry.book.description }}
              </p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.book-title {
  transition: color 0.15s ease;
}

a:hover .book-title {
  color: rgb(var(--v-theme-primary));
}
</style>
