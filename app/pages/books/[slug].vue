<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author, Book } from '~/types/api'
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
const seriesBooks = ref<Book[]>([])
const bookRecommendations = ref<RecommendationSection[]>([])
const personalizedBookRecs = ref<RecommendationSection[]>([])
const descriptionExpanded = ref(false)
const descriptionRef = ref<HTMLElement>()
const expandedHeight = ref(0)

// Description truncation
const DESCRIPTION_MAX_LENGTH = 500
const TRUNCATION_WINDOW = 20

const truncatedDescription = computed(() => {
  const desc = book.value?.description
  if (!desc || desc.length <= DESCRIPTION_MAX_LENGTH + TRUNCATION_WINDOW)
    return null

  const windowStart = DESCRIPTION_MAX_LENGTH - TRUNCATION_WINDOW
  const windowEnd = DESCRIPTION_MAX_LENGTH + TRUNCATION_WINDOW
  const window = desc.slice(windowStart, windowEnd)

  // Try to cut at paragraph boundary within window
  const paragraphIdx = window.indexOf('\n\n')
  if (paragraphIdx >= 0)
    return desc.slice(0, windowStart + paragraphIdx).trim()

  // Try to cut at sentence boundary within window
  const sentenceMatch = window.match(/[.!?](?:\s|$)/)
  if (sentenceMatch?.index != null)
    return desc.slice(0, windowStart + sentenceMatch.index + 1).trim()

  // Try to cut at word boundary within window
  const wordIdx = window.indexOf(' ')
  if (wordIdx >= 0)
    return `${desc.slice(0, windowStart + wordIdx).trim()}...`

  return `${desc.slice(0, DESCRIPTION_MAX_LENGTH).trim()}...`
})

const descriptionNeedsTruncation = computed(() => !!truncatedDescription.value)

function toggleDescription() {
  if (descriptionRef.value)
    expandedHeight.value = descriptionRef.value.scrollHeight
  descriptionExpanded.value = !descriptionExpanded.value
}

const isAdmin = computed(() => authStore.user?.role === 'admin')
const editDialogOpen = ref(false)
const editError = ref('')

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
  { key: 'series_position', label: 'Series Position', type: 'text' },
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
  series_id: book.value?.series ? null : null,
  series_position: book.value?.series_position ?? null,
}))

async function handleBookEditSave(editedData: Record<string, any>) {
  editError.value = ''
  const result = await adminStore.updateBook(book.value!.book_id, bookEditOriginalData.value, editedData)
  if (result.success) {
    editDialogOpen.value = false
    const newSlug = editedData.slug && editedData.slug !== slug ? editedData.slug : slug
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
            class="d-flex justify-end mt-2"
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
        </ClientOnly>

        <!-- Description -->
        <v-card class="mt-4">
          <v-card-text>
            <h2 class="text-h6 font-weight-bold mb-3">
              Description
            </h2>

            <template v-if="book.description">
              <div
                ref="descriptionRef"
                class="description-content"
                :class="{'description-collapsed': descriptionNeedsTruncation && !descriptionExpanded}"
                :style="descriptionNeedsTruncation && descriptionExpanded && expandedHeight
                  ? {'maxHeight': `${expandedHeight}px`}
                  : undefined"
              >
                <p
                  class="text-body-1 mb-0"
                  style="white-space: pre-line;"
                >
                  {{ book.description }}
                </p>
              </div>

              <v-btn
                v-if="descriptionNeedsTruncation"
                variant="text"
                color="secondary"
                size="small"
                class="mt-2"
                @click="toggleDescription"
              >
                {{ descriptionExpanded
                  ? 'Read less'
                  : 'Read more' }}
              </v-btn>
            </template>

            <p
              v-else
              class="text-body-1 text-medium-emphasis mb-0 font-italic"
            >
              There is no description yet, we will add it soon.
            </p>
          </v-card-text>
        </v-card>

        <!-- Cover History -->
        <!--
          <v-card
          v-if="book.cover_history && book.cover_history.length > 1"
          class="mt-4"
          >
          <v-card-text>
          <h2 class="text-h6 font-weight-bold text-primary mb-4">
          Book Cover History
          </h2>

          <div class="cover-timeline">
          <div
          v-for="(cover, index) in book.cover_history"
          :key="index"
          class="cover-timeline-item"
          >
          <div class="cover-timeline-marker">
          <div class="cover-timeline-dot" />

          <div
          v-if="index < book.cover_history.length - 1"
          class="cover-timeline-line"
          />
          </div>

          <div class="cover-timeline-content">
          <v-card
          elevation="2"
          rounded="lg"
          class="pa-2"
          >
          <v-img
          :src="cover.url"
          :alt="`Cover ${index + 1}`"
          :aspect-ratio="0.67"
          width="140"
          cover
          class="bg-surface-variant rounded"
          />

          <div class="text-caption text-secondary mt-2 text-center">
          {{ cover.size }} ({{ cover.width }}px)
          </div>
          </v-card>
          </div>
          </div>
          </div>
          </v-card-text>
          </v-card>
        -->

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

        <!-- Comments Section -->
        <ClientOnly>
          <v-card class="mt-4">
            <v-card-text>
              <BookCommentsSection :slug="slug" />
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

<style scoped>
/* Description expand/collapse */
.description-content {
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.description-collapsed {
  max-height: 10em;
  position: relative;
}

.description-collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3em;
  background: linear-gradient(transparent, rgb(var(--v-theme-surface)));
  pointer-events: none;
}
</style>
