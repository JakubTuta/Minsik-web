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
  description: series.value.description,
  url: canonicalUrl,
})

// Calculate series average rating
const seriesAvgRating = computed(() => {
  if (!books.value || books.value.length === 0)
    return 0

  const totalRating = books.value.reduce((sum, book) => sum + (book.avg_rating || 0), 0)

  return totalRating / books.value.length
})

// Calculate total rating count
const seriesTotalRatings = computed(() => {
  if (!books.value || books.value.length === 0)
    return 0

  return books.value.reduce((sum, book) => sum + (book.rating_count || 0), 0)
})

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
              <div
                class="covers-collage"
                :class="`covers-count-${collageCovers.length}`"
              >
                <div
                  v-for="(cover, index) in collageCovers"
                  :key="index"
                  class="cover-item"
                  :class="`cover-${index + 1}`"
                >
                  <v-img
                    :src="cover"
                    :alt="`Book cover ${index + 1}`"
                    lazy-src="/placeholder-book-lazy.jpg"
                    aspect-ratio="0.67"
                    cover
                    class="rounded"
                  />
                </div>
              </div>
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
                  <div class="mb-4">
                    <RatingDisplay
                      :rating="seriesAvgRating"
                      :rating-count="seriesTotalRatings"
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
                  <div class="mt-4">
                    <CategoriesChips :categories="seriesCategories" />
                  </div>
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

<style scoped>
.covers-collage {
  position: relative;
  width: 100%;
  padding-bottom: 150%;
  background: transparent;
}

.cover-item {
  position: absolute;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.cover-item:hover {
  transform: scale(1.05);
  z-index: 10;
}

/* 1 Book - Takes entire space */
.covers-count-1 .cover-1 {
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
  z-index: 1;
}

/* 2 Books - Split horizontally */
.covers-count-2 .cover-1 {
  width: 85%;
  height: 45%;
  top: 5%;
  left: 7.5%;
  z-index: 2;
}

.covers-count-2 .cover-2 {
  width: 85%;
  height: 45%;
  bottom: 5%;
  left: 7.5%;
  z-index: 1;
}

/* 3 Books - First on left, 2 stacked on right */
.covers-count-3 .cover-1 {
  width: 55%;
  height: 85%;
  top: 7.5%;
  left: 5%;
  z-index: 3;
}

.covers-count-3 .cover-2 {
  width: 35%;
  height: 40%;
  top: 7.5%;
  right: 5%;
  z-index: 2;
}

.covers-count-3 .cover-3 {
  width: 35%;
  height: 40%;
  bottom: 7.5%;
  right: 5%;
  z-index: 1;
}

/* 4 Books - All corners */
.covers-count-4 .cover-1 {
  width: 55%;
  height: 40%;
  top: 5%;
  left: 5%;
  z-index: 4;
}

.covers-count-4 .cover-2 {
  width: 45%;
  height: 35%;
  top: 15%;
  right: 5%;
  z-index: 3;
}

.covers-count-4 .cover-3 {
  width: 50%;
  height: 38%;
  bottom: 15%;
  left: 10%;
  z-index: 2;
}

.covers-count-4 .cover-4 {
  width: 40%;
  height: 32%;
  bottom: 5%;
  right: 10%;
  z-index: 1;
}
</style>
