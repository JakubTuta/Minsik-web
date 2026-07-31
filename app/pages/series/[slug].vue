<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { RecommendationSection } from '~/types/recommendations'

const route = useRoute()
const seriesStore = useSeriesStore()
const authorsStore = useAuthorsStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const recommendationsStore = useRecommendationsStore()
const { t } = useI18n()
// A series resolves to a different per-language record with its own book list,
// so the page's data follows the interface language.
const { language } = useUserLanguage()

const slug = route.params.slug as string

const { data: series, error: seriesError } = await useCachedAsyncData(
  `series-${slug}`,
  () => seriesStore.fetchSeries(slug),
  { watch: [language] },
)

// Books list is secondary to page identity — don't block navigation
const { data: books } = useCachedAsyncData(
  `series-books-${slug}`,
  () => seriesStore.fetchSeriesBooks(slug),
  { lazy: true, watch: [language], default: () => [] },
)

// Block on author for SSR/SEO — slug comes from series so no books dependency
const { data: primaryAuthor } = await useCachedAsyncData(
  `series-author-${slug}`,
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
)

// Handle 404
if (seriesError.value || !series.value) {
  throw createError({
    statusCode: 404,
    message: t('seriesPage.notFound'),
    fatal: true,
  })
}

// SEO — series slugs are shared across languages (unlike books, whose slug is
// per-edition), so the canonical just follows the current UI locale's URL;
// hreflang alternates come from useLocaleHead() in app.vue.
const config = useRuntimeConfig()
const localePath = useLocalePath()
const canonicalUrl = `${config.public.siteUrl}${route.path}`

useSeo({
  title: series.value.name,
  description: series.value.description || t('seriesPage.seoDescriptionFallback', { name: series.value.name, count: series.value.total_books }),
  image: books.value?.[0]?.primary_cover_url || undefined,
  type: 'website',
  url: canonicalUrl,
  author: series.value.author?.name,
})

useSeriesStructuredData({
  name: series.value.name,
  description: series.value.description || undefined,
  url: canonicalUrl,
})

useBreadcrumbStructuredData([
  { name: t('nav.home'), url: `${config.public.siteUrl}${localePath('index')}` },
  ...(series.value.author
    ? [{ name: series.value.author.name, url: `${config.public.siteUrl}${localePath({ name: 'authors-slug', params: { slug: series.value.author.slug } })}` }]
    : []),
  { name: series.value.name },
])

const isAdmin = computed(() => authStore.user?.role === 'admin')
const editError = ref('')
const deleteError = ref('')
const removeAuthorError = ref('')
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

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

async function handleRemoveSeriesAuthors(authorIds: number[]) {
  removeAuthorError.value = ''
  const results = await Promise.all(
    authorIds.map(id => adminStore.removeSeriesAuthor(series.value!.series_id, id)),
  )
  const failed = results.find(r => !r.success)
  if (failed) {
    removeAuthorError.value = (failed as any).error || t('seriesPage.removeFailed')

    return
  }
  await seriesStore.fetchSeries(slug, true)
}

async function handleSeriesDelete() {
  deleteError.value = ''
  const result = await adminStore.deleteSeries(series.value!.series_id)
  if (result.success) {
    deleteDialogOpen.value = false
    await navigateTo(localePath('index'))
  }
  else {
    deleteError.value = (result as any).error || t('admin.deleteFailed')
  }
}

async function handleSeriesEditSave(editedData: Record<string, any>) {
  editError.value = ''
  const result = await adminStore.updateSeries(series.value!.series_id, seriesEditOriginalData.value, editedData)
  if (result.success) {
    editDialogOpen.value = false
    const newSlug = editedData.slug && editedData.slug !== slug
      ? editedData.slug
      : slug
    await seriesStore.fetchSeries(newSlug, true)
    if (newSlug !== slug) {
      await navigateTo(localePath({ name: 'series-slug', params: { slug: newSlug } }))
    }
  }
  else {
    editError.value = (result as any).error || t('admin.updateFailed')
  }
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
          v-model:edit-dialog-open="editDialogOpen"
          v-model:delete-dialog-open="deleteDialogOpen"
          :series="series"
          :books="books || []"
          :primary-author="primaryAuthor"
          :is-admin="isAdmin"
          :edit-fields="seriesEditFields"
          :edit-original-data="seriesEditOriginalData"
          :edit-loading="adminStore.isUpdateLoading"
          :edit-error="editError || removeAuthorError"
          :delete-loading="adminStore.isDeleteLoading"
          :delete-error="deleteError"
          @edit-save="handleSeriesEditSave"
          @delete-confirm="handleSeriesDelete"
          @remove-series-authors="handleRemoveSeriesAuthors"
        />
      </v-col>
    </v-row>

    <!-- Description Section -->
    <v-row class="mt-6">
      <v-col cols="12">
        <LongDescriptionCard :description="series.description" />
      </v-col>
    </v-row>

    <!-- Evolution Graph -->
    <v-row
      v-if="(books?.length ?? 0) >= 2"
      class="mt-6"
    >
      <v-col cols="12">
        <LazySeriesEvolutionCard
          hydrate-on-visible
          :books="books!"
        />
      </v-col>
    </v-row>

    <!-- Books List -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <h2 class="text-h5 font-weight-bold mb-4">
              {{ t('seriesPage.booksInSeries') }}
            </h2>

            <BooksList
              :books="books || []"
              :loading="seriesStore.isLoadingBooks"
              :empty-message="t('seriesPage.noBooksInSeries')"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Series Recommendations -->
    <ClientOnly>
      <div
        v-if="seriesRecommendations.length > 0"
        class="mt-8"
      >
        <template
          v-for="category in seriesRecommendations"
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
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="seriesStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>
