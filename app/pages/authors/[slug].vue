<script setup lang="ts">
import type { AuthorQuote, BookSummary } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'

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
  const [field = 'date', direction = 'desc'] = sortBy.value.split('-')
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

// Handle 404 early
if (authorError.value || !author.value) {
  throw createError({ statusCode: 404, message: 'Author not found' })
}

// Pagination state
const allBooks = ref<BookSummary[]>([])
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

// Fetch quote and top books (SSR-safe)
const { data: authorQuote } = await useAsyncData(
  `author-quote-${slug}`,
  () => authorsStore.fetchAuthorQuote(slug),
)

const { data: topBooks } = await useAsyncData(
  `author-top-books-${slug}`,
  () => authorsStore.fetchAuthorTopBooks(slug),
)

// View mode: list or timeline
const viewMode = ref<'list' | 'timeline'>('list')

// Reset and refetch when sort changes
watch(sortBy, async () => {
  if (viewMode.value !== 'list')
    return
  const { apiSortBy, apiOrder } = getSortParams()
  allBooks.value = []
  booksTotalCount.value = 0
  booksOffset.value = 0

  const result = await authorsStore.fetchAuthorBooksPage(slug, apiSortBy, apiOrder, 0, 20)
  allBooks.value = result.books
  booksTotalCount.value = result.total_count
  booksOffset.value = result.books.length
})

// Reset and refetch when view mode changes
watch(viewMode, async (mode) => {
  allBooks.value = []
  booksTotalCount.value = 0
  booksOffset.value = 0

  const { apiSortBy, apiOrder } = mode === 'timeline'
    ? { apiSortBy: 'publication_year' as const, apiOrder: 'desc' as const }
    : getSortParams()

  const result = await authorsStore.fetchAuthorBooksPage(slug, apiSortBy, apiOrder, 0, 20)
  allBooks.value = result.books
  booksTotalCount.value = result.total_count
  booksOffset.value = result.books.length
})

async function loadMoreBooks() {
  if (!hasMoreBooks.value)
    return

  const { apiSortBy, apiOrder } = viewMode.value === 'timeline'
    ? { apiSortBy: 'publication_year' as const, apiOrder: 'desc' as const }
    : getSortParams()

  const result = await authorsStore.fetchAuthorBooksPage(slug, apiSortBy, apiOrder, booksOffset.value, 20)
  allBooks.value.push(...result.books)
  booksTotalCount.value = result.total_count
  booksOffset.value += result.books.length
}

// SEO
const config = useRuntimeConfig()
const canonicalUrl = `${config.public.siteUrl}/authors/${slug}`

useSeo({
  title: author.value.name,
  description: author.value.bio || `${author.value.name} - Author of ${author.value.books_count} books`,
  image: author.value.photo_url ?? undefined,
  type: 'profile',
  url: canonicalUrl,
  author: author.value.name,
})

useAuthorStructuredData({
  name: author.value.name,
  description: author.value.bio,
  image: author.value.photo_url ?? undefined,
  url: canonicalUrl,
  birthDate: author.value.birth_date,
  deathDate: author.value.death_date,
})

const isAdmin = computed(() => authStore.user?.role === 'admin')

const sortOptions = [
  { value: 'date-desc', title: 'Newest First' },
  { value: 'date-asc', title: 'Oldest First' },
  { value: 'rating-desc', title: 'Highest Rated' },
  { value: 'rating-asc', title: 'Lowest Rated' },
  { value: 'readers-desc', title: 'Most Readers' },
  { value: 'readers-asc', title: 'Least Readers' },
]

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

async function handleAuthorDelete() {
  await navigateTo('/')
}
</script>

<template>
  <v-container v-if="author">
    <!-- Header -->
    <div class="mb-16">
      <AuthorHeader
        :author="author"
        :is-admin="isAdmin"
        @delete="handleAuthorDelete"
      />
    </div>

    <!-- Quote -->
    <div class="mb-16">
      <AuthorQuoteCard :quote="(authorQuote as AuthorQuote | null)" />
    </div>

    <!-- Top 3 Books (podium) -->
    <div class="mb-16">
      <AuthorTopBooks
        :books="(topBooks as BookSummary[] | null) ?? []"
        :loading="authorsStore.isLoadingBooks && !topBooks"
      />
    </div>

    <!-- Books Section -->
    <v-card id="books-list">
      <v-card-text>
        <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
          <h2 class="text-h5 font-weight-bold">
            Books
          </h2>

          <div class="d-flex flex-column flex-sm-row align-sm-center gap-2">
            <v-select
              v-if="viewMode === 'list'"
              v-model="sortBy"
              :items="sortOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 200px;"
            />

            <v-btn-toggle
              v-model="viewMode"
              mandatory
              density="compact"
              variant="outlined"
              color="primary"
            >
              <v-btn
                value="list"
                size="small"
                prepend-icon="mdi-view-list"
              >
                List view
              </v-btn>

              <v-btn
                value="timeline"
                size="small"
                prepend-icon="mdi-timeline-outline"
              >
                Timeline view
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>

        <BooksList
          v-if="viewMode === 'list'"
          :books="allBooks"
          :loading="authorsStore.isLoadingBooks"
          :load-more="loadMoreBooks"
          :has-more="hasMoreBooks"
          empty-message="No books found for this author."
        />

        <AuthorTimeline
          v-else
          :books="allBooks"
          :loading="authorsStore.isLoadingBooks"
          :has-more="hasMoreBooks"
          :load-more="loadMoreBooks"
        />
      </v-card-text>
    </v-card>

    <!-- Recommendations -->
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
