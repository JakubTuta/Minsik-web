<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { totalRatingCount, weightedRating } from '~/utils/format'

interface Props {
  books: BookSummary[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
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
    second ? { book: second, rank: 2, cardTopClass: 'mt-8' } : null,
    first ? { book: first, rank: 1, cardTopClass: '' } : null,
    third ? { book: third, rank: 3, cardTopClass: 'mt-14' } : null,
  ].filter(Boolean) as { book: BookSummary, rank: number, cardTopClass: string }[]
})
</script>

<template>
  <div
    v-if="loading || books.length > 0"
    class=""
  >
    <h2 class="text-h5 font-weight-bold">
      Most acclaimed
    </h2>

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
    <v-row v-else>
      <v-col
        v-for="entry in podiumOrder"
        :key="entry.rank"
        cols="12"
        md="4"
      >
        <v-card :class="['h-full', entry.cardTopClass]">
          <v-card-text class="pa-4">
            <!-- Cover + rank -->
            <div
              class="position-relative mb-3"
              style="height: 180px;"
            >
              <v-img
                :src="entry.book.primary_cover_url || undefined"
                lazy-src="/placeholder-book-lazy.jpg"
                :alt="entry.book.title"
                width="120"
                height="180"
                contain
                position="left center"
                class="rounded"
                style="position: absolute; left: 0; top: 0;"
              />

              <span
                class="text-h2 font-weight-bold text-primary"
                style="position: absolute; right: 0; top: 0; opacity: 0.2; font-style: italic; line-height: 1; user-select: none;"
              >
                #{{ entry.rank }}
              </span>
            </div>

            <!-- Title (only this is a link) -->
            <NuxtLink
              :to="`/books/${entry.book.slug}`"
              class="text-decoration-none book-title-link"
            >
              <p class="text-subtitle-1 font-weight-bold book-title mb-1">
                {{ entry.book.title }}
              </p>
            </NuxtLink>

            <!-- Year -->
            <p
              v-if="entry.book.original_publication_year"
              class="text-body-2 text-medium-emphasis mb-2"
            >
              {{ entry.book.original_publication_year }}
            </p>

            <!-- Rating -->
            <RatingDisplay
              :rating="bookWeightedRating(entry.book)"
              :rating-count="bookTotalRatings(entry.book)"
              size="small"
              class="mb-3"
            />

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
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.book-title {
  color: rgb(var(--v-theme-on-surface));
  transition: color 0.15s ease;
}

.book-title-link:hover .book-title {
  color: rgb(var(--v-theme-primary));
}
</style>
