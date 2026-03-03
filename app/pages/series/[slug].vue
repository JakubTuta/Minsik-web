<script setup lang="ts">
const route = useRoute()
const seriesStore = useSeriesStore()
const authorsStore = useAuthorsStore()

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

// Fetch first book's full details to get author
const booksStore = useBooksStore()
const { data: firstBookDetails } = await useAsyncData(
  `series-first-book-${slug}`,
  async () => {
    if (!books.value || books.value.length === 0)
      return null

    try {
      const firstBook = books.value[0]
      if (!firstBook?.slug)
        return null

      return await booksStore.fetchBook(firstBook.slug)
    }
    catch {
      return null
    }
  },
)

// Fetch author data from first book
const { data: primaryAuthor } = await useAsyncData(
  `series-author-${slug}`,
  async () => {
    if (!firstBookDetails.value?.authors?.[0]?.slug)
      return null

    try {
      return await authorsStore.fetchAuthor(firstBookDetails.value.authors[0].slug)
    }
    catch {
      return null
    }
  },
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
  description: series.value.description || `${series.value.name} - A series of ${series.value.total_books} books`,
  type: 'website',
  url: canonicalUrl,
  author: series.value.author?.name,
})

// Structured data
useSeriesStructuredData({
  name: series.value.name,
  description: series.value.description || undefined,
  url: canonicalUrl,
})

// Series rating from API
const seriesAvgRating = computed(() => Number(series.value?.avg_rating) || 0)
const seriesTotalRatings = computed(() => series.value?.rating_count ?? 0)

// Get book covers for collage (max 4)
const collageCovers = computed(() => {
  if (!books.value || books.value.length === 0)
    return []

  return books.value.slice(0, 4).map(book => book.primary_cover_url || '/placeholder-book.jpg')
})

// Get unique categories from all books
const seriesCategories = computed(() => {
  if (!books.value || books.value.length === 0)
    return []

  const categoriesSet = new Set<string>()
  books.value.forEach((book) => {
    book.genres?.forEach((genre) => {
      categoriesSet.add(genre.name)
    })
  })

  return Array.from(categoriesSet)
})
</script>

<template>
  <v-container v-if="series">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-row no-gutters>
            <!-- Book Covers Collage -->
            <v-col
              cols="12"
              md="3"
              class="pa-0"
            >
              <CoversCollage :covers="collageCovers" />
            </v-col>

            <!-- Series Info -->
            <v-col
              cols="12"
              md="6"
            >
              <v-card-text class="d-flex flex-column h-100">
                <div>
                  <div class="text-secondary text-h6 mb-1">
                    Book Series
                  </div>

                  <h1 class="text-h4 font-weight-bold mb-4">
                    {{ series.name }}
                  </h1>

                  <!-- Rating -->
                  <div class="text-caption text-secondary mb-1">
                    Minsik users reviews
                  </div>

                  <RatingDisplay
                    :rating="seriesAvgRating"
                    :rating-count="seriesTotalRatings"
                    class="mb-4"
                  />

                  <!-- Other Platform Ratings -->
                  <div class="mb-4">
                    <div class="text-caption text-secondary mb-1">
                      Other platforms reviews
                    </div>

                    <RatingDisplay
                      :rating="Number(series.ol_avg_rating) / 2"
                      :rating-count="series.ol_rating_count"
                      size="small"
                    />
                  </div>

                  <v-divider class="mb-4" />

                  <!-- Metadata -->
                  <v-list
                    density="compact"
                    class="bg-transparent"
                  >
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-book-multiple" />
                      </template>

                      <v-list-item-title>
                        {{ series.total_books }} {{ series.total_books === 1
                          ? 'book'
                          : 'books' }}
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-eye" />
                      </template>

                      <v-list-item-title>
                        {{ series.view_count
                          ? series.view_count.toLocaleString()
                          : '0' }} views
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>

                  <!-- Categories -->
                  <CategoriesChips :categories="seriesCategories" />
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
      </v-col>
    </v-row>

    <!-- Description Section -->
    <v-row class="mt-6">
      <v-col cols="12">
        <DescriptionCard :description="series.description" />
      </v-col>
    </v-row>

    <!-- Books List -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <h2 class="text-h5 font-weight-bold mb-4">
              Books in this Series
            </h2>

            <BooksList
              :books="books || []"
              :loading="seriesStore.isLoadingBooks"
              empty-message="No books found in this series."
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="seriesStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>
