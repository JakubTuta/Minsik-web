<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { formatSeriesPosition, totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  books: BookSummary[]
  loading?: boolean
  emptyMessage?: string
  loadMore?: () => void | Promise<void>
  hasMore?: boolean
}

const props = defineProps<Props>()

const { t, n, locale } = useI18n()
const languageNames = computed(() => new Intl.DisplayNames([locale.value], { type: 'language' }))

// Only series listings can show a volume in a language other than the reader's.
function otherLanguageNote(book: BookSummary): string | null {
  if (book.available_in_language !== false || !book.language)
    return null

  return t('books.shownInLanguage', { language: languageNames.value.of(book.language) ?? book.language })
}

const scrollEnabled = computed(() => Boolean(props.loadMore) && props.hasMore)
const { sentinel } = useInfiniteScroll(() => props.loadMore?.(), { enabled: scrollEnabled })

useShelfStatuses(() => props.books)

// Precomputed per template re-render rather than inline in the template —
// Vuetify re-renders every mounted component on a theme toggle, which would
// otherwise re-run coverColor/weightedRating/totalRatingCount/totalReaders
// for the whole (unboundedly long, infinite-scroll) list on every toggle.
// This only recomputes when `books` itself changes (e.g. a new page appended).
const rows = computed(() => props.books.map(book => ({
  book,
  languageNote: otherLanguageNote(book),
  coverBg: coverColor(book),
  rating: weightedRating(book.avg_rating, book.rating_count, book.ol_avg_rating, book.ol_rating_count),
  ratingCount: totalRatingCount(book.rating_count, book.ol_rating_count),
  readers: totalReaders(book.app_want_to_read_count, book.app_reading_count, book.app_read_count, book.ol_want_to_read_count, book.ol_currently_reading_count, book.ol_already_read_count),
})))
</script>

<template>
  <div>
    <div
      v-if="books && books.length > 0"
      class="books-list"
    >
      <div
        v-for="{book, languageNote, coverBg, rating, ratingCount, readers} in rows"
        :key="book.book_id"
        class="book-item position-relative"
      >
        <v-card
          hover
          class="d-flex h-100 flex-row"
        >
          <div
            class="position-relative flex-shrink-0"
            style="width: 120px; height: 180px;"
          >
            <BookCover
              :title="book.title"
              :src="book.primary_cover_url"
              :width="120"
              :height="180"
              fit="cover"
              :fallback-color="coverBg"
            />

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
              <NuxtLinkLocale
                :to="`/books/${book.slug}`"
                class="book-title-link text-decoration-none"
              >
                {{ book.title }}
              </NuxtLinkLocale>
            </h3>

            <v-chip
              v-if="languageNote"
              size="x-small"
              variant="tonal"
              prepend-icon="mdi-translate"
              class="author-link mb-2"
            >
              {{ languageNote }}
            </v-chip>

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
                >
                  {{ author.name }}
                </NuxtLinkLocale>

                <span
                  v-if="index < book.authors.length - 1"
                  class="text-body-2 text-medium-emphasis"
                >, </span>
              </template>
            </div>

            <div class="d-flex stat-row mb-3 flex-wrap gap-3">
              <div class="d-flex align-center gap-1">
                <v-icon
                  icon="mdi-star"
                  size="small"
                  color="warning"
                />

                <span class="text-body-2">
                  {{ rating.toFixed(1) }} ({{ n(ratingCount) }})
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

                <span class="text-body-2">{{ n(readers) }}</span>

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
      </div>
    </div>

    <v-alert
      v-else-if="!loading"
      type="info"
      variant="tonal"
    >
      {{ emptyMessage ?? t('books.emptyList') }}
    </v-alert>

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

/* The title link stretches over the whole card, so the card is one click target
   without nesting the author links inside another anchor. */
.book-title-link {
  color: inherit;
}

.book-title-link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

.author-link,
.stat-row {
  position: relative;
  z-index: 2;
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
