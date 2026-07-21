<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { totalRatingCount, weightedRating } from '~/utils/format'

interface Props {
  books: BookSummary[]
  loading?: boolean
}

const props = defineProps<Props>()

const { optimized } = useOptimizedImage()

useShelfStatuses(() => props.books)

function bookWeightedRating(book: BookSummary): number {
  return weightedRating(book.avg_rating, book.rating_count, book.ol_avg_rating, book.ol_rating_count)
}

function bookTotalRatings(book: BookSummary): number {
  return totalRatingCount(book.rating_count, book.ol_rating_count)
}

// Mobile: natural rank order, no offsets. Desktop: podium (#2 left, #1 middle, #3 right) via md: order + offset classes.
const podiumOrder = computed(() => {
  return props.books.slice(0, 3).map((book, i) => {
    const rank = i + 1
    const mdOrderClass = rank === 1
      ? 'md:order-2'
      : rank === 2
        ? 'md:order-1'
        : 'md:order-3'
    const cardTopClass = rank === 2
      ? 'md:mt-8'
      : rank === 3
        ? 'md:mt-14'
        : ''

    return { book, rank, cardTopClass: `${cardTopClass} ${mdOrderClass}`.trim() }
  })
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
        <v-card
          class="h-full"
          :class="[entry.cardTopClass]"
        >
          <v-card-text class="pa-4">
            <!-- Cover + rank -->
            <div
              class="position-relative mb-3"
              style="height: 180px;"
            >
              <div
                class="position-relative overflow-hidden rounded"
                style="position: absolute; left: 0; top: 0; width: 120px; height: 180px;"
              >
                <v-img
                  :src="optimized(entry.book.primary_cover_url, 320)"
                  lazy-src="/placeholder-book-lazy.jpg"
                  :alt="entry.book.title"
                  width="120"
                  height="180"
                  contain
                  position="left center"
                />

                <BookShelfBadge :book-id="entry.book.book_id" />
              </div>

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
