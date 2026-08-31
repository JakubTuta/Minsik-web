<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author, AuthorStats, BookSummary } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'
import { APP_LOCALES, DEFAULT_LOCALE } from '~~/locales.config'

const LANGUAGE_QUERY_RE = /^[a-z]{2,10}$/i
const TRAILING_DOTS_RE = /\.+$/

// Each edition has its own slug, so switching edition is a slug change on this
// same route — remount so the fetches stop serving the previous edition.
// `ownsLocaleAlternates`: useLocaleHead() would point pl-PL at /pl/<en-slug>,
// so app.vue drops its alternates here and this page emits the real set.
definePageMeta({
  key: route => route.params.slug as string,
  ownsLocaleAlternates: true,
})

const route = useRoute()
const booksStore = useBooksStore()
const authorsStore = useAuthorsStore()
const seriesStore = useSeriesStore()
const bookPageStore = useBookPageStore()
const authStore = useAuthStore()
const recommendationsStore = useRecommendationsStore()
const { t } = useI18n()
const genreLabel = useGenreLabel()
const { language: uiLanguage } = useUserLanguage()

const slug = route.params.slug as string

// `?lang=` names an edition explicitly; otherwise it follows the UI locale.
// Computed: the route key is pinned to the slug, so a locale switch remounts nothing.
const lang = computed<string>(() => {
  const q = route.query.lang

  return typeof q === 'string' && LANGUAGE_QUERY_RE.test(q)
    ? q.toLowerCase()
    : uiLanguage.value
})

// Language in the key, not a `watch`: the key change refetches while keeping
// the current edition on screen, and never serves another language's payload.
const { data: book, error, refresh: refreshBookData } = await useCachedAsyncData(
  computed(() => `book-${slug}-${lang.value}`),
  () => booksStore.fetchBook(slug, lang.value),
)

// Handle 404
if (error.value || !book.value) {
  throw createError({
    statusCode: 404,
    message: t('bookPage.notFound'),
    fatal: true,
  })
}

// SEO — built from the SERVED edition, not the requested one: on edition
// fallback the head has to describe what is actually on the page.
const localePath = useLocalePath()
const supportedLocales = new Set(APP_LOCALES.map(entry => entry.code))

// An edition in an unconfigured language renders at the default locale's URL:
// `localePath` returns '' for those, canonicalising the book to the site root.
function localizedBookPath(bookSlug: string, language: string): string {
  const locale = supportedLocales.has(language)
    ? language
    : DEFAULT_LOCALE

  // `localePath` is typed to the configured codes; the guard above establishes it.
  return localePath({ name: 'books-slug', params: { slug: bookSlug } }, locale as Parameters<typeof localePath>[1])
}

/** hreflang wants the full tag the app serves (`pl-PL`), not the API's `pl`. */
function localeTag(language: string): string {
  return APP_LOCALES.find(entry => entry.code === language)?.language ?? language
}

const config = useRuntimeConfig()
// Derived, not captured — the served edition changes with the interface language.
// The canonical uses its own slug so another slug cannot mint a second URL.
const servedLang = computed(() => book.value?.language || lang.value)
const servedSlug = computed(() => book.value?.slug || slug)
const canonicalUrl = computed(() => `${config.public.siteUrl}${localizedBookPath(servedSlug.value, servedLang.value)}`)

// Excluded by the SERVED language, not the requested one — otherwise the
// edition already on screen reappears as an "other edition" link.
const { data: langVariantsData } = useLazyAsyncData(
  computed(() => `book-lang-variants-${slug}-${servedLang.value}`),
  async () => {
    try {
      return await booksStore.fetchLanguageVariants(slug, servedLang.value)
    }
    catch {
      return []
    }
  },
  { default: () => [] },
)

useSeo({
  title: computed(() => book.value?.title ?? ''),
  description: computed(() => book.value?.description
    || t('bookPage.seoDescriptionFallback', {
      title: book.value?.title ?? '',
      authors: (book.value?.authors ?? []).map(a => a.name).join(', '),
    })),
  image: computed(() => book.value?.primary_cover_url || undefined),
  type: 'book',
  url: canonicalUrl,
  author: computed(() => book.value?.authors[0]?.name),
})

useBookStructuredData(() => ({
  name: book.value?.title ?? '',
  author: (book.value?.authors ?? []).map(a => a.name),
  isbn: book.value?.isbn?.[0],
  description: book.value?.description || undefined,
  image: book.value?.primary_cover_url || undefined,
  url: canonicalUrl.value,
  datePublished: book.value?.original_publication_year?.toString(),
  inLanguage: servedLang.value,
  numberOfPages: book.value?.number_of_pages || undefined,
  publisher: book.value?.publisher || undefined,
  genres: book.value?.genres?.map(g => genreLabel(g.slug)),
  ratingValue: book.value?.avg_rating || undefined,
  ratingCount: book.value?.rating_count || undefined,
}))

useBreadcrumbStructuredData(() => [
  { name: t('nav.home'), url: `${config.public.siteUrl}${localePath('index')}` },
  ...(book.value?.authors[0]
    ? [{ name: book.value.authors[0].name, url: `${config.public.siteUrl}${localePath({ name: 'authors-slug', params: { slug: book.value.authors[0].slug } })}` }]
    : []),
  { name: book.value?.title ?? '' },
])

// Only editions the app has a locale for: a hreflang at an unconfigured
// language would name a URL that cannot serve it. Such a book has none.
useHead(() => {
  const selfLang = servedLang.value
  const editions = [
    ...(supportedLocales.has(selfLang)
      ? [{ language: selfLang, href: canonicalUrl.value }]
      : []),
    ...(langVariantsData.value ?? [])
      .filter(variant => variant.language !== selfLang && supportedLocales.has(variant.language))
      .map(variant => ({
        language: variant.language,
        href: `${config.public.siteUrl}${localizedBookPath(variant.slug, variant.language)}`,
      })),
  ]

  if (editions.length === 0)
    return {}

  // Every edition sees the same cluster, so x-default has to resolve to the
  // same URL from all of them; sorting by code keeps the pick stable.
  const orderedByCode = [...editions].sort((a, b) => a.language.localeCompare(b.language))
  const xDefault = editions.find(edition => edition.language === DEFAULT_LOCALE) ?? orderedByCode[0]!

  return {
    link: [
      ...editions.map(edition => ({ rel: 'alternate', hreflang: localeTag(edition.language), href: edition.href })),
      { rel: 'alternate', hreflang: 'x-default', href: xDefault.href },
    ],
  }
})

// `server: false` — none of these feeds the head or a crawler, and `lazy`
// alone would still block the server response.
const { data: primaryAuthor } = useLazyAsyncData<Author | null>(
  computed(() => `book-primary-author-${slug}-${servedLang.value}`),
  async () => {
    const authorSlug = book.value?.authors[0]?.slug
    if (!authorSlug)
      return null
    try {
      return await authorsStore.fetchAuthor(authorSlug)
    }
    catch {
      return null
    }
  },
  { default: () => null, server: false },
)

const { data: seriesBooks } = useLazyAsyncData<BookSummary[]>(
  computed(() => `book-series-books-${slug}-${servedLang.value}`),
  async () => {
    const seriesSlug = book.value?.series?.slug
    if (!seriesSlug)
      return []
    try {
      return await seriesStore.fetchSeriesBooks(seriesSlug)
    }
    catch {
      return []
    }
  },
  { default: () => [], server: false },
)

// Comparison needs the author's catalogue by rating, plus its true size.
const { data: authorBooks } = useLazyAsyncData<BookSummary[]>(
  computed(() => `book-author-books-${slug}-${servedLang.value}`),
  async () => {
    const authorSlug = book.value?.authors[0]?.slug
    if (!authorSlug)
      return []
    try {
      return await authorsStore.fetchAuthorBooks(authorSlug, 'combined_rating', 'desc')
    }
    catch {
      return []
    }
  },
  { default: () => [], server: false },
)

const { data: authorStats } = useLazyAsyncData<AuthorStats | null>(
  computed(() => `book-author-stats-${slug}-${servedLang.value}`),
  () => {
    const authorSlug = book.value?.authors[0]?.slug

    return authorSlug
      ? authorsStore.fetchAuthorStats(authorSlug)
      : Promise.resolve(null)
  },
  { default: () => null, server: false },
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

function formatFirstSentence(sentence: string): string {
  const trimmed = sentence.trim()
  const existingDots = (trimmed.match(TRAILING_DOTS_RE) || [''])[0].length

  if (existingDots >= 3)
    return trimmed

  return trimmed + '.'.repeat(3 - existingDots)
}

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

// The page renders the `useAsyncData` copy, not the store, so both need it.
async function refreshBook(nextSlug: string) {
  await booksStore.fetchBook(nextSlug, lang.value, true)
  if (nextSlug === slug)
    await refreshBookData()
}

// Seeded from the edition on screen, so they follow it when it changes.
watch(() => book.value?.book_id, async (bookId) => {
  if (!bookId)
    return
  try {
    bookRecommendations.value = await recommendationsStore.fetchBookRecommendations(bookId) ?? []
  }
  catch { /* Silently fail */ }
}, { immediate: import.meta.client })

watch(() => authStore.isAuthenticated, (isAuth) => {
  bookPageStore.resetState()
  bookPageStore.currentSlug = slug
  if (isAuth) {
    bookPageStore.fetchBookUserData(slug)
  }
}, { immediate: true })

watch([() => authStore.isAuthenticated, () => book.value?.book_id], async ([isAuth, bookId]) => {
  if (isAuth && bookId)
    personalizedBookRecs.value = await recommendationsStore.fetchPersonalizedBookRecommendations(bookId) ?? []
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
          :series-books="seriesBooks ?? []"
          :primary-author="primaryAuthor"
          :lang-variants="langVariantsData ?? []"
          :current-lang="lang"
        />

        <AdminEntityActions
          :id="book.book_id"
          entity="book"
          :name="book.title"
          :slug="book.slug"
          :fields="bookEditFields"
          :original-data="bookEditOriginalData"
          :authors="book.authors"
          :refresh="refreshBook"
          container-class="mt-2 justify-end"
        />

        <!-- First Sentence -->
        <QuoteBlock
          v-if="book.first_sentence"
          :label="t('bookPage.firstSentence')"
          :text="formatFirstSentence(book.first_sentence)"
          class="mt-12"
        >
          <template #caption>
            {{ book.original_publication_year
              ? t('bookPage.firstSentenceCaptionYear', {'year': book.original_publication_year})
              : t('bookPage.firstSentenceCaption') }}
          </template>
        </QuoteBlock>

        <!-- Description -->
        <div class="mt-12">
          <SectionHeading
            :eyebrow="t('bookPage.premiseEyebrow')"
            :title="t('bookPage.premiseTitle')"
          />

          <DescriptionCard
            :description="book.description"
            hide-heading
          />
        </div>

        <!-- Detailed ratings -->
        <div class="mt-12">
          <LazySubRatingSection
            hydrate-on-visible
            :stats="bookPageStore.liveSubRatingStats ?? book.sub_rating_stats ?? {}"
            :rating-count="bookPageStore.liveRatingCount ?? book.rating_count ?? 0"
            :slug="slug"
          />
        </div>

        <!-- Where it sits -->
        <ClientOnly>
          <LazyBookComparisonCard
            :book="book"
            :author="primaryAuthor"
            :author-books="authorBooks ?? []"
            :author-works-count="authorStats?.works_count ?? null"
            :series-books="seriesBooks ?? []"
            class="mt-12"
          />
        </ClientOnly>

        <!-- Book Recommendations -->
        <ClientOnly>
          <RecommendationSections
            :sections="personalizedBookRecs"
            class="mt-12"
          />

          <RecommendationSections
            :sections="bookRecommendations"
            class="mt-12"
          />
        </ClientOnly>

        <!-- Ratings and comments -->
        <ClientOnly>
          <div class="mt-12">
            <SectionHeading
              :eyebrow="t('bookPage.verdictEyebrow')"
              :title="t('bookPage.verdictTitle')"
              :subtitle="t('bookPage.verdictSubtitle')"
            />

            <v-card>
              <v-card-text>
                <RatingDistributionCard
                  :avg-rating="avgRating"
                  :rating-count="totalRatingCount"
                  :distribution="bookPageStore.liveRatingDistribution ?? book.rating_distribution ?? {}"
                  clickable
                  :selected-star="selectedRating"
                  @update:selected-star="selectedRating = $event"
                />

                <v-divider class="my-8" />

                <BookCommentsSection
                  :slug="slug"
                  :selected-rating-filters="selectedRatingFilters"
                />
              </v-card-text>
            </v-card>
          </div>
        </ClientOnly>
      </v-col>
    </v-row>
  </v-container>
</template>
