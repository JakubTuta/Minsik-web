<script setup lang="ts">
import type { Author, Book, BookSummary } from '~/types/api'
import { compactNumberFormat, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  book: Book
  author?: Author | null
  authorBooks?: BookSummary[]
  authorWorksCount?: number | null
  seriesBooks?: BookSummary[]
}

const props = withDefaults(defineProps<Props>(), {
  author: null,
  authorBooks: () => [],
  authorWorksCount: null,
  seriesBooks: () => [],
})

const { t, n, locale } = useI18n()

type Scope = 'author' | 'series'

const scope = ref<Scope>('author')

const hasSeries = computed(() => !!props.book.series && props.seriesBooks.length > 1)
const hasAuthor = computed(() => props.authorBooks.length > 1)

watchEffect(() => {
  if (!hasAuthor.value && hasSeries.value)
    scope.value = 'series'
})

const bookRating = computed(() => weightedRating(
  props.book.avg_rating,
  props.book.rating_count,
  props.book.ol_avg_rating,
  props.book.ol_rating_count,
))

const bookReaders = computed(() => totalReaders(
  props.book.app_want_to_read_count,
  props.book.app_reading_count,
  props.book.app_read_count,
  props.book.ol_want_to_read_count,
  props.book.ol_currently_reading_count,
  props.book.ol_already_read_count,
))

function summaryRating(item: BookSummary): number {
  return weightedRating(item.avg_rating, item.rating_count, item.ol_avg_rating, item.ol_rating_count)
}

function summaryReaders(item: BookSummary): number {
  return totalReaders(
    item.app_want_to_read_count,
    item.app_reading_count,
    item.app_read_count,
    item.ol_want_to_read_count,
    item.ol_currently_reading_count,
    item.ol_already_read_count,
  )
}

const peers = computed(() => (scope.value === 'series'
  ? props.seriesBooks
  : props.authorBooks))

/**
 * The author list is capped at one page, so its size is only the true catalogue
 * size for authors small enough to fit. `works_count` from the stats endpoint
 * is the honest denominator; a series list is always complete.
 */
const universeSize = computed(() => (scope.value === 'series'
  ? props.seriesBooks.length
  : props.authorWorksCount ?? props.authorBooks.length))

const isPartialSample = computed(() => scope.value === 'author'
  && universeSize.value > props.authorBooks.length)

const catalogueRating = computed(() => {
  if (scope.value === 'author' && props.author) {
    return weightedRating(
      props.author.books_avg_rating,
      props.author.books_total_ratings,
      props.author.books_ol_avg_rating,
      props.author.books_ol_total_ratings,
    )
  }

  const rated = peers.value.filter(item => summaryRating(item) > 0)
  if (rated.length === 0)
    return 0

  return rated.reduce((sum, item) => sum + summaryRating(item), 0) / rated.length
})

const ratingDelta = computed(() => bookRating.value - catalogueRating.value)

const averageReaders = computed(() => {
  if (peers.value.length === 0)
    return 0

  return peers.value.reduce((sum, item) => sum + summaryReaders(item), 0) / peers.value.length
})

const readerRatio = computed(() => (averageReaders.value > 0
  ? bookReaders.value / averageReaders.value
  : 0))

const ratingRank = computed(() => {
  const rating = bookRating.value
  if (!rating)
    return null

  const better = peers.value.filter(item => item.book_id !== props.book.book_id && summaryRating(item) > rating).length

  // Outside the sample there may be books this page never saw, so a rank
  // computed from a partial page can only be stated as an upper bound.
  return better + 1
})

const compactFmt = computed(() => compactNumberFormat(locale.value))

const scopeLabel = computed(() => (scope.value === 'series'
  ? props.book.series?.name ?? t('bookPage.compareSeries')
  : props.author?.name ?? t('bookPage.compareAuthor')))

const barWidth = (value: number) => `${Math.min(100, Math.max(2, (value / 5) * 100))}%`
</script>

<template>
  <div v-if="hasAuthor || hasSeries">
    <SectionHeading
      :eyebrow="t('bookPage.compareEyebrow')"
      :title="ratingDelta >= 0
        ? t('bookPage.compareTitleAbove', {'name': scopeLabel})
        : t('bookPage.compareTitleBelow', {'name': scopeLabel})"
      :subtitle="t('bookPage.compareSubtitle')"
    >
      <template
        v-if="hasAuthor && hasSeries"
        #actions
      >
        <v-btn-toggle
          v-model="scope"
          mandatory
          divided
          rounded="pill"
          density="comfortable"
          color="primary"
        >
          <v-btn
            value="author"
            size="small"
          >
            {{ t('bookPage.compareAuthor') }}
          </v-btn>

          <v-btn
            value="series"
            size="small"
          >
            {{ t('bookPage.compareSeries') }}
          </v-btn>
        </v-btn-toggle>
      </template>
    </SectionHeading>

    <v-card>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <div class="text-overline text-medium-emphasis mb-2">
              {{ t('stats.rating') }}
            </div>

            <div class="d-flex flex-wrap gap-3 align-baseline">
              <span class="font-display tabular text-h3 font-weight-bold">{{ bookRating.toFixed(2) }}</span>

              <v-chip
                size="small"
                variant="tonal"
                :color="ratingDelta >= 0
                  ? 'success'
                  : 'warning'"
              >
                {{ t('bookPage.compareDelta', {
                  'delta': `${ratingDelta >= 0
                    ? '+'
                    : ''}${ratingDelta.toFixed(2)}`,
                }) }}
              </v-chip>
            </div>

            <div class="compare-track mt-4">
              <div
                class="compare-fill"
                :style="{'width': barWidth(bookRating)}"
              />

              <div
                class="compare-marker"
                :style="{'left': barWidth(catalogueRating)}"
              />
            </div>

            <div class="text-caption text-medium-emphasis mt-2">
              {{ t('bookPage.compareCatalogueAverage', {'value': catalogueRating.toFixed(2)}) }}
            </div>
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <div class="text-overline text-medium-emphasis mb-2">
              {{ t('stats.readers') }}
            </div>

            <div class="d-flex flex-wrap gap-3 align-baseline">
              <span class="font-display tabular text-h3 font-weight-bold text-info">{{ compactFmt.format(bookReaders) }}</span>

              <v-chip
                v-if="readerRatio > 0"
                size="small"
                variant="tonal"
              >
                {{ t('bookPage.compareReaderRatio', {'value': readerRatio.toFixed(1)}) }}
              </v-chip>
            </div>

            <div class="text-caption text-medium-emphasis mt-4">
              {{ t('bookPage.compareAverageReaders', {'value': n(Math.round(averageReaders))}) }}
            </div>
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <div class="text-overline text-medium-emphasis mb-2">
              {{ t('bookPage.compareRank') }}
            </div>

            <div class="d-flex flex-wrap gap-3 align-baseline">
              <span class="font-display tabular text-h3 font-weight-bold">
                {{ isPartialSample
                  ? `≤ #${ratingRank}`
                  : `#${ratingRank}` }}
              </span>

              <span class="text-body-2 text-medium-emphasis">
                {{ t('bookPage.compareRankOf', {'count': n(universeSize)}) }}
              </span>
            </div>

            <div class="text-caption text-medium-emphasis mt-4">
              {{ isPartialSample
                ? t('bookPage.compareRankPartial', {'count': authorBooks.length})
                : t('bookPage.compareRankExact') }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.compare-track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.1);
  overflow: visible;
}

.compare-fill {
  height: 100%;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
}

.compare-marker {
  position: absolute;
  top: -5px;
  width: 2px;
  height: 20px;
  background: rgb(var(--v-theme-on-surface));
  opacity: 0.55;
}
</style>
