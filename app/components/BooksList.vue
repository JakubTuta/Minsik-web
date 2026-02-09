<script setup lang="ts">
import type { Book } from '~/types/api'

interface Props {
  books: Book[]
  loading?: boolean
  emptyMessage?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No books found.',
})
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
              lazy-src="/placeholder-book-lazy.jpg"
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

                <span class="text-body-2">{{ book.avg_rating
                  ? book.avg_rating.toFixed(1)
                  : '0.0' }}</span>
              </div>

              <div class="d-flex align-center gap-1">
                <v-icon
                  icon="mdi-eye"
                  size="small"
                  color="info"
                />

                <span class="text-body-2">{{ book.view_count
                  ? book.view_count.toLocaleString()
                  : '0' }}</span>
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
