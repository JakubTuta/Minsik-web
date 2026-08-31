<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'

const route = useRoute()
const seriesStore = useSeriesStore()
const authorsStore = useAuthorsStore()
const recommendationsStore = useRecommendationsStore()
const { t } = useI18n()
// Language is in every key, not a `watch`: a locale switch changes the path,
// which remounts the page, and a fresh mount never fires a watcher.
const { language } = useUserLanguage()

const slug = route.params.slug as string

const { data: series, error: seriesError, refresh: refreshSeriesData } = await useCachedAsyncData(
  computed(() => `series-${slug}-${language.value}`),
  () => seriesStore.fetchSeries(slug),
)

if (seriesError.value || !series.value) {
  throw createError({
    statusCode: 404,
    message: t('seriesPage.notFound'),
    fatal: true,
  })
}

// `lazy` unblocks navigation but still renders on the server, which the volumes,
// the charts and the social image all need.
const { data: books, status: booksStatus } = useCachedAsyncData(
  computed(() => `series-books-${slug}-${language.value}`),
  () => seriesStore.fetchSeriesBooks(slug),
  { lazy: true, default: () => [] },
)

// Client-only: nothing in the head needs it, both read the author off `series`.
const { data: primaryAuthor } = useLazyAsyncData<Author | null>(
  computed(() => `series-author-${slug}-${language.value}`),
  async () => {
    const authorSlug = series.value?.author?.slug
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

// Series slugs are shared across languages, so the canonical follows the
// current locale's URL; alternates come from useLocaleHead() in app.vue.
const config = useRuntimeConfig()
const localePath = useLocalePath()
const canonicalUrl = computed(() => `${config.public.siteUrl}${route.path}`)

// Derived: the volumes are still empty when this composable runs.
const socialImage = computed(() => books.value?.find(book => book.primary_cover_url)?.primary_cover_url || undefined)

useSeo({
  title: computed(() => series.value?.name ?? ''),
  description: computed(() => series.value?.description
    || t('seriesPage.seoDescriptionFallback', { name: series.value?.name ?? '', count: series.value?.total_books ?? 0 })),
  image: socialImage,
  type: 'website',
  url: canonicalUrl,
  author: computed(() => series.value?.author?.name),
})

useSeriesStructuredData(() => ({
  name: series.value?.name ?? '',
  description: series.value?.description,
  url: canonicalUrl.value,
  author: series.value?.author?.name,
  numberOfItems: series.value?.total_books,
}))

useBreadcrumbStructuredData(() => [
  { name: t('nav.home'), url: `${config.public.siteUrl}${localePath('index')}` },
  ...(series.value?.author
    ? [{ name: series.value.author.name, url: `${config.public.siteUrl}${localePath({ name: 'authors-slug', params: { slug: series.value.author.slug } })}` }]
    : []),
  { name: series.value?.name ?? '' },
])

const seriesEditFields = computed<EditFieldConfig[]>(() => [
  { key: 'name', label: t('author.fieldName'), type: 'text' },
  { key: 'slug', label: t('common.fieldSlug'), type: 'text' },
  { key: 'description', label: t('common.description'), type: 'textarea' },
  { key: 'total_books', label: t('seriesPage.totalBooks'), type: 'number' },
])

const seriesEditOriginalData = computed(() => ({
  name: series.value?.name ?? null,
  slug: series.value?.slug ?? null,
  description: series.value?.description ?? null,
  total_books: series.value?.total_books ?? null,
}))

// The volumes' authors, not the series' nominal one — an anthology has none.
const volumeAuthors = computed(() => {
  const seen = new Set<number>()

  return (books.value ?? []).flatMap(book => book.authors.filter((author) => {
    if (seen.has(author.author_id))
      return false
    seen.add(author.author_id)

    return true
  }))
})

// The page renders the `useAsyncData` copy, not the store, so both need it.
async function refreshSeries(nextSlug: string) {
  await seriesStore.fetchSeries(nextSlug, true)
  if (nextSlug === slug)
    await refreshSeriesData()
}

const seriesRecommendations = ref<RecommendationSection[]>([])

onMounted(async () => {
  if (series.value?.series_id) {
    try {
      seriesRecommendations.value = await recommendationsStore.fetchSeriesRecommendations(series.value.series_id) ?? []
    }
    catch { /* Silently fail */ }
  }
})
</script>

<template>
  <v-container v-if="series">
    <v-row>
      <v-col cols="12">
        <SeriesHeader
          :series="series"
          :books="books ?? []"
          :authors="volumeAuthors"
          :primary-author="primaryAuthor"
        />

        <AdminEntityActions
          :id="series.series_id"
          entity="series"
          :name="series.name"
          :slug="series.slug"
          :fields="seriesEditFields"
          :original-data="seriesEditOriginalData"
          :authors="volumeAuthors"
          :refresh="refreshSeries"
          container-class="mt-2 justify-end"
        />
      </v-col>
    </v-row>

    <!-- Description -->
    <div class="mt-10">
      <SectionHeading
        :eyebrow="t('seriesPage.aboutEyebrow')"
        :title="t('seriesPage.aboutTitle')"
      />

      <DescriptionCard
        :description="series.description"
        hide-heading
      />
    </div>

    <!-- Evolution Graph -->
    <div
      v-if="(books?.length ?? 0) >= 2"
      class="mt-12"
    >
      <LazySeriesEvolutionCard
        hydrate-on-visible
        :books="books ?? []"
      />
    </div>

    <!-- Publication rhythm -->
    <div class="mt-12">
      <LazySeriesPublicationRhythm
        hydrate-on-visible
        :books="books ?? []"
      />
    </div>

    <!-- Readers per volume -->
    <div class="mt-12">
      <LazySeriesReadersPerVolume
        hydrate-on-visible
        :books="books ?? []"
      />
    </div>

    <!-- All volumes -->
    <div class="mt-12">
      <SectionHeading
        :eyebrow="t('seriesPage.allVolumesEyebrow')"
        :title="t('seriesPage.booksInSeries')"
        :subtitle="t('seriesPage.allVolumesSubtitle')"
      />

      <EntityBooksTable
        :books="books ?? []"
        show-position
        :loading="booksStatus === 'pending'"
        :empty-message="t('seriesPage.noBooksInSeries')"
      />
    </div>

    <!-- Series Recommendations -->
    <ClientOnly>
      <RecommendationSections
        :sections="seriesRecommendations"
        class="mt-12"
      />
    </ClientOnly>
  </v-container>
</template>
