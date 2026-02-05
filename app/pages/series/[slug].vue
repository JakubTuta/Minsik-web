<script setup lang="ts">
const route = useRoute()
const seriesStore = useSeriesStore()

const slug = route.params.slug as string

// Fetch series data and books
const { data: series, error: seriesError } = await useAsyncData(
  `series-${slug}`,
  () => seriesStore.fetchSeries(slug),
)

const { data: books } = await useAsyncData(
  `series-books-${slug}`,
  () => seriesStore.fetchSeriesBooks(slug),
)

// Handle 404
if (seriesError.value || !series.value) {
  throw createError({
    statusCode: 404,
    message: 'Series not found',
  })
}

// SEO
const config = useRuntimeConfig()
const canonicalUrl = `${config.public.siteUrl}/series/${slug}`

useSeo({
  title: series.value.name,
  description: series.value.description || `${series.value.name} - A series of ${series.value.book_count} books`,
  type: 'website',
  url: canonicalUrl,
  author: series.value.author?.name,
})

// Structured data
useSeriesStructuredData({
  name: series.value.name,
  description: series.value.description,
  url: canonicalUrl,
})
</script>

<template>
  <v-container v-if="series">
    <v-row>
      <!-- Series Info Card -->
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <h1 class="text-h4 font-weight-bold mb-3">
              {{ series.name }}
            </h1>

            <div
              v-if="series.author"
              class="mb-3"
            >
              <span class="text-body-2 text-secondary">by </span>

              <NuxtLink
                class="text-body-2 text-primary text-decoration-none cursor-pointer"
                :to="`/authors/${series.author.slug}`"
              >
                {{ series.author.name }}
              </NuxtLink>
            </div>

            <v-chip
              color="primary"
              variant="tonal"
              class="mb-4"
            >
              {{ series.book_count }} {{ series.book_count === 1
                ? 'book'
                : 'books' }}
            </v-chip>

            <div
              v-if="series.view_count"
              class="d-flex align-center mb-4 gap-2"
            >
              <v-icon
                icon="mdi-eye"
                size="small"
              />

              <span class="text-body-2 text-secondary">{{ series.view_count }} views</span>
            </div>

            <v-divider
              v-if="series.description"
              class="my-4"
            />

            <div v-if="series.description">
              <h2 class="text-h6 font-weight-bold mb-3">
                About the Series
              </h2>

              <p
                class="text-body-1"
                style="white-space: pre-line;"
              >
                {{ series.description }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Books Section -->
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">
          Books in this Series
        </h2>
      </v-col>

      <!-- Books Grid (in order) -->
      <template v-if="books && books.length > 0">
        <v-col
          v-for="book in books"
          :key="book.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <BookCard :book="book">
            <template v-if="book.series_position">
              <v-badge
                :content="`#${book.series_position}`"
                color="primary"
                inline
              />
            </template>
          </BookCard>
        </v-col>
      </template>

      <!-- No Books State -->
      <v-col
        v-else-if="!seriesStore.isLoadingBooks"
        cols="12"
      >
        <v-alert
          type="info"
          variant="tonal"
        >
          No books found in this series.
        </v-alert>
      </v-col>

      <!-- Loading Books -->
      <v-col
        v-if="seriesStore.isLoadingBooks"
        cols="12"
      >
        <LoadingState
          type="grid"
          :count="4"
        />
      </v-col>
    </v-row>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="seriesStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>
