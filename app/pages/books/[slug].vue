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

function resolvedLang(): string {
  const q = route.query.lang

  return typeof q === 'string' && /^[a-z]{2,10}$/i.test(q)
    ? q.toLowerCase()
    : 'en'
}

const lang = ref(resolvedLang())

const { data: book, error } = await useAsyncData(
  `book-${slug}-${lang.value}`,
  () => booksStore.fetchBook(slug, lang.value),
)

// Language variants are secondary (hreflang only) — don't block navigation
const { data: langVariantsData } = useLazyAsyncData(
  `book-lang-variants-${slug}`,
  async () => {
    try {
      return await booksStore.fetchLanguageVariants(slug, lang.value)
    }
    catch {
      return []
    }
  },
  { default: () => [] },
)

// Handle 404
if (error.value || !book.value) {
  throw createError({
    statusCode: 404,
    message: 'Book not found',
    fatal: true,
  })
}

// SEO — non-English editions live at ?lang=xx, so their canonical must include the query
const config = useRuntimeConfig()
const baseUrl = `${config.public.siteUrl}/books/${slug}`
const canonicalUrl = lang.value === 'en'
  ? baseUrl
  : `${baseUrl}?lang=${lang.value}`

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
  isbn: book.value.isbn?.[0],
  description: book.value.description || undefined,
  image: book.value.primary_cover_url || undefined,
  url: canonicalUrl,
  datePublished: book.value.original_publication_year?.toString(),
  inLanguage: book.value.language,
  numberOfPages: book.value.number_of_pages || undefined,
  publisher: book.value.publisher || undefined,
  genres: book.value.genres?.map(g => g.name),
  ratingValue: book.value.avg_rating || undefined,
  ratingCount: book.value.rating_count || undefined,
})

useBreadcrumbStructuredData([
  { name: 'Home', url: config.public.siteUrl as string },
  ...(book.value.authors[0]
    ? [{ name: book.value.authors[0].name, url: `${config.public.siteUrl}/authors/${book.value.authors[0].slug}` }]
    : []),
  { name: book.value.title },
])

// hreflang — point search engines at other language editions (?lang=xx variants)
function variantHref(variantSlug: string, language: string): string {
  return language === 'en'
    ? `${config.public.siteUrl}/books/${variantSlug}`
    : `${config.public.siteUrl}/books/${variantSlug}?lang=${language}`
}

useHead(() => {
  const variants = langVariantsData.value ?? []
  const selfLang = book.value?.language || lang.value
  const links = [
    { rel: 'alternate', hreflang: selfLang, href: canonicalUrl },
    ...variants
      .filter(v => v.language !== selfLang)
      .map(v => ({
        rel: 'alternate',
        hreflang: v.language,
        href: variantHref(v.slug, v.language),
      })),
    { rel: 'alternate', hreflang: 'x-default', href: baseUrl },
  ]

  return { link: links }
})

const { data: primaryAuthor } = useLazyAsyncData<Author | null>(
  `book-primary-author-${slug}`,
  async () => {
    if (!book.value?.authors[0]?.slug)
      return null
    try {
      return await authorsStore.fetchAuthor(book.value.authors[0].slug)
    }
    catch {
      return null
    }
  },
  { watch: [book], default: () => null },
)

const { data: seriesBooks } = useLazyAsyncData<BookSummary[]>(
  `book-series-books-${slug}`,
  async () => {
    if (!book.value?.series?.slug)
      return []
    try {
      return await seriesStore.fetchSeriesBooks(book.value.series.slug)
    }
    catch {
      return []
    }
  },
  { watch: [book], default: () => [] },
)

const bookRecommendations = ref<RecommendationSection[]>([])
const personalizedBookRecs = ref<RecommendationSection[]>([])
const selectedRating = ref<number | null>(null)

const avgRating = computed(() => bookPageStore.liveAvgRating ?? book.value?.avg_rating ?? 0)
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
const removeAuthorError = ref('')

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
  { key: 'external_ids', label: 'External IDs', type: 'json' },
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
  external_ids: book.value?.external_ids ?? {},
}))

async function handleRemoveAuthors(authorIds: number[]) {
  removeAuthorError.value = ''
  const results = await Promise.all(
    authorIds.map(id => adminStore.removeBookAuthor(book.value!.book_id, id)),
  )
  const failed = results.find(r => !r.success)
  if (failed) {
    removeAuthorError.value = (failed as any).error || 'Remove failed'

    return
  }
  await booksStore.fetchBook(slug, lang.value, true)
}

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
    await booksStore.fetchBook(newSlug, lang.value, true)
    if (newSlug !== slug) {
      await navigateTo(`/books/${newSlug}`)
    }
  }
  else {
    editError.value = (result as any).error || 'Update failed'
  }
}

async function fetchLangVariants() {
  if (book.value?.slug) {
    try {
      langVariantsData.value = await booksStore.fetchLanguageVariants(book.value.slug, lang.value)
    }
    catch { /* Silently fail */ }
  }
}

onMounted(async () => {
  if (book.value?.book_id) {
    try {
      bookRecommendations.value = await recommendationsStore.fetchBookRecommendations(book.value.book_id) ?? []
    }
    catch { /* Silently fail */ }
  }
})

watch(() => route.query.lang, async () => {
  const newLang = resolvedLang()
  if (newLang === lang.value)
    return
  lang.value = newLang
  book.value = await booksStore.fetchBook(slug, newLang)
  fetchLangVariants()
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
  if (bookPageStore.currentSlug === slug) {
    bookPageStore.resetState()
  }
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
          :lang-variants="langVariantsData"
          :current-lang="lang"
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
            :authors="book.authors"
            :loading="adminStore.isUpdateLoading"
            :error="editError || removeAuthorError"
            @save="handleBookEditSave"
            @remove-authors="handleRemoveAuthors"
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

            <div class="max-w-full md:max-w-3/5">
              <p class="text-h5 mb-0 font-serif font-italic">
                {{ formatFirstSentence(book.first_sentence) }}
              </p>
            </div>
          </v-card-text>
        </v-card>

        <!-- Description -->
        <LongDescriptionCard
          :description="book.description"
          class="mt-4"
        />

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
            v-if="personalizedBookRecs.length > 0"
            class="mt-8"
          >
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
          </div>

          <div
            v-if="bookRecommendations.length > 0"
            class="mt-8"
          >
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
          </div>
        </ClientOnly>

        <!-- Rating Distribution -->
        <ClientOnly>
          <v-card class="mt-4">
            <v-card-text>
              <h2 class="text-h6 font-weight-bold mb-4">
                Rating Distribution
              </h2>

              <RatingDistributionCard
                :avg-rating="avgRating"
                :rating-count="totalRatingCount"
                :distribution="book.rating_distribution ?? {}"
                clickable
                :selected-star="selectedRating"
                @update:selected-star="selectedRating = $event"
              />
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
