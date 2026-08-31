<script setup lang="ts">
import type { Author, AuthorMinimal, BookSummary, Series } from '~/types/api'
import { totalReaders } from '~/utils/format'
import { formatReadingTime } from '~/utils/readingTime'

interface Props {
  series: Series
  books: BookSummary[]
  authors: AuthorMinimal[]
  primaryAuthor?: Author | null
}

const props = withDefaults(defineProps<Props>(), {
  primaryAuthor: null,
})

const { t, n } = useI18n()

const combinedReaders = computed(() => totalReaders(
  props.series.app_want_to_read_count,
  props.series.app_reading_count,
  props.series.app_read_count,
  props.series.ol_want_to_read_count,
  props.series.ol_currently_reading_count,
  props.series.ol_already_read_count,
))

const publicationSpan = computed(() => {
  const years = props.books
    .map(book => book.original_publication_year)
    .filter((year): year is number => !!year)

  if (years.length === 0)
    return null

  const first = Math.min(...years)
  const last = Math.max(...years)

  return first === last
    ? String(first)
    : `${first}–${last}`
})

const totalPages = computed(() => {
  if (props.series.total_pages > 0)
    return props.series.total_pages

  return props.books.reduce((sum, b) => sum + (b.number_of_pages ?? 0), 0)
})

const seriesReadingTime = computed(() => formatReadingTime(totalPages.value))

const seriesStats = computed(() => {
  const items: Array<{ icon: string, value: string | number, label: string }> = [
    {
      icon: 'mdi-book-multiple',
      value: props.books.length > 0
        ? props.books.length
        : (props.series.total_books ?? 0),
      label: t('stats.books'),
    },
    {
      icon: 'mdi-book-open-page-variant',
      value: n(totalPages.value),
      label: t('book.pages'),
    },
    {
      icon: 'mdi-clock-outline',
      value: seriesReadingTime.value
        ? `~${seriesReadingTime.value}`
        : '—',
      label: t('book.readingTime'),
    },
    {
      icon: 'mdi-account-multiple',
      value: n(combinedReaders.value),
      label: t('stats.readers'),
    },
  ]

  return items
})
</script>

<template>
  <v-card>
    <v-row
      no-gutters
      class="pa-2"
    >
      <!-- Covers + progress, the way the book page stacks its shelf panel -->
      <v-col
        cols="12"
        md="3"
        class="pa-6"
      >
        <SeriesCoverStack :books="books" />

        <ClientOnly>
          <SeriesProgressCard
            :books="books"
            :total-pages="series.total_pages ?? 0"
            class="mt-6"
          />
        </ClientOnly>
      </v-col>

      <!-- Series Info -->
      <v-col
        cols="12"
        md="6"
      >
        <v-card-text class="d-flex flex-column h-100">
          <div>
            <div class="text-secondary text-overline mb-2">
              {{ t('series.bookSeries') }}

              <span v-if="publicationSpan"> · {{ publicationSpan }}</span>
            </div>

            <h1 class="font-display text-h3 font-weight-bold">
              {{ series.name }}
            </h1>

            <!-- Authors line -->
            <div
              v-if="authors.length > 0"
              class="text-body-1 mt-2"
            >
              {{ t('book.byAuthor') }}
              <template
                v-for="(author, i) in authors"
                :key="author.author_id"
              >
                <NuxtLinkLocale
                  :to="`/authors/${author.slug}`"
                  class="font-weight-bold text-primary text-decoration-none"
                >
                  {{ author.name }}
                </NuxtLinkLocale>

                <span v-if="i < authors.length - 1">, </span>
              </template>
            </div>

            <!-- Ratings Card -->
            <v-card
              class="mt-8"
              flat
              color="background"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-stretch">
                  <div class="d-flex flex-column align-center flex-1 pa-2 text-center">
                    <div class="text-caption text-secondary mb-1">
                      {{ t('book.minsikReaders') }}
                    </div>

                    <div class="text-h4 font-weight-bold text-primary">
                      {{ (series.avg_rating ?? 0).toFixed(1) }}
                    </div>

                    <v-rating
                      :model-value="Math.floor((series.avg_rating ?? 0) * 2) / 2"
                      readonly
                      half-increments
                      color="warning"
                      active-color="warning"
                      density="compact"
                      size="small"
                    />

                    <div class="text-caption text-secondary mt-1">
                      {{ t('stats.ratingsCountPlain', {"count": n(series.rating_count ?? 0)}) }}
                    </div>
                  </div>

                  <v-divider vertical />

                  <div class="d-flex flex-column align-center flex-1 pa-2 text-center">
                    <div class="text-caption text-secondary mb-1">
                      {{ t('book.otherPlatforms') }}
                    </div>

                    <div class="text-h4 font-weight-bold text-primary">
                      {{ (series.ol_avg_rating ?? 0).toFixed(1) }}
                    </div>

                    <v-rating
                      :model-value="Math.floor((series.ol_avg_rating ?? 0) * 2) / 2"
                      readonly
                      half-increments
                      color="warning"
                      active-color="warning"
                      density="compact"
                      size="small"
                    />

                    <div class="text-caption text-secondary mt-1">
                      {{ t('stats.ratingsCountPlain', {"count": n(series.ol_rating_count ?? 0)}) }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Stats Row -->
            <StatsRow
              :stats="seriesStats"
              class="mt-6"
            />

            <CategoriesChips
              v-if="series.genres?.length"
              :categories="series.genres"
              hide-label
              class="mt-6"
            />
          </div>
        </v-card-text>
      </v-col>

      <!-- Author Section -->
      <v-col
        v-if="primaryAuthor"
        cols="12"
        md="3"
      >
        <AuthorShortCard :author="primaryAuthor" />
      </v-col>
    </v-row>
  </v-card>
</template>
