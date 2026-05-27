<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { RecommendationSection } from '~/types/recommendations'

const route = useRoute()
const seriesStore = useSeriesStore()
const authorsStore = useAuthorsStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const recommendationsStore = useRecommendationsStore()

const slug = route.params.slug as string

const booksStore = useBooksStore()

const [{ data: series, error: seriesError }, { data: books }] = await Promise.all([
  useAsyncData(
    `series-${slug}`,
    () => seriesStore.fetchSeries(slug),
  ),
  useAsyncData(
    `series-books-${slug}`,
    () => seriesStore.fetchSeriesBooks(slug),
  ),
])

const { data: firstBookDetails } = useLazyAsyncData(
  `series-first-book-${slug}`,
  async () => {
    if (!books.value || books.value.length === 0)
      return null

    try {
      const firstBook = books.value[0]
      if (!firstBook?.slug)
        return null

      return await booksStore.fetchBook(firstBook.slug)
    }
    catch {
      return null
    }
  },
  { watch: [books], default: () => null },
)

const { data: primaryAuthor } = useLazyAsyncData(
  `series-author-${slug}`,
  async () => {
    if (!firstBookDetails.value?.authors?.[0]?.slug)
      return null

    try {
      return await authorsStore.fetchAuthor(firstBookDetails.value.authors[0].slug)
    }
    catch {
      return null
    }
  },
  { watch: [firstBookDetails], default: () => null },
)

// Handle 404
if (seriesError.value || !series.value) {
  throw createError({
    statusCode: 404,
    message: 'Series not found',
  })
}

// SEO
const config = useRuntimeConfig()
const canonicalUrl = `${config.public.siteUrl}/series/${slug}`

useSeo({
  title: series.value.name,
  description: series.value.description || `${series.value.name} - A series of ${series.value.total_books} books`,
  type: 'website',
  url: canonicalUrl,
  author: series.value.author?.name,
})

useSeriesStructuredData({
  name: series.value.name,
  description: series.value.description || undefined,
  url: canonicalUrl,
})

const isAdmin = computed(() => authStore.user?.role === 'admin')
const editError = ref('')
const deleteError = ref('')
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

const seriesEditFields: EditFieldConfig[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'total_books', label: 'Total Books', type: 'number' },
]

const seriesEditOriginalData = computed(() => ({
  name: series.value?.name ?? null,
  slug: series.value?.slug ?? null,
  description: series.value?.description ?? null,
  total_books: series.value?.total_books ?? null,
}))

async function handleSeriesDelete() {
  deleteError.value = ''
  const result = await adminStore.deleteSeries(series.value!.series_id)
  if (result.success) {
    deleteDialogOpen.value = false
    await navigateTo('/')
  }
  else {
    deleteError.value = (result as any).error || 'Delete failed'
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
      await navigateTo(`/series/${newSlug}`)
    }
  }
  else {
    editError.value = (result as any).error || 'Update failed'
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
          :edit-error="editError"
          :delete-loading="adminStore.isDeleteLoading"
          :delete-error="deleteError"
          @edit-save="handleSeriesEditSave"
          @delete-confirm="handleSeriesDelete"
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
        <SeriesEvolutionCard :books="books!" />
      </v-col>
    </v-row>

    <!-- Books List -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <h2 class="text-h5 font-weight-bold mb-4">
              Books in this Series
            </h2>

            <BooksList
              :books="books || []"
              :loading="seriesStore.isLoadingBooks"
              empty-message="No books found in this series."
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Series Recommendations -->
    <ClientOnly>
      <div
        v-if="seriesRecommendations.length > 0 || recommendationsStore.isLoadingSeriesRecs"
        class="mt-8"
      >
        <RecommendationRowSkeleton v-if="recommendationsStore.isLoadingSeriesRecs" />

        <template v-else>
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
        </template>
      </div>
    </ClientOnly>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="seriesStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>
