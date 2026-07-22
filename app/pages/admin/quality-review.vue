<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeo({ title: 'Data Quality Review', description: 'Review low-quality books, authors, and series flagged for manual cleanup.' })

const qualityStore = useAdminQualityStore()

const bookFilters = reactive({
  limit: 20,
  maxAuthors: 5,
  maxGenres: 10,
  language: '',
})

const authorFilters = reactive({
  limit: 20,
  minBooks: 1,
  maxBooks: 50,
})

const seriesFilters = reactive({
  limit: 20,
  minBooks: 2,
  maxBooks: 30,
  language: '',
})

function fetchBooks() {
  qualityStore.fetchBooks(bookFilters)
}

function fetchAuthors() {
  qualityStore.fetchAuthors(authorFilters)
}

function fetchSeries() {
  qualityStore.fetchSeries(seriesFilters)
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
          Pull a random sample of flagged books, authors, and series, then keep, edit, or delete them from their detail pages
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
            v-model.number="bookFilters.maxAuthors"
            type="number"
            label="Max authors"
            density="compact"
            min="0"
          />
        </v-col>

        <v-col
          cols="6"
          sm="3"
        >
          <v-text-field
            v-model.number="bookFilters.maxGenres"
            type="number"
            label="Max genres"
            density="compact"
            min="0"
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

      <v-btn
        color="primary"
        :loading="qualityStore.isBooksLoading"
        class="mb-4"
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
          <AdminQualityAuditCard
            :to="`/books/${book.slug}`"
            :title="book.title"
            :image-url="book.primary_cover_url"
            :metrics="[
              {'label': 'Authors',
               'value': book.author_count},
              {'label': 'Genres',
               'value': book.genre_count},
            ]"
            :issues="book.issues"
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
          sm="4"
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
          cols="6"
          sm="4"
        >
          <v-text-field
            v-model.number="authorFilters.minBooks"
            type="number"
            label="Min books"
            density="compact"
            min="0"
          />
        </v-col>

        <v-col
          cols="6"
          sm="4"
        >
          <v-text-field
            v-model.number="authorFilters.maxBooks"
            type="number"
            label="Max books"
            density="compact"
            min="0"
          />
        </v-col>
      </v-row>

      <v-btn
        color="primary"
        :loading="qualityStore.isAuthorsLoading"
        class="mb-4"
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
          <AdminQualityAuditCard
            :to="`/authors/${author.slug}`"
            :title="author.name"
            :metrics="[
              {'label': 'Books',
               'value': author.book_count},
            ]"
            :issues="author.issues"
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
            v-model.number="seriesFilters.minBooks"
            type="number"
            label="Min books"
            density="compact"
            min="0"
          />
        </v-col>

        <v-col
          cols="6"
          sm="3"
        >
          <v-text-field
            v-model.number="seriesFilters.maxBooks"
            type="number"
            label="Max books"
            density="compact"
            min="0"
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
      </v-row>

      <v-btn
        color="primary"
        :loading="qualityStore.isSeriesLoading"
        class="mb-4"
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
          <AdminQualityAuditCard
            :to="`/series/${s.slug}`"
            :title="s.name"
            :metrics="[
              {'label': 'Books',
               'value': s.book_count},
              {'label': 'Total',
               'value': s.total_books},
            ]"
            :issues="s.issues"
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
