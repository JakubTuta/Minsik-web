<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { BookSummary } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'

const BOOKS_PAGE_SIZE = 20

const route = useRoute()
const authorsStore = useAuthorsStore()
const recommendationsStore = useRecommendationsStore()
const authStore = useAuthStore()
const { t } = useI18n()
// Language is in every key, not a `watch`: a locale switch changes the path,
// which remounts the page, and a fresh mount never fires a watcher.
const { language } = useUserLanguage()

const slug = route.params.slug as string

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc' | 'readers-desc' | 'readers-asc'
const sortBy = ref<SortOption>('date-desc')
const viewMode = ref<'list' | 'timeline'>('list')

// Grouping only makes sense over rows the list view actually holds.
const seriesOnly = ref(false)

const sortByMap: Record<string, 'publication_year' | 'combined_rating' | 'readers_count'> = {
  date: 'publication_year',
  rating: 'combined_rating',
  readers: 'readers_count',
}

// The timeline reads as a chronology, so it ignores the list's sort order.
const sortParams = computed(() => {
  if (viewMode.value === 'timeline')
    return { sortBy: 'publication_year' as const, order: 'desc' as const }

  const [field = 'date', direction = 'desc'] = sortBy.value.split('-')

  return {
    sortBy: sortByMap[field] ?? 'publication_year',
    order: direction as 'asc' | 'desc',
  }
})

const { data: author, error: authorError, refresh: refreshAuthorData } = await useCachedAsyncData(
  computed(() => `author-${slug}-${language.value}`),
  () => authorsStore.fetchAuthor(slug),
)

if (authorError.value || !author.value) {
  throw createError({ statusCode: 404, message: t('authorPage.notFound'), fatal: true })
}

// `lazy` does not opt out of SSR, and this list has to reach crawlers — hence
// a computed off the payload, not a watcher: watchers never fire on the server.
const booksKey = computed(() => `author-books-${slug}-${language.value}-${sortParams.value.sortBy}-${sortParams.value.order}`)

const { data: firstBooksPage, status: booksStatus } = useCachedAsyncData(
  booksKey,
  () => authorsStore.fetchAuthorBooksPage(slug, sortParams.value.sortBy, sortParams.value.order, 0, BOOKS_PAGE_SIZE),
  { lazy: true },
)

const loadedPages = ref<BookSummary[]>([])
const isLoadingMore = ref(false)

const allBooks = computed(() => [...(firstBooksPage.value?.books ?? []), ...loadedPages.value])
const booksTotalCount = computed(() => firstBooksPage.value?.total_count ?? 0)
const hasMoreBooks = computed(() => allBooks.value.length < booksTotalCount.value)
const isLoadingBooks = computed(() => booksStatus.value === 'pending' || isLoadingMore.value)

// A different ordering is a different list.
watch(booksKey, () => {
  loadedPages.value = []
})

watch(viewMode, (mode) => {
  if (mode !== 'list')
    seriesOnly.value = false
})

// Vuetify's `loading` greys a button out but does not disable it, hence the
// flag; the key check drops a page that lands after the reader re-sorted.
async function loadMoreBooks() {
  if (isLoadingMore.value || !hasMoreBooks.value)
    return

  const requestKey = booksKey.value
  const { sortBy: apiSortBy, order } = sortParams.value
  isLoadingMore.value = true

  try {
    const result = await authorsStore.fetchAuthorBooksPage(slug, apiSortBy, order, allBooks.value.length, BOOKS_PAGE_SIZE)
    if (booksKey.value === requestKey)
      loadedPages.value.push(...result.books)
  }
  finally {
    isLoadingMore.value = false
  }
}

const { data: authorQuote } = useCachedAsyncData(
  computed(() => `author-quote-${slug}-${language.value}`),
  () => authorsStore.fetchAuthorQuote(slug),
  { lazy: true },
)

const { data: topBooks, status: topBooksStatus } = useCachedAsyncData(
  computed(() => `author-top-books-${slug}-${language.value}`),
  () => authorsStore.fetchAuthorTopBooks(slug),
  { lazy: true, default: () => [] },
)

// The progress half of this payload is the viewer's, so auth has to refetch it.
const { data: authorStats } = useCachedAsyncData(
  computed(() => `author-stats-${slug}-${language.value}`),
  () => authorsStore.fetchAuthorStats(slug),
  { lazy: true, watch: [() => authStore.isAuthenticated] },
)

// One author row per language, so the canonical just follows the current
// locale's URL; alternates come from useLocaleHead() in app.vue.
const config = useRuntimeConfig()
const localePath = useLocalePath()
const canonicalUrl = computed(() => `${config.public.siteUrl}${route.path}`)

useSeo({
  title: computed(() => author.value?.name ?? ''),
  description: computed(() => author.value?.bio
    || t('authorPage.seoDescriptionFallback', { name: author.value?.name ?? '', count: author.value?.books_count ?? 0 })),
  image: computed(() => author.value?.photo_url ?? undefined),
  type: 'profile',
  url: canonicalUrl,
  author: computed(() => author.value?.name),
})

useAuthorStructuredData(() => ({
  name: author.value?.name ?? '',
  description: author.value?.bio,
  image: author.value?.photo_url ?? undefined,
  url: canonicalUrl.value,
  birthDate: author.value?.birth_date,
  deathDate: author.value?.death_date,
  sameAs: [
    author.value?.wikipedia_url,
    author.value?.wikidata_id
      ? `https://www.wikidata.org/wiki/${author.value.wikidata_id}`
      : null,
  ].filter((entry): entry is string => !!entry),
}))

useBreadcrumbStructuredData(() => [
  { name: t('nav.home'), url: `${config.public.siteUrl}${localePath('index')}` },
  { name: author.value?.name ?? '' },
])

const sortOptions = computed(() => [
  { value: 'date-desc', title: t('authorPage.sortNewestFirst') },
  { value: 'date-asc', title: t('authorPage.sortOldestFirst') },
  { value: 'rating-desc', title: t('authorPage.sortHighestRated') },
  { value: 'rating-asc', title: t('authorPage.sortLowestRated') },
  { value: 'readers-desc', title: t('authorPage.sortMostReaders') },
  { value: 'readers-asc', title: t('authorPage.sortLeastReaders') },
])

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

const authorEditFields = computed<EditFieldConfig[]>(() => [
  { key: 'name', label: t('author.fieldName'), type: 'text' },
  { key: 'slug', label: t('common.fieldSlug'), type: 'text' },
  { key: 'bio', label: t('author.fieldBiography'), type: 'textarea' },
  { key: 'birth_date', label: t('author.fieldBirthDate'), type: 'text' },
  { key: 'death_date', label: t('author.fieldDeathDate'), type: 'text' },
  { key: 'birth_place', label: t('author.fieldBirthPlace'), type: 'text' },
  { key: 'nationality', label: t('author.fieldNationality'), type: 'text' },
  { key: 'photo_url', label: t('author.fieldPhotoUrl'), type: 'text' },
  { key: 'wikipedia_url', label: t('author.fieldWikipediaUrl'), type: 'text' },
  { key: 'wikidata_id', label: t('author.fieldWikidataId'), type: 'text' },
  { key: 'open_library_id', label: t('common.fieldOpenLibraryId'), type: 'text' },
  { key: 'alternate_names', label: t('author.fieldAlternateNames'), type: 'array' },
  { key: 'remote_ids', label: t('author.fieldRemoteIds'), type: 'json' },
])

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
  remote_ids: author.value?.remote_ids ?? {},
}))

// The page renders the `useAsyncData` copy, not the store, so both need it.
async function refreshAuthor(nextSlug: string) {
  await authorsStore.fetchAuthor(nextSlug, true)
  if (nextSlug === slug)
    await refreshAuthorData()
}
</script>

<template>
  <v-container v-if="author">
    <!-- Header -->
    <div class="mb-16">
      <AuthorHeader
        :author="author"
        :stats="authorStats"
      />

      <AdminEntityActions
        :id="author.author_id"
        entity="author"
        :name="author.name"
        :slug="author.slug"
        :fields="authorEditFields"
        :original-data="authorEditOriginalData"
        :refresh="refreshAuthor"
        container-class="mt-4"
      />
    </div>

    <!-- Quote -->
    <div
      v-if="authorQuote"
      class="mb-16"
    >
      <AuthorQuoteCard :quote="authorQuote" />
    </div>

    <!-- Shape of the catalogue -->
    <div
      v-if="authorStats"
      class="mb-16"
    >
      <LazyAuthorCatalogueShape
        hydrate-on-visible
        :stats="authorStats"
      />
    </div>

    <!-- Top 3 Books (podium) -->
    <div class="mb-16">
      <AuthorTopBooks
        :books="topBooks ?? []"
        :loading="topBooksStatus === 'pending'"
      />
    </div>

    <!-- Books Section -->
    <div id="books-list">
      <SectionHeading
        :eyebrow="t('authorPage.catalogueEyebrow')"
        :title="t('authorPage.booksHeading')"
        :subtitle="t('authorPage.catalogueSubtitle')"
      />

      <div class="d-flex flex-column flex-sm-row align-sm-center mb-8 gap-4">
        <v-select
          v-if="viewMode === 'list'"
          v-model="sortBy"
          :items="sortOptions"
          density="comfortable"
          variant="outlined"
          hide-details
          style="min-width: 220px; max-width: 260px;"
        />

        <v-chip
          v-if="viewMode === 'list'"
          size="large"
          :variant="seriesOnly
            ? 'flat'
            : 'outlined'"
          :color="seriesOnly
            ? 'primary'
            : undefined"
          prepend-icon="mdi-format-list-group"
          class="px-5"
          @click="seriesOnly = !seriesOnly"
        >
          {{ t('authorPage.groupSeries') }}
        </v-chip>

        <v-spacer class="d-none d-sm-block" />

        <v-btn-toggle
          v-model="viewMode"
          mandatory
          density="comfortable"
          variant="outlined"
          color="primary"
          rounded="pill"
        >
          <v-btn
            value="list"
            prepend-icon="mdi-view-list"
            class="px-5"
          >
            {{ t('authorPage.listView') }}
          </v-btn>

          <v-btn
            value="timeline"
            prepend-icon="mdi-timeline-outline"
            class="px-5"
          >
            {{ t('authorPage.timelineView') }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <template v-if="viewMode === 'list'">
        <EntityBooksTable
          :books="allBooks"
          :group-series="seriesOnly"
          :loading="isLoadingBooks"
          :empty-message="t('authorPage.noBooksForAuthor')"
        />

        <div
          v-if="hasMoreBooks"
          class="d-flex mt-6 justify-center"
        >
          <v-btn
            variant="outlined"
            rounded="pill"
            :loading="isLoadingMore"
            :disabled="isLoadingMore"
            @click="loadMoreBooks"
          >
            {{ t('common.loadMore') }}
          </v-btn>
        </div>
      </template>

      <AuthorTimeline
        v-else
        :books="allBooks"
        :loading="isLoadingBooks"
        :has-more="hasMoreBooks"
        :empty-message="t('authorPage.noBooksForAuthor')"
        :load-more="loadMoreBooks"
      />
    </div>

    <!-- Recommendations -->
    <ClientOnly>
      <RecommendationSections
        :sections="personalizedAuthorRecs"
        class="mt-16"
      />

      <RecommendationSections
        :sections="authorRecommendations"
        class="mt-16"
      />
    </ClientOnly>
  </v-container>
</template>
