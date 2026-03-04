<script setup lang="ts">
import type { Book } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'
import { formatDisplayDate } from '~/utils/format'

const route = useRoute()
const authorsStore = useAuthorsStore()
const recommendationsStore = useRecommendationsStore()
const authStore = useAuthStore()

const slug = route.params.slug as string

// Sorting
type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc' | 'readers-desc' | 'readers-asc'
const sortBy = ref<SortOption>('date-desc')

const sortByMap: Record<string, 'publication_year' | 'combined_rating' | 'readers_count'> = {
  date: 'publication_year',
  rating: 'combined_rating',
  readers: 'readers_count',
}

function getSortParams() {
  const [field, direction] = sortBy.value.split('-')
  return {
    apiSortBy: sortByMap[field] as 'publication_year' | 'combined_rating' | 'readers_count',
    apiOrder: direction as 'asc' | 'desc',
  }
}

// Fetch author data
const { data: author, error: authorError } = await useAsyncData(
  `author-${slug}`,
  () => authorsStore.fetchAuthor(slug),
)

// Pagination state
const allBooks = ref<Book[]>([])
const booksOffset = ref(0)
const booksTotalCount = ref(0)
const hasMoreBooks = computed(() => allBooks.value.length < booksTotalCount.value)

// Fetch initial page of books
const { data: initialBooksData } = await useAsyncData(
  `author-books-${slug}`,
  () => authorsStore.fetchAuthorBooksPage(slug, 'publication_year', 'desc', 0, 20),
)

if (initialBooksData.value) {
  allBooks.value = initialBooksData.value.books
  booksTotalCount.value = initialBooksData.value.total_count
  booksOffset.value = initialBooksData.value.books.length
}

// Reset and refetch when sort changes
watch(sortBy, async () => {
  const { apiSortBy, apiOrder } = getSortParams()
  allBooks.value = []
  booksTotalCount.value = 0
  booksOffset.value = 0

  const result = await authorsStore.fetchAuthorBooksPage(slug, apiSortBy, apiOrder, 0, 20)
  allBooks.value = result.books
  booksTotalCount.value = result.total_count
  booksOffset.value = result.books.length
})

// Load next page
async function loadMoreBooks() {
  if (!hasMoreBooks.value)
    return

  const { apiSortBy, apiOrder } = getSortParams()
  const result = await authorsStore.fetchAuthorBooksPage(slug, apiSortBy, apiOrder, booksOffset.value, 20)
  allBooks.value.push(...result.books)
  booksTotalCount.value = result.total_count
  booksOffset.value += result.books.length
}

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

const photoUrl = computed(() => author.value?.photo_url || '/placeholder-avatar-lazy.jpg')

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
  { value: 'readers-desc', title: 'Most Readers' },
  { value: 'readers-asc', title: 'Least Readers' },
]

// Weighted rating across app + OL
const weightedRating = computed(() => {
  const appRating = author.value?.books_avg_rating ?? 0
  const appCount = author.value?.books_total_ratings ?? 0
  const olRating = Number(author.value?.books_ol_avg_rating ?? 0)
  const olCount = author.value?.books_ol_total_ratings ?? 0
  const total = appCount + olCount

  if (total === 0)
    return 0

  return (appRating * appCount + olRating * olCount) / total
})

const totalRatings = computed(() => (author.value?.books_total_ratings ?? 0) + (author.value?.books_ol_total_ratings ?? 0),
)

// Readers across app + OL
const appReaders = computed(() => (author.value?.app_want_to_read_count ?? 0)
  + (author.value?.app_reading_count ?? 0)
  + (author.value?.app_read_count ?? 0),
)

const olReaders = computed(() => (author.value?.ol_want_to_read_count ?? 0)
  + (author.value?.ol_currently_reading_count ?? 0)
  + (author.value?.ol_already_read_count ?? 0),
)

const totalReaders = computed(() => appReaders.value + olReaders.value)

const authorRecommendations = ref<RecommendationSection[]>([])
const personalizedAuthorRecs = ref<RecommendationSection[]>([])

onMounted(async () => {
  if (author.value?.author_id) {
    try {
      authorRecommendations.value = await recommendationsStore.fetchAuthorRecommendations(author.value.author_id) ?? []
    }
    catch { /* Silently fail */ }
  }
})

watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth && author.value?.author_id)
    personalizedAuthorRecs.value = await recommendationsStore.fetchPersonalizedAuthorRecommendations(author.value.author_id) ?? []
  else
    personalizedAuthorRecs.value = []
}, { immediate: true })
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
                  Born {{ formatDisplayDate(author.birth_date) }}
                  <span v-if="age && !author.death_date"> ({{ age }} years old)</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="author.death_date">
                <template #prepend>
                  <v-icon icon="mdi-calendar-remove" />
                </template>

                <v-list-item-title class="text-wrap">
                  Died {{ formatDisplayDate(author.death_date) }}
                  <span v-if="age"> ({{ age }} years old)</span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="author.birth_place || author.nationality">
                <template #prepend>
                  <v-icon icon="mdi-map-marker" />
                </template>

                <v-list-item-title class="text-wrap">
                  {{ [
                    author.birth_place,
                    author.nationality,
                  ].filter(Boolean).join(', ') }}
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="author.alternate_names && author.alternate_names.length > 0">
                <template #prepend>
                  <v-icon icon="mdi-account-convert" />
                </template>

                <v-list-item-title class="text-wrap">
                  Also known as: {{ author.alternate_names.slice(0, 2).join(', ') }}
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="author.wikipedia_url">
                <template #prepend>
                  <v-icon icon="mdi-wikipedia" />
                </template>

                <v-list-item-title>
                  <a
                    :href="author.wikipedia_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary text-decoration-none"
                  >
                    Wikipedia
                    <v-icon
                      icon="mdi-open-in-new"
                      size="x-small"
                    />
                  </a>
                </v-list-item-title>
              </v-list-item>

              <v-divider
                v-if="author.birth_date || author.death_date || author.birth_place || author.nationality || author.alternate_names && author.alternate_names.length > 0 || author.wikipedia_url"
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
                  <span>
                    {{ weightedRating.toFixed(1) }} ({{ totalRatings.toLocaleString() }})
                    <v-tooltip
                      activator="parent"
                      location="bottom"
                    >
                      <div>
                        Minsik: {{ author.books_avg_rating
                          ? author.books_avg_rating.toFixed(1)
                          : '0.0' }} ({{ author.books_total_ratings
                          ? author.books_total_ratings.toLocaleString()
                          : '0' }} ratings)
                      </div>

                      <div class="mt-1">
                        Open Library: {{ author.books_ol_avg_rating
                          ? Number(author.books_ol_avg_rating).toFixed(1)
                          : '0.0' }} ({{ author.books_ol_total_ratings
                          ? author.books_ol_total_ratings.toLocaleString()
                          : '0' }} ratings)
                      </div>
                    </v-tooltip>
                  </span>
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-account-multiple" />
                </template>

                <v-list-item-title>
                  <span>
                    {{ totalReaders.toLocaleString() }} readers
                    <v-tooltip
                      activator="parent"
                      location="bottom"
                    >
                      <div>Minsik - Want to Read: {{ (author.app_want_to_read_count ?? 0).toLocaleString() }}</div>

                      <div>Minsik - Reading: {{ (author.app_reading_count ?? 0).toLocaleString() }}</div>

                      <div>Minsik - Read: {{ (author.app_read_count ?? 0).toLocaleString() }}</div>

                      <div class="mt-1">
                        Open Library - Want to Read: {{ (author.ol_want_to_read_count ?? 0).toLocaleString() }}
                      </div>

                      <div>Open Library - Reading: {{ (author.ol_currently_reading_count ?? 0).toLocaleString() }}</div>

                      <div>Open Library - Read: {{ (author.ol_already_read_count ?? 0).toLocaleString() }}</div>
                    </v-tooltip>
                  </span>
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <!-- Book Categories -->
            <div
              v-if="author.book_categories && author.book_categories.length > 0"
              class="px-4 pb-4"
            >
              <v-divider class="mb-3" />

              <CategoriesChips
                :categories="author.book_categories"
                :max-visible="3"
              />
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
        <DescriptionCard
          :description="author.bio"
          class="mb-6"
        />

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

            <BooksList
              :books="allBooks"
              :loading="authorsStore.isLoadingBooks"
              :load-more="loadMoreBooks"
              :has-more="hasMoreBooks"
              empty-message="No books found for this author."
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Author Recommendations -->
    <ClientOnly>
      <div
        v-if="personalizedAuthorRecs.length > 0 || recommendationsStore.isLoadingPersonalizedAuthorRecs"
        class="mt-8"
      >
        <RecommendationRowSkeleton v-if="recommendationsStore.isLoadingPersonalizedAuthorRecs" />

        <template v-else>
          <template
            v-for="category in personalizedAuthorRecs"
            :key="category.key"
          >
            <RecommendationRow
              v-if="(category.book_items?.length ?? 0) > 0 || (category.author_items?.length ?? 0) > 0"
              :category="category"
              hide-show-more
            />
          </template>
        </template>
      </div>

      <div
        v-if="authorRecommendations.length > 0 || recommendationsStore.isLoadingAuthorRecs"
        class="mt-8"
      >
        <RecommendationRowSkeleton v-if="recommendationsStore.isLoadingAuthorRecs" />

        <template v-else>
          <template
            v-for="category in authorRecommendations"
            :key="category.key"
          >
            <RecommendationRow
              v-if="(category.book_items?.length ?? 0) > 0 || (category.author_items?.length ?? 0) > 0"
              :category="category"
              hide-show-more
            />
          </template>
        </template>
      </div>
    </ClientOnly>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="authorsStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>
