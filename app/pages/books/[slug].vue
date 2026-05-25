<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author, BookSummary } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'

const route = useRoute()
const booksStore = useBooksStore()
const authorsStore = useAuthorsStore()
const seriesStore = useSeriesStore()
const bookPageStore = useBookPageStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const recommendationsStore = useRecommendationsStore()

const slug = route.params.slug as string

// Fetch book data
const { data: book, error } = await useAsyncData(
  `book-${slug}`,
  () => booksStore.fetchBook(slug),
)

// Handle 404
if (error.value || !book.value) {
  throw createError({
    statusCode: 404,
    message: 'Book not found',
  })
}

// SEO
const config = useRuntimeConfig()
const canonicalUrl = `${config.public.siteUrl}/books/${slug}`

useSeo({
  title: book.value.title,
  description: book.value.description || `${book.value.title} by ${book.value.authors.map(a => a.name).join(', ')}`,
  image: book.value.primary_cover_url || undefined,
  type: 'book',
  url: canonicalUrl,
  author: book.value.authors[0]?.name,
})

// Structured data
useBookStructuredData({
  name: book.value.title,
  author: book.value.authors.map(a => a.name),
  isbn: undefined,
  description: book.value.description || undefined,
  image: book.value.primary_cover_url || undefined,
  url: canonicalUrl,
  datePublished: book.value.original_publication_year?.toString(),
  inLanguage: book.value.language,
})

// Non-blocking data fetches
const primaryAuthor = ref<Author | null>(null)
const seriesBooks = ref<BookSummary[]>([])
const bookRecommendations = ref<RecommendationSection[]>([])
const personalizedBookRecs = ref<RecommendationSection[]>([])
const selectedRating = ref<number | null>(null)

function distributionCount(star: number): number {
  const dist = book.value?.rating_distribution
  if (!dist)
    return 0

  const full = dist[`${star}.0`] ?? dist[String(star)] ?? 0
  const half = star < 5
    ? (dist[`${star}.5`] ?? 0)
    : 0

  return full + half
}

const totalDistributionCount = computed(
  () => [1, 2, 3, 4, 5].reduce((sum, star) => sum + distributionCount(star), 0),
)

function distributionPercent(star: number): number {
  const total = totalDistributionCount.value
  if (total === 0)
    return 0

  return (distributionCount(star) / total) * 100
}

const avgRating = computed(() => bookPageStore.liveAvgRating ?? book.value?.avg_rating ?? 0)
const roundedAvgRating = computed(() => Math.floor(avgRating.value * 2) / 2)
const totalRatingCount = computed(() => bookPageStore.liveRatingCount ?? book.value?.rating_count ?? 0)

const selectedRatingFilters = computed<number[] | null>(() => {
  if (selectedRating.value === null)
    return null

  const n = selectedRating.value

  return n === 5
    ? [5.0]
    : [n, n + 0.5]
})

const TRAILING_DOTS_RE = /\.+$/

function formatFirstSentence(sentence: string): string {
  const trimmed = sentence.trim()
  const existingDots = (trimmed.match(TRAILING_DOTS_RE) || [''])[0].length

  if (existingDots >= 3)
    return trimmed

  return trimmed + '.'.repeat(3 - existingDots)
}

const isAdmin = computed(() => authStore.user?.role === 'admin')
const editDialogOpen = ref(false)
const editError = ref('')
const deleteDialogOpen = ref(false)
const deleteError = ref('')

const bookEditFields: EditFieldConfig[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'first_sentence', label: 'First Sentence', type: 'textarea' },
  { key: 'language', label: 'Language', type: 'text' },
  { key: 'original_publication_year', label: 'Publication Year', type: 'number' },
  { key: 'publisher', label: 'Publisher', type: 'text' },
  { key: 'number_of_pages', label: 'Number of Pages', type: 'number' },
  { key: 'primary_cover_url', label: 'Cover URL', type: 'text' },
  { key: 'isbn', label: 'ISBN', type: 'array' },
  { key: 'formats', label: 'Formats', type: 'array' },
  { key: 'open_library_id', label: 'Open Library ID', type: 'text' },
  { key: 'google_books_id', label: 'Google Books ID', type: 'text' },
  { key: 'series_id', label: 'Series ID', type: 'number' },
  { key: 'series_position', label: 'Series Position', type: 'number' },
]

const bookEditOriginalData = computed(() => ({
  title: book.value?.title ?? null,
  slug: book.value?.slug ?? null,
  description: book.value?.description ?? null,
  first_sentence: book.value?.first_sentence ?? null,
  language: book.value?.language ?? null,
  original_publication_year: book.value?.original_publication_year ?? null,
  publisher: book.value?.publisher ?? null,
  number_of_pages: book.value?.number_of_pages || null,
  primary_cover_url: book.value?.primary_cover_url ?? null,
  isbn: book.value?.isbn ?? [],
  formats: book.value?.formats ?? [],
  open_library_id: book.value?.open_library_id ?? null,
  google_books_id: book.value?.google_books_id ?? null,
  series_id: book.value?.series
    ? book.value.series.series_id
    : null,
  series_position: book.value?.series_position ?? null,
}))

async function handleBookDelete() {
  deleteError.value = ''
  const result = await adminStore.deleteBook(book.value!.book_id)
  if (result.success) {
    deleteDialogOpen.value = false
    await navigateTo('/')
  }
  else {
    deleteError.value = (result as any).error || 'Delete failed'
  }
}

async function handleBookEditSave(editedData: Record<string, any>) {
  editError.value = ''
  const result = await adminStore.updateBook(book.value!.book_id, bookEditOriginalData.value, editedData)
  if (result.success) {
    editDialogOpen.value = false
    const newSlug = editedData.slug && editedData.slug !== slug
      ? editedData.slug
      : slug
    await booksStore.fetchBook(newSlug, true)
    if (newSlug !== slug) {
      await navigateTo(`/books/${newSlug}`)
    }
  }
  else {
    editError.value = (result as any).error || 'Update failed'
  }
}

onMounted(async () => {
  if (book.value?.authors[0]?.slug) {
    try {
      primaryAuthor.value = await authorsStore.fetchAuthor(book.value.authors[0].slug)
    }
    catch { /* Silently fail */ }
  }

  if (book.value?.series?.slug) {
    try {
      seriesBooks.value = await seriesStore.fetchSeriesBooks(book.value.series.slug)
    }
    catch { /* Silently fail */ }
  }

  if (book.value?.book_id) {
    try {
      bookRecommendations.value = await recommendationsStore.fetchBookRecommendations(book.value.book_id) ?? []
    }
    catch { /* Silently fail */ }
  }
})

watch(() => authStore.isAuthenticated, (isAuth) => {
  bookPageStore.resetState()
  bookPageStore.currentSlug = slug
  if (isAuth) {
    bookPageStore.fetchBookUserData(slug)
  }
}, { immediate: true })

watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth && book.value?.book_id)
    personalizedBookRecs.value = await recommendationsStore.fetchPersonalizedBookRecommendations(book.value.book_id) ?? []
  else
    personalizedBookRecs.value = []
}, { immediate: true })

onUnmounted(() => {
  bookPageStore.resetState()
})
</script>

<template>
  <v-container v-if="book">
    <v-row>
      <v-col cols="12">
        <!-- Book Header -->
        <BookHeader
          :book="book"
          :slug="slug"
          :series-books="seriesBooks"
          :primary-author="primaryAuthor"
        />

        <ClientOnly>
          <div
            v-if="isAdmin"
            class="d-flex mt-2 justify-end gap-2"
          >
            <v-btn
              prepend-icon="mdi-pencil"
              variant="text"
              size="small"
              color="secondary"
              @click="editDialogOpen = true"
            >
              Edit Book
            </v-btn>

            <v-btn
              prepend-icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="deleteDialogOpen = true"
            >
              Delete Book
            </v-btn>
          </div>

          <AdminEditDialog
            v-model="editDialogOpen"
            title="Edit Book"
            :fields="bookEditFields"
            :original-data="bookEditOriginalData"
            :loading="adminStore.isUpdateLoading"
            :error="editError"
            @save="handleBookEditSave"
          />

          <v-dialog
            v-model="deleteDialogOpen"
            max-width="400"
          >
            <v-card>
              <v-card-title>Delete Book?</v-card-title>

              <v-card-text>
                This action cannot be undone. Are you sure you want to delete "{{ book?.title }}"?
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
                  @click="handleBookDelete"
                >
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </ClientOnly>

        <!-- First Sentence -->
        <v-card
          v-if="book.first_sentence"
          class="mt-4"
        >
          <v-card-text class="pa-6">
            <h2 class="text-h6 font-weight-bold mb-3">
              First sentence
            </h2>

            <div style="max-width: 60%;">
              <p class="text-h5 mb-0 font-serif font-italic">
                {{ formatFirstSentence(book.first_sentence) }}
              </p>
            </div>
          </v-card-text>
        </v-card>

        <!-- Description + External Links -->
        <v-row class="mt-4">
          <v-col
            cols="12"
            md="8"
          >
            <LongDescriptionCard :description="book.description" />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <ExternalLinksSection :book="book" />
          </v-col>
        </v-row>

        <!-- Rating -->
        <v-card class="mt-4">
          <v-card-text>
            <SubRatingSection
              :stats="bookPageStore.liveSubRatingStats ?? book.sub_rating_stats ?? {}"
              :rating-count="bookPageStore.liveRatingCount ?? book.rating_count ?? 0"
              :slug="slug"
            />
          </v-card-text>
        </v-card>

        <!-- Book Recommendations -->
        <ClientOnly>
          <div
            v-if="personalizedBookRecs.length > 0 || recommendationsStore.isLoadingPersonalizedBookRecs"
            class="mt-8"
          >
            <RecommendationRowSkeleton v-if="recommendationsStore.isLoadingPersonalizedBookRecs" />

            <template v-else>
              <template
                v-for="category in personalizedBookRecs"
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
            v-if="bookRecommendations.length > 0 || recommendationsStore.isLoadingBookRecs"
            class="mt-8"
          >
            <RecommendationRowSkeleton v-if="recommendationsStore.isLoadingBookRecs" />

            <template v-else>
              <template
                v-for="category in bookRecommendations"
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

        <!-- Rating Distribution -->
        <ClientOnly>
          <v-card class="mt-4">
            <v-card-text>
              <h2 class="text-h6 font-weight-bold mb-4">
                Rating Distribution
              </h2>

              <v-row align="center">
                <!-- Left: avg + stars + count -->
                <v-col
                  cols="12"
                  sm="4"
                  class="d-flex flex-column align-center text-center"
                >
                  <div class="text-h2 font-weight-bold text-primary">
                    {{ avgRating.toFixed(1) }}
                  </div>

                  <v-rating
                    :model-value="roundedAvgRating"
                    readonly
                    half-increments
                    color="warning"
                    active-color="warning"
                    density="compact"
                  />

                  <div class="text-body-2 text-secondary mt-1">
                    with {{ totalRatingCount.toLocaleString() }} ratings
                  </div>
                </v-col>

                <!-- Right: horizontal bar rows 5→1 -->
                <v-col
                  cols="12"
                  sm="8"
                >
                  <div
                    v-for="star in [
                      5,
                      4,
                      3,
                      2,
                      1,
                    ]"
                    :key="star"
                    class="d-flex align-center mb-2 cursor-pointer gap-2 rounded pa-1"
                    :class="{'bg-primary-lighten-4': selectedRating === star}"
                    @click="selectedRating = selectedRating === star
                      ? null
                      : star"
                  >
                    <span
                      class="text-body-2 font-weight-bold"
                      style="min-width: 10px; text-align: right;"
                    >{{ star }}</span>

                    <v-icon
                      icon="mdi-star"
                      size="small"
                      color="warning"
                    />

                    <v-progress-linear
                      :model-value="distributionPercent(star)"
                      color="primary"
                      rounded
                      height="10"
                      class="flex-1"
                    />

                    <span
                      class="text-body-2"
                      style="min-width: 40px; text-align: right;"
                    >{{ distributionCount(star).toLocaleString() }}</span>

                    <span
                      class="text-caption text-secondary"
                      style="min-width: 36px; text-align: right;"
                    >{{ distributionPercent(star).toFixed(0) }}%</span>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </ClientOnly>

        <!-- Comments Section -->
        <ClientOnly>
          <v-card class="mt-4">
            <v-card-text>
              <BookCommentsSection
                :slug="slug"
                :selected-rating-filters="selectedRatingFilters"
              />
            </v-card-text>
          </v-card>
        </ClientOnly>
      </v-col>
    </v-row>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="booksStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>
