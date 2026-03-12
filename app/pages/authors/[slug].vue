<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { BookSummary } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'
import { formatDisplayDate } from '~/utils/format'

const route = useRoute()
const authorsStore = useAuthorsStore()
const recommendationsStore = useRecommendationsStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()

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

// View mode: list or timeline
const viewMode = ref<'list' | 'timeline'>('list')

// Reset and refetch when sort changes (only relevant in list mode)
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

// Load next page
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
  image: author.value.photo_url ?? undefined,
  type: 'profile',
  url: canonicalUrl,
  author: author.value.name,
})

// Structured data
useAuthorStructuredData({
  name: author.value.name,
  description: author.value.bio,
  image: author.value.photo_url ?? undefined,
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
  const olRating = author.value?.books_ol_avg_rating ?? 0
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

const isAdmin = computed(() => authStore.user?.role === 'admin')
const editDialogOpen = ref(false)
const editError = ref('')
const deleteDialogOpen = ref(false)
const deleteError = ref('')

const authorEditFields: EditFieldConfig[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'bio', label: 'Biography', type: 'textarea' },
  { key: 'birth_date', label: 'Birth Date (YYYY-MM-DD)', type: 'text' },
  { key: 'death_date', label: 'Death Date (YYYY-MM-DD)', type: 'text' },
  { key: 'birth_place', label: 'Birth Place', type: 'text' },
  { key: 'nationality', label: 'Nationality', type: 'text' },
  { key: 'photo_url', label: 'Photo URL', type: 'text' },
  { key: 'wikipedia_url', label: 'Wikipedia URL', type: 'text' },
  { key: 'wikidata_id', label: 'Wikidata ID', type: 'text' },
  { key: 'open_library_id', label: 'Open Library ID', type: 'text' },
  { key: 'alternate_names', label: 'Alternate Names', type: 'array' },
]

const authorEditOriginalData = computed(() => ({
  name: author.value?.name ?? null,
  slug: author.value?.slug ?? null,
  bio: author.value?.bio ?? null,
  birth_date: author.value?.birth_date ?? null,
  death_date: author.value?.death_date ?? null,
  birth_place: author.value?.birth_place ?? null,
  nationality: author.value?.nationality ?? null,
  photo_url: author.value?.photo_url ?? null,
  wikipedia_url: author.value?.wikipedia_url ?? null,
  wikidata_id: author.value?.wikidata_id ?? null,
  open_library_id: author.value?.open_library_id ?? null,
  alternate_names: author.value?.alternate_names ?? [],
}))

async function handleAuthorDelete() {
  deleteError.value = ''
  const result = await adminStore.deleteAuthor(author.value!.author_id)
  if (result.success) {
    deleteDialogOpen.value = false
    await navigateTo('/')
  }
  else {
    deleteError.value = (result as any).error || 'Delete failed'
  }
}

async function handleAuthorEditSave(editedData: Record<string, any>) {
  editError.value = ''
  const result = await adminStore.updateAuthor(author.value!.author_id, authorEditOriginalData.value, editedData)
  if (result.success) {
    editDialogOpen.value = false
    const newSlug = editedData.slug && editedData.slug !== slug
      ? editedData.slug
      : slug
    await authorsStore.fetchAuthor(newSlug, true)
    if (newSlug !== slug) {
      await navigateTo(`/authors/${newSlug}`)
    }
  }
  else {
    editError.value = (result as any).error || 'Update failed'
  }
}

const authorRecommendations = ref<RecommendationSection[]>([])
const personalizedAuthorRecs = ref<RecommendationSection[]>([])

// Scroll reveal refs
const revealSidebar = ref<HTMLElement | null>(null)
const revealDescription = ref<HTMLElement | null>(null)

useScrollReveal(revealSidebar, { delay: 0.05 })
useScrollReveal(revealDescription, { delay: 0.1 })

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
            eager
          />
        </v-avatar>

        <h1 class="text-h3 font-weight-bold">
          {{ author.name }}
        </h1>

        <ClientOnly>
          <v-btn
            v-if="isAdmin"
            prepend-icon="mdi-pencil"
            variant="text"
            size="small"
            color="secondary"
            class="mt-2"
            @click="editDialogOpen = true"
          >
            Edit Author
          </v-btn>

          <v-btn
            v-if="isAdmin"
            prepend-icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            class="mt-2"
            @click="deleteDialogOpen = true"
          >
            Delete Author
          </v-btn>

          <AdminEditDialog
            v-model="editDialogOpen"
            title="Edit Author"
            :fields="authorEditFields"
            :original-data="authorEditOriginalData"
            :loading="adminStore.isUpdateLoading"
            :error="editError"
            @save="handleAuthorEditSave"
          />

          <v-dialog
            v-model="deleteDialogOpen"
            max-width="400"
          >
            <v-card>
              <v-card-title>Delete Author?</v-card-title>

              <v-card-text>
                This action cannot be undone. Are you sure you want to delete "{{ author?.name }}"?
                <v-alert
                  v-if="deleteError"
                  type="error"
                  class="mt-3"
                >
                  {{ deleteError }}
                </v-alert>
              </v-card-text>

              <v-card-actions>
                <v-spacer />

                <v-btn
                  variant="text"
                  @click="deleteDialogOpen = false"
                >
                  Cancel
                </v-btn>

                <v-btn
                  color="error"
                  variant="flat"
                  :loading="adminStore.isDeleteLoading"
                  @click="handleAuthorDelete"
                >
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </ClientOnly>
      </v-col>
    </v-row>

    <!-- Content Grid -->
    <v-row>
      <!-- Personal Information Sidebar -->
      <v-col
        cols="12"
        md="3"
      >
        <v-card ref="revealSidebar">
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
                          ? author.books_ol_avg_rating.toFixed(1)
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
          ref="revealDescription"
          :description="author.bio"
          class="mb-6"
        />

        <!-- Books Section -->
        <v-card>
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
