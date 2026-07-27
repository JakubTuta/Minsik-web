<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author, BookSummary } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'
import { APP_LOCALES, DEFAULT_LOCALE } from '~~/locales.config'

// Each language edition has its own slug (see get_language_variants), so
// switching editions navigates to a different slug under this same route —
// force a remount when the slug param changes so the page's fetches don't
// keep serving the previous edition's data.
definePageMeta({
  key: route => route.params.slug as string,
})

const route = useRoute()
const booksStore = useBooksStore()
const authorsStore = useAuthorsStore()
const seriesStore = useSeriesStore()
const bookPageStore = useBookPageStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const recommendationsStore = useRecommendationsStore()
const { t } = useI18n()
const { language: uiLanguage } = useUserLanguage()

const slug = route.params.slug as string

// `?lang=` overrides which edition to show (e.g. from a hreflang variant
// link that already names its own language); absent that, the edition
// follows the UI locale so a reader on /pl/... gets the Polish edition by
// default without needing the query param.
function resolvedLang(): string {
  const q = route.query.lang

  return typeof q === 'string' && /^[a-z]{2,10}$/i.test(q)
    ? q.toLowerCase()
    : uiLanguage.value
}

const lang = ref(resolvedLang())

const { data: book, error } = await useAsyncData(
  `book-${slug}-${lang.value}`,
  () => booksStore.fetchBook(slug, lang.value),
)

// Language variants are secondary (hreflang only) — don't block navigation.
// Excluded by the SERVED language (what's actually on the page after
// edition-fallback), not the requested one — otherwise the edition already
// shown can reappear as a clickable "other edition."
const { data: langVariantsData } = useLazyAsyncData(
  `book-lang-variants-${slug}`,
  async () => {
    try {
      return await booksStore.fetchLanguageVariants(slug, book.value?.language || lang.value)
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
    message: t('bookPage.notFound'),
    fatal: true,
  })
}

// SEO — each language edition of a book has its own slug, so a translation lives at
// its own locale-prefixed path, not a `?lang=` query on the default-locale one. Built
// from the SERVED language (book.value.language), not the requested one: when the
// backend falls back to a different edition than requested, the canonical/hreflang
// must describe what's actually on the page, not what was asked for.
const localePath = useLocalePath()
const supportedLocales = new Set(APP_LOCALES.map(entry => entry.code))

/**
 * The catalogue holds editions in far more languages than the app ships
 * locales for, and the backend serves one of those rather than 404ing when no
 * edition matches. Such an edition has no locale-prefixed route of its own, so
 * it is rendered at the default locale's URL. Asking `localePath` for an
 * unconfigured locale returns an empty string, which would otherwise
 * canonicalise every one of those books to the site root.
 */
function localizedBookPath(bookSlug: string, language: string): string {
  const locale = supportedLocales.has(language)
    ? language
    : DEFAULT_LOCALE

  return localePath({ name: 'books-slug', params: { slug: bookSlug } }, locale)
}

const config = useRuntimeConfig()
const servedLang = book.value.language || lang.value
const canonicalUrl = `${config.public.siteUrl}${localizedBookPath(slug, servedLang)}`

useSeo({
  title: book.value.title,
  description: book.value.description || t('bookPage.seoDescriptionFallback', { title: book.value.title, authors: book.value.authors.map(a => a.name).join(', ') }),
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
  { name: t('nav.home'), url: `${config.public.siteUrl}${localePath('index')}` },
  ...(book.value.authors[0]
    ? [{ name: book.value.authors[0].name, url: `${config.public.siteUrl}${localePath({ name: 'authors-slug', params: { slug: book.value.authors[0].slug } })}` }]
    : []),
  { name: book.value.title },
])

// hreflang — point search engines at other language editions, each at its own slug/path
function variantHref(variantSlug: string, language: string): string {
  return `${config.public.siteUrl}${localizedBookPath(variantSlug, language)}`
}

useHead(() => {
  const variants = langVariantsData.value ?? []
  const selfLang = book.value?.language || lang.value

  // Only editions the app has a locale for get advertised: an edition in an
  // unconfigured language has no URL that renders it in that language, so a
  // hreflang pointing at it would be a promise the site cannot keep. Such a
  // book simply has no alternates — it stays indexable through its canonical.
  const editions = [
    ...(supportedLocales.has(selfLang)
      ? [{ language: selfLang, href: canonicalUrl }]
      : []),
    ...variants
      .filter(v => v.language !== selfLang && supportedLocales.has(v.language))
      .map(v => ({ language: v.language, href: variantHref(v.slug, v.language) })),
  ]

  if (editions.length === 0)
    return {}

  // Every edition of a work sees the same cluster (its own language plus the
  // variants endpoint's "all the others"), so x-default has to resolve to the
  // same URL from all of them — a cluster whose members disagree on x-default
  // is a hreflang error, not a preference. The default locale's edition is
  // that shared answer; sorting by code keeps the pick identical for a work
  // that has no default-locale edition at all.
  const orderedByCode = [...editions].sort((a, b) => a.language.localeCompare(b.language))
  const xDefault = editions.find(e => e.language === DEFAULT_LOCALE) ?? orderedByCode[0]!

  // `useLocaleHead()` in app.vue also emits alternates, and for books they are
  // wrong: it swaps the locale prefix while keeping the current slug, but every
  // edition has its own slug, so it points `pl-PL` at /pl/<english-slug>. Those
  // tags carry the id `i18n-alt-<language tag>`, so re-emitting the same ids
  // here makes unhead replace them with the edition's real URL rather than
  // leaving both versions in the head.
  const regionTagged = editions.flatMap((edition) => {
    const locale = APP_LOCALES.find(entry => entry.code === edition.language)

    return locale
      ? [{ id: `i18n-alt-${locale.language}`, rel: 'alternate', hreflang: locale.language, href: edition.href }]
      : []
  })

  return {
    link: [
      ...editions.map(e => ({ rel: 'alternate', hreflang: e.language, href: e.href })),
      ...regionTagged,
      { id: 'i18n-xd', rel: 'alternate', hreflang: 'x-default', href: xDefault.href },
    ],
  }
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

const bookEditFields = computed<EditFieldConfig[]>(() => [
  { key: 'title', label: t('bookPage.fieldTitle'), type: 'text' },
  { key: 'slug', label: t('common.fieldSlug'), type: 'text' },
  { key: 'description', label: t('common.description'), type: 'textarea' },
  { key: 'first_sentence', label: t('bookPage.fieldFirstSentence'), type: 'textarea' },
  { key: 'language', label: t('stats.language'), type: 'text' },
  { key: 'original_publication_year', label: t('bookPage.fieldPublicationYear'), type: 'number' },
  { key: 'publisher', label: t('bookPage.fieldPublisher'), type: 'text' },
  { key: 'number_of_pages', label: t('bookPage.fieldNumberOfPages'), type: 'number' },
  { key: 'primary_cover_url', label: t('bookPage.fieldCoverUrl'), type: 'text' },
  { key: 'isbn', label: t('book.isbn'), type: 'array' },
  { key: 'formats', label: t('book.editions'), type: 'array' },
  { key: 'open_library_id', label: t('common.fieldOpenLibraryId'), type: 'text' },
  { key: 'google_books_id', label: t('bookPage.fieldGoogleBooksId'), type: 'text' },
  { key: 'series_id', label: t('bookPage.fieldSeriesId'), type: 'number' },
  { key: 'series_position', label: t('bookPage.fieldSeriesPosition'), type: 'number' },
  { key: 'external_ids', label: t('bookPage.fieldExternalIds'), type: 'json' },
])

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
    removeAuthorError.value = (failed as any).error || t('seriesPage.removeFailed')

    return
  }
  await booksStore.fetchBook(slug, lang.value, true)
}

async function handleBookDelete() {
  deleteError.value = ''
  const result = await adminStore.deleteBook(book.value!.book_id)
  if (result.success) {
    deleteDialogOpen.value = false
    await navigateTo(localePath('index'))
  }
  else {
    deleteError.value = (result as any).error || t('admin.deleteFailed')
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
      await navigateTo(localePath({ name: 'books-slug', params: { slug: newSlug } }))
    }
  }
  else {
    editError.value = (result as any).error || t('admin.updateFailed')
  }
}

async function fetchLangVariants() {
  if (book.value?.slug) {
    try {
      langVariantsData.value = await booksStore.fetchLanguageVariants(book.value.slug, book.value.language || lang.value)
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
              {{ t('bookPage.editBook') }}
            </v-btn>

            <v-btn
              prepend-icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="deleteDialogOpen = true"
            >
              {{ t('bookPage.deleteBook') }}
            </v-btn>
          </div>

          <AdminEditDialog
            v-model="editDialogOpen"
            :title="t('bookPage.editBook')"
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
              <v-card-title>{{ t('bookPage.deleteBookConfirmTitle') }}</v-card-title>

              <v-card-text>
                {{ t('bookPage.deleteBookConfirmBody', {"title": book?.title}) }}
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
                  {{ t('common.cancel') }}
                </v-btn>

                <v-btn
                  color="error"
                  variant="flat"
                  :loading="adminStore.isDeleteLoading"
                  @click="handleBookDelete"
                >
                  {{ t('common.delete') }}
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
              {{ t('bookPage.firstSentence') }}
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
                {{ t('ratingsPage.ratingDistribution') }}
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
