<script setup lang="ts">
import type { AuditAuthorItem, AuditBookItem, AuditSeriesItem } from '~/types/admin'

definePageMeta({ middleware: 'admin' })
useSeo({ title: 'Data Quality Review', description: 'Review low-quality books, authors, and series flagged for manual cleanup.' })

const BOOK_AUTHORS_CEILING = 20
const BOOK_GENRES_CEILING = 30
const AUTHOR_BOOKS_CEILING = 200
const SERIES_BOOKS_CEILING = 100
const UNBOUNDED = 1_000_000

function upperBound(value: number, ceiling: number) {
  return value >= ceiling
    ? UNBOUNDED
    : value
}

function rangeLabel(name: string, range: number[], ceiling: number) {
  const upper = range[1]! >= ceiling
    ? `${ceiling}+`
    : `${range[1]}`

  return `${name}: ${range[0]}-${upper}`
}

const qualityStore = useAdminQualityStore()

const bookFilters = reactive({
  limit: 20,
  authorRange: [0, BOOK_AUTHORS_CEILING],
  genreRange: [0, BOOK_GENRES_CEILING],
  language: '',
  checkMissingDescription: false,
  checkMissingCover: false,
  checkImplausibleYear: false,
  checkSuspiciousTitle: false,
})

const authorFilters = reactive({
  limit: 20,
  bookRange: [0, AUTHOR_BOOKS_CEILING],
  checkMissingBio: false,
  checkJunkName: false,
})

const seriesFilters = reactive({
  limit: 20,
  bookRange: [0, SERIES_BOOKS_CEILING],
  language: '',
  checkMissingDescription: false,
  checkCountDrift: false,
})

function formatIssue(issue: string) {
  return issue.replaceAll('_', ' ')
}

function bookChips(book: AuditBookItem) {
  return [
    `authors: ${book.author_count}`,
    `genres: ${book.genre_count}`,
    ...book.issues.map(formatIssue),
  ]
}

function authorChips(author: AuditAuthorItem) {
  return [
    `books: ${author.book_count}`,
    ...author.issues.map(formatIssue),
  ]
}

function seriesChips(series: AuditSeriesItem) {
  return [
    `books: ${series.book_count}`,
    `total: ${series.total_books}`,
    ...series.issues.map(formatIssue),
  ]
}

function fetchBooks() {
  qualityStore.fetchBooks({
    limit: bookFilters.limit,
    minAuthors: bookFilters.authorRange[0],
    maxAuthors: upperBound(bookFilters.authorRange[1]!, BOOK_AUTHORS_CEILING),
    minGenres: bookFilters.genreRange[0],
    maxGenres: upperBound(bookFilters.genreRange[1]!, BOOK_GENRES_CEILING),
    language: bookFilters.language,
    checkMissingDescription: bookFilters.checkMissingDescription,
    checkMissingCover: bookFilters.checkMissingCover,
    checkImplausibleYear: bookFilters.checkImplausibleYear,
    checkSuspiciousTitle: bookFilters.checkSuspiciousTitle,
  })
}

function fetchAuthors() {
  qualityStore.fetchAuthors({
    limit: authorFilters.limit,
    minBooks: authorFilters.bookRange[0],
    maxBooks: upperBound(authorFilters.bookRange[1]!, AUTHOR_BOOKS_CEILING),
    checkMissingBio: authorFilters.checkMissingBio,
    checkJunkName: authorFilters.checkJunkName,
  })
}

function fetchSeries() {
  qualityStore.fetchSeries({
    limit: seriesFilters.limit,
    minBooks: seriesFilters.bookRange[0],
    maxBooks: upperBound(seriesFilters.bookRange[1]!, SERIES_BOOKS_CEILING),
    language: seriesFilters.language,
    checkMissingDescription: seriesFilters.checkMissingDescription,
    checkCountDrift: seriesFilters.checkCountDrift,
  })
}
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center mb-6 gap-3">
      <v-icon
        icon="mdi-magnify-scan"
        size="32"
      />

      <div>
        <h1 class="text-h4">
          Data Quality Review
        </h1>

        <p class="text-secondary mb-0">
          Sliders restrict every result to the selected range. Each check narrows the sample further, so only the boxes you tick are applied
        </p>
      </div>
    </div>

    <!-- Books -->
    <v-card class="mb-6 pa-6">
      <h2 class="text-h6 mb-4">
        Books
      </h2>

      <v-row dense>
        <v-col
          cols="6"
          sm="3"
        >
          <v-text-field
            v-model.number="bookFilters.limit"
            type="number"
            label="Limit"
            density="compact"
            min="1"
            max="100"
          />
        </v-col>

        <v-col
          cols="6"
          sm="3"
        >
          <v-text-field
            v-model="bookFilters.language"
            label="Language (optional)"
            density="compact"
            placeholder="en"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col
          cols="12"
          sm="6"
        >
          <v-range-slider
            v-model="bookFilters.authorRange"
            :label="rangeLabel('Authors', bookFilters.authorRange, BOOK_AUTHORS_CEILING)"
            :min="0"
            :max="BOOK_AUTHORS_CEILING"
            :step="1"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col
          cols="12"
          sm="6"
        >
          <v-range-slider
            v-model="bookFilters.genreRange"
            :label="rangeLabel('Genres', bookFilters.genreRange, BOOK_GENRES_CEILING)"
            :min="0"
            :max="BOOK_GENRES_CEILING"
            :step="1"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="bookFilters.checkMissingDescription"
            label="Missing description"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="bookFilters.checkMissingCover"
            label="Missing cover"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="bookFilters.checkImplausibleYear"
            label="Implausible year"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="bookFilters.checkSuspiciousTitle"
            label="Suspicious title"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-btn
        color="primary"
        :loading="qualityStore.isBooksLoading"
        class="mb-4 mt-4"
        @click="fetchBooks"
      >
        Fetch low-quality books
      </v-btn>

      <v-progress-linear
        v-if="qualityStore.isBooksLoading"
        indeterminate
        class="mb-4"
      />

      <v-alert
        v-if="qualityStore.errors.books"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ qualityStore.errors.books }}
      </v-alert>

      <v-row v-if="qualityStore.books.length > 0">
        <v-col
          v-for="book in qualityStore.books"
          :key="book.book_id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <QualityAuditCard
            :to="`/books/${book.slug}`"
            :title="book.title"
            :image-url="book.primary_cover_url"
            :chips="bookChips(book)"
          />
        </v-col>
      </v-row>

      <p
        v-else-if="!qualityStore.isBooksLoading && !qualityStore.errors.books"
        class="text-secondary"
      >
        No results yet. Adjust filters and fetch.
      </p>
    </v-card>

    <!-- Authors -->
    <v-card class="mb-6 pa-6">
      <h2 class="text-h6 mb-4">
        Authors
      </h2>

      <v-row dense>
        <v-col
          cols="6"
          sm="3"
        >
          <v-text-field
            v-model.number="authorFilters.limit"
            type="number"
            label="Limit"
            density="compact"
            min="1"
            max="100"
          />
        </v-col>

        <v-col
          cols="12"
          sm="9"
        >
          <v-range-slider
            v-model="authorFilters.bookRange"
            :label="rangeLabel('Books', authorFilters.bookRange, AUTHOR_BOOKS_CEILING)"
            :min="0"
            :max="AUTHOR_BOOKS_CEILING"
            :step="1"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="authorFilters.checkMissingBio"
            label="Missing bio"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="authorFilters.checkJunkName"
            label="Junk name"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-btn
        color="primary"
        :loading="qualityStore.isAuthorsLoading"
        class="mb-4 mt-4"
        @click="fetchAuthors"
      >
        Fetch low-quality authors
      </v-btn>

      <v-progress-linear
        v-if="qualityStore.isAuthorsLoading"
        indeterminate
        class="mb-4"
      />

      <v-alert
        v-if="qualityStore.errors.authors"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ qualityStore.errors.authors }}
      </v-alert>

      <v-row v-if="qualityStore.authors.length > 0">
        <v-col
          v-for="author in qualityStore.authors"
          :key="author.author_id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <QualityAuditCard
            :to="`/authors/${author.slug}`"
            :title="author.name"
            :chips="authorChips(author)"
          />
        </v-col>
      </v-row>

      <p
        v-else-if="!qualityStore.isAuthorsLoading && !qualityStore.errors.authors"
        class="text-secondary"
      >
        No results yet. Adjust filters and fetch.
      </p>
    </v-card>

    <!-- Series -->
    <v-card class="pa-6">
      <h2 class="text-h6 mb-4">
        Series
      </h2>

      <v-row dense>
        <v-col
          cols="6"
          sm="3"
        >
          <v-text-field
            v-model.number="seriesFilters.limit"
            type="number"
            label="Limit"
            density="compact"
            min="1"
            max="100"
          />
        </v-col>

        <v-col
          cols="6"
          sm="3"
        >
          <v-text-field
            v-model="seriesFilters.language"
            label="Language (optional)"
            density="compact"
            placeholder="en"
          />
        </v-col>

        <v-col
          cols="12"
          sm="6"
        >
          <v-range-slider
            v-model="seriesFilters.bookRange"
            :label="rangeLabel('Books', seriesFilters.bookRange, SERIES_BOOKS_CEILING)"
            :min="0"
            :max="SERIES_BOOKS_CEILING"
            :step="1"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="seriesFilters.checkMissingDescription"
            label="Missing description"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="seriesFilters.checkCountDrift"
            label="Book count drift"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-btn
        color="primary"
        :loading="qualityStore.isSeriesLoading"
        class="mb-4 mt-4"
        @click="fetchSeries"
      >
        Fetch low-quality series
      </v-btn>

      <v-progress-linear
        v-if="qualityStore.isSeriesLoading"
        indeterminate
        class="mb-4"
      />

      <v-alert
        v-if="qualityStore.errors.series"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ qualityStore.errors.series }}
      </v-alert>

      <v-row v-if="qualityStore.series.length > 0">
        <v-col
          v-for="s in qualityStore.series"
          :key="s.series_id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <QualityAuditCard
            :to="`/series/${s.slug}`"
            :title="s.name"
            :chips="seriesChips(s)"
          />
        </v-col>
      </v-row>

      <p
        v-else-if="!qualityStore.isSeriesLoading && !qualityStore.errors.series"
        class="text-secondary"
      >
        No results yet. Adjust filters and fetch.
      </p>
    </v-card>
  </v-container>
</template>
