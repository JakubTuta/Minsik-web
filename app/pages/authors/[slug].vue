<script setup lang="ts">
import type { Book } from '~/types/api'

const route = useRoute()
const authorsStore = useAuthorsStore()

const slug = route.params.slug as string

// Sorting
type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc' | 'views-desc' | 'views-asc'
const sortBy = ref<SortOption>('date-desc')

// Fetch author data
const { data: author, error: authorError } = await useAsyncData(
  `author-${slug}`,
  () => authorsStore.fetchAuthor(slug),
)

// Fetch books with default sorting initially
const { data: books } = await useAsyncData(
  `author-books-${slug}`,
  () => authorsStore.fetchAuthorBooks(slug, 'publication_year', 'desc'),
)

// Watch for sort changes and refetch with new parameters
watch(sortBy, async (newSort) => {
  const [field, direction] = newSort.split('-')
  const sortByMap: Record<string, 'publication_year' | 'avg_rating' | 'view_count'> = {
    date: 'publication_year',
    rating: 'avg_rating',
    views: 'view_count',
  }

  const apiSortBy = sortByMap[field]
  const apiOrder = direction as 'asc' | 'desc'

  books.value = await authorsStore.fetchAuthorBooks(slug, apiSortBy, apiOrder, true)
})

// Handle 404
if (authorError.value || !author.value) {
  throw createError({
    statusCode: 404,
    message: 'Author not found',
  })
}

// SEO
const config = useRuntimeConfig()
const canonicalUrl = `${config.public.siteUrl}/authors/${slug}`

useSeo({
  title: author.value.name,
  description: author.value.bio || `${author.value.name} - Author of ${author.value.books_count} books`,
  image: author.value.photo_url,
  type: 'profile',
  url: canonicalUrl,
  author: author.value.name,
})

// Structured data
useAuthorStructuredData({
  name: author.value.name,
  description: author.value.bio,
  image: author.value.photo_url,
  url: canonicalUrl,
  birthDate: author.value.birth_date,
  deathDate: author.value.death_date,
})

const photoUrl = computed(() => author.value?.photo_url || '/placeholder-avatar.jpg')

// Calculate age
const age = computed(() => {
  if (!author.value?.birth_date)
    return null

  const birthDate = new Date(author.value.birth_date)
  const endDate = author.value.death_date
    ? new Date(author.value.death_date)
    : new Date()

  let age = endDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = endDate.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
    age--
  }

  return age
})

const sortOptions = [
  { value: 'date-desc', title: 'Newest First' },
  { value: 'date-asc', title: 'Oldest First' },
  { value: 'rating-desc', title: 'Highest Rated' },
  { value: 'rating-asc', title: 'Lowest Rated' },
  { value: 'views-desc', title: 'Most Viewed' },
  { value: 'views-asc', title: 'Least Viewed' },
]

// Categories expansion
const categoriesExpanded = ref(false)
const visibleCategories = computed(() => {
  if (!author.value?.book_categories)
    return []
  if (categoriesExpanded.value || author.value.book_categories.length <= 5)
    return author.value.book_categories

  return author.value.book_categories.slice(0, 5)
})
const hasMoreCategories = computed(() => {
  return (author.value?.book_categories?.length || 0) > 5
})
</script>

<template>
  <v-container v-if="author">
    <!-- Author Header Section -->
    <v-row class="mb-6 justify-center">
      <v-col
        cols="12"
        class="text-center"
      >
        <v-avatar
          size="200"
          color="surface-variant"
          class="mb-4"
        >
          <v-img
            :src="photoUrl"
            :alt="author.name"
            lazy-src="/placeholder-avatar-lazy.jpg"
          />
        </v-avatar>

        <h1 class="text-h3 font-weight-bold">
          {{ author.name }}
        </h1>
      </v-col>
    </v-row>

    <!-- Content Grid -->
    <v-row>
      <!-- Personal Information Sidebar -->
      <v-col
        cols="12"
        md="3"
      >
        <v-card>
          <v-card-text>
            <h2 class="text-h6 font-weight-bold mb-4">
              Personal Information
            </h2>

            <v-list
              density="compact"
              class="bg-transparent"
            >
              <v-list-item v-if="author.birth_date">
                <template #prepend>
                  <v-icon icon="mdi-cake-variant" />
                </template>

                <v-list-item-title class="text-wrap">
                  Born {{ new Date(author.birth_date).toLocaleDateString('en-US', {'year': 'numeric',
                                                                                   'month': 'long',
                                                                                   'day': 'numeric'}) }}
                  <span v-if="age && !author.death_date"> ({{ age }} years old)</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="author.death_date">
                <template #prepend>
                  <v-icon icon="mdi-calendar-remove" />
                </template>

                <v-list-item-title class="text-wrap">
                  Died {{ new Date(author.death_date).toLocaleDateString('en-US', {'year': 'numeric',
                                                                                   'month': 'long',
                                                                                   'day': 'numeric'}) }}
                  <span v-if="age"> ({{ age }} years old)</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="author.birth_place">
                <template #prepend>
                  <v-icon icon="mdi-map-marker" />
                </template>

                <v-list-item-title class="text-wrap">
                  {{ author.birth_place }}
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="author.nationality">
                <template #prepend>
                  <v-icon icon="mdi-flag" />
                </template>

                <v-list-item-title class="text-wrap">
                  {{ author.nationality }}
                </v-list-item-title>
              </v-list-item>

              <v-divider
                v-if="author.birth_date || author.death_date || author.birth_place || author.nationality"
                class="my-3"
              />

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-book-multiple" />
                </template>

                <v-list-item-title>
                  {{ author.books_count }} {{ author.books_count === 1
                    ? 'book'
                    : 'books' }}
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-star" />
                </template>

                <v-list-item-title>
                  {{ author.books_avg_rating
                    ? author.books_avg_rating.toFixed(1)
                    : '0.0' }} rating ({{ author.books_total_ratings
                    ? author.books_total_ratings.toLocaleString()
                    : '0' }} ratings)
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-book-search-outline" />
                </template>

                <v-list-item-title>
                  {{ author.books_total_views
                    ? author.books_total_views.toLocaleString()
                    : '0' }} total book views
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-eye" />
                </template>

                <v-list-item-title>
                  {{ author.view_count
                    ? author.view_count.toLocaleString()
                    : '0' }} profile views
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <!-- Book Categories -->
            <div
              v-if="author.book_categories && author.book_categories.length > 0"
              class="px-4 pb-4"
            >
              <v-divider class="mb-3" />

              <h3 class="text-subtitle-2 text-secondary font-weight-bold mb-2">
                Categories
              </h3>

              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="category in visibleCategories"
                  :key="category"
                  size="small"
                  variant="tonal"
                >
                  {{ toTitleCase(category) }}
                </v-chip>

                <v-chip
                  v-if="hasMoreCategories"
                  size="small"
                  variant="tonal"
                  @click="categoriesExpanded = !categoriesExpanded"
                >
                  {{ categoriesExpanded
                    ? '-'
                    : `+${author.book_categories.length - 5}` }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Main Content -->
      <v-col
        cols="12"
        md="9"
      >
        <!-- Description Section -->
        <v-card class="mb-6">
          <v-card-text>
            <h2 class="text-h5 font-weight-bold mb-4">
              Description
            </h2>

            <p
              v-if="author.bio"
              class="text-body-1"
              style="white-space: pre-line;"
            >
              {{ author.bio }}
            </p>

            <p
              v-else
              class="text-body-1 text-secondary font-italic"
            >
              There is no description yet, we will add it soon.
            </p>
          </v-card-text>
        </v-card>

        <!-- Books Section -->
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-4">
              <h2 class="text-h5 font-weight-bold">
                Books
              </h2>

              <v-select
                v-model="sortBy"
                :items="sortOptions"
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 200px;"
              />
            </div>

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
                      class="text-body-2 text-secondary line-clamp-3"
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
              v-else-if="!authorsStore.isLoadingBooks"
              type="info"
              variant="tonal"
            >
              No books found for this author.
            </v-alert>

            <!-- Loading Books -->
            <div
              v-if="authorsStore.isLoadingBooks"
              class="py-8"
            >
              <v-progress-circular
                indeterminate
                color="primary"
                class="d-block mx-auto"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="authorsStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
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
