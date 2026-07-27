<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  books: BookSummary[]
  loading?: boolean
  emptyMessage?: string
  loadMore?: () => void | Promise<void>
  hasMore?: boolean
}

const props = defineProps<Props>()

const { t, n } = useI18n()

const scrollEnabled = computed(() => Boolean(props.loadMore) && props.hasMore)
const { sentinel } = useInfiniteScroll(() => props.loadMore?.(), { enabled: scrollEnabled })
const { optimized } = useOptimizedImage()

useShelfStatuses(() => props.books)

function formatSeriesPosition(position: number | null | undefined) {
  if (!position)
    return ''

  return Number.isInteger(position)
    ? `#${position.toFixed(0)}`
    : `#${position.toFixed(1)}`
}
</script>

<template>
  <div>
    <!-- Books List -->
    <div
      v-if="books && books.length > 0"
      class="books-list"
    >
      <NuxtLinkLocale
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
            class="position-relative flex-shrink-0"
            style="width: 120px; height: 180px;"
          >
            <v-img
              :src="optimized(book.primary_cover_url, 240)"
              :alt="book.title"
              width="120"
              height="180"
              cover
            >
              <template #placeholder>
                <HashedFill :color="coverColor(book)" />
              </template>
            </v-img>

            <v-badge
              v-if="book.series_position"
              :content="formatSeriesPosition(book.series_position)"
              color="primary"
              class="position-absolute"
              style="top: 20px; left: 20px;"
            />

            <BookShelfBadge :book-id="book.book_id" />
          </div>

          <v-card-text class="flex-grow-1">
            <h3 class="text-h6 font-weight-bold mb-1">
              {{ book.title }}
            </h3>

            <div
              v-if="book.authors && book.authors.length > 0"
              class="mb-2"
            >
              <template
                v-for="(author, index) in book.authors"
                :key="author.author_id"
              >
                <NuxtLinkLocale
                  :to="`/authors/${author.slug}`"
                  class="text-body-2 text-medium-emphasis text-decoration-none author-link"
                  @click.stop
                >
                  {{ author.name }}
                </NuxtLinkLocale>

                <span
                  v-if="index < book.authors.length - 1"
                  class="text-body-2 text-medium-emphasis"
                >, </span>
              </template>
            </div>

            <div class="d-flex mb-3 flex-wrap gap-3">
              <div class="d-flex align-center gap-1">
                <v-icon
                  icon="mdi-star"
                  size="small"
                  color="warning"
                />

                <span class="text-body-2">
                  {{ weightedRating(book.avg_rating, book.rating_count, book.ol_avg_rating, book.ol_rating_count).toFixed(1) }} ({{ n(totalRatingCount(book.rating_count, book.ol_rating_count)) }})
                </span>

                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  <div>
                    {{ t('stats.minsikRatings', {'rating': book.avg_rating.toFixed(1),
                                                 'count': n(book.rating_count)}) }}
                  </div>

                  <div class="mt-1">
                    {{ t('stats.olRatings', {'rating': book.ol_avg_rating.toFixed(1),
                                             'count': n(book.ol_rating_count)}) }}
                  </div>
                </v-tooltip>
              </div>

              <div class="d-flex align-center gap-1">
                <v-icon
                  icon="mdi-account-multiple"
                  size="small"
                  color="info"
                />

                <span class="text-body-2">{{ n(totalReaders(book.app_want_to_read_count, book.app_reading_count, book.app_read_count, book.ol_want_to_read_count, book.ol_currently_reading_count, book.ol_already_read_count)) }}</span>

                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  <div>{{ t('stats.minsikWantToRead', {'count': n(book.app_want_to_read_count ?? 0)}) }}</div>

                  <div>{{ t('stats.minsikReading', {'count': n(book.app_reading_count ?? 0)}) }}</div>

                  <div>{{ t('stats.minsikRead', {'count': n(book.app_read_count ?? 0)}) }}</div>

                  <div class="mt-1">
                    {{ t('stats.olWantToRead', {'count': n(book.ol_want_to_read_count ?? 0)}) }}
                  </div>

                  <div>{{ t('stats.olReading', {'count': n(book.ol_currently_reading_count ?? 0)}) }}</div>

                  <div>{{ t('stats.olRead', {'count': n(book.ol_already_read_count ?? 0)}) }}</div>
                </v-tooltip>
              </div>
            </div>

            <p
              v-if="book.description"
              class="text-body-2"
              :class="book.authors && book.authors.length > 0
                ? 'line-clamp-2'
                : 'line-clamp-3'"
              style="white-space: pre-line;"
            >
              {{ book.description }}
            </p>
          </v-card-text>
        </v-card>
      </NuxtLinkLocale>
    </div>

    <!-- No Books State -->
    <v-alert
      v-else-if="!loading"
      type="info"
      variant="tonal"
    >
      {{ emptyMessage ?? t('books.emptyList') }}
    </v-alert>

    <!-- Loading -->
    <Transition name="fade">
      <div
        v-if="loading"
        class="py-8 text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
    </Transition>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinel" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-item {
  display: block;
}

.author-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

.book-item:hover h3 {
  color: rgb(var(--v-theme-primary));
  transition: color 0.15s ease;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
