<script setup lang="ts">
import type { Book } from '~/types/api'

interface Props {
  books: Book[]
  loading?: boolean
  emptyMessage?: string
  loadMore?: () => void | Promise<void>
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: 'No books found.',
})

const scrollEnabled = computed(() => Boolean(props.loadMore) && props.hasMore)
useInfiniteScroll(() => props.loadMore?.(), { enabled: scrollEnabled })

function weightedRating(book: Book): number {
  const olRating = Number(book.ol_avg_rating ?? 0)
  const total = book.rating_count + (book.ol_rating_count ?? 0)

  if (total === 0)
    return 0

  return ((book.avg_rating * book.rating_count) + (olRating * (book.ol_rating_count ?? 0))) / total
}

function totalRatingCount(book: Book): number {
  return book.rating_count + (book.ol_rating_count ?? 0)
}

function totalReaders(book: Book): number {
  const app = (book.app_want_to_read_count ?? 0) + (book.app_reading_count ?? 0) + (book.app_read_count ?? 0)
  const ol = (book.ol_want_to_read_count ?? 0) + (book.ol_currently_reading_count ?? 0) + (book.ol_already_read_count ?? 0)

  return app + ol
}
</script>

<template>
  <div>
    <!-- Books List -->
    <div
      v-if="books && books.length > 0"
      class="books-list"
    >
      <NuxtLink
        v-for="book in books"
        :key="book.book_id"
        :to="`/books/${book.slug}`"
        class="book-item text-decoration-none"
      >
        <v-card
          hover
          class="d-flex h-100 flex-row"
        >
          <div
            class="flex-shrink-0"
            style="width: 120px; height: 180px;"
          >
            <v-img
              :src="book.primary_cover_url || '/placeholder-book.jpg'"
              :alt="book.title"
              width="120"
              height="180"
              cover
            />
          </div>

          <v-card-text class="flex-grow-1">
            <h3 class="text-h6 font-weight-bold mb-2">
              {{ book.title }}
            </h3>

            <div class="d-flex mb-3 flex-wrap gap-3">
              <div
                v-if="book.original_publication_year"
                class="d-flex align-center gap-1"
              >
                <v-icon
                  icon="mdi-calendar"
                  size="small"
                  color="secondary"
                />

                <span class="text-body-2">{{ book.original_publication_year }}</span>
              </div>

              <div class="d-flex align-center gap-1">
                <v-icon
                  icon="mdi-star"
                  size="small"
                  color="warning"
                />

                <span class="text-body-2">
                  {{ weightedRating(book).toFixed(1) }} ({{ totalRatingCount(book).toLocaleString() }})
                </span>

                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  <div>Minsik: {{ book.avg_rating.toFixed(1) }} ({{ book.rating_count }} ratings)</div>

                  <div class="mt-1">
                    Open Library: {{ Number(book.ol_avg_rating ?? 0).toFixed(1) }} ({{ book.ol_rating_count ?? 0 }} ratings)
                  </div>
                </v-tooltip>
              </div>

              <div class="d-flex align-center gap-1">
                <v-icon
                  icon="mdi-account-multiple"
                  size="small"
                  color="info"
                />

                <span class="text-body-2">{{ totalReaders(book).toLocaleString() }}</span>

                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  <div>Minsik - Want to Read: {{ (book.app_want_to_read_count ?? 0).toLocaleString() }}</div>

                  <div>Minsik - Reading: {{ (book.app_reading_count ?? 0).toLocaleString() }}</div>

                  <div>Minsik - Read: {{ (book.app_read_count ?? 0).toLocaleString() }}</div>

                  <div class="mt-1">
                    Open Library - Want to Read: {{ (book.ol_want_to_read_count ?? 0).toLocaleString() }}
                  </div>

                  <div>Open Library - Reading: {{ (book.ol_currently_reading_count ?? 0).toLocaleString() }}</div>

                  <div>Open Library - Read: {{ (book.ol_already_read_count ?? 0).toLocaleString() }}</div>
                </v-tooltip>
              </div>
            </div>

            <p
              v-if="book.description"
              class="text-body-2 line-clamp-3"
              style="white-space: pre-line;"
            >
              {{ book.description }}
            </p>
          </v-card-text>
        </v-card>
      </NuxtLink>
    </div>

    <!-- No Books State -->
    <v-alert
      v-else-if="!loading"
      type="info"
      variant="tonal"
    >
      {{ emptyMessage }}
    </v-alert>

    <!-- Loading Books -->
    <div
      v-if="loading"
      class="py-8"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        class="d-block mx-auto"
      />
    </div>
  </div>
</template>

<style scoped>
.books-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-item {
  display: block;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
