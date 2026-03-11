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

// Fetch series data and books
const { data: series, error: seriesError } = await useAsyncData(
  `series-${slug}`,
  () => seriesStore.fetchSeries(slug),
)

const { data: books } = await useAsyncData(
  `series-books-${slug}`,
  () => seriesStore.fetchSeriesBooks(slug),
)

// Fetch first book's full details to get author
const booksStore = useBooksStore()
const { data: firstBookDetails } = await useAsyncData(
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
)

// Fetch author data from first book
const { data: primaryAuthor } = await useAsyncData(
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

// Structured data
useSeriesStructuredData({
  name: series.value.name,
  description: series.value.description || undefined,
  url: canonicalUrl,
})

// Series rating from API
const seriesAvgRating = computed(() => series.value?.avg_rating ?? 0)
const seriesTotalRatings = computed(() => series.value?.rating_count ?? 0)

const statisticsExpanded = ref(false)

function toggleStatistics() {
  statisticsExpanded.value = !statisticsExpanded.value
}

const isAdmin = computed(() => authStore.user?.role === 'admin')
const editDialogOpen = ref(false)
const editError = ref('')
const deleteDialogOpen = ref(false)
const deleteError = ref('')

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

// Scroll reveal refs
const revealHeader = ref<HTMLElement | null>(null)
const revealDescription = ref<HTMLElement | null>(null)
const revealBooks = ref<HTMLElement | null>(null)

useScrollReveal(revealHeader)
useScrollReveal(revealDescription, { delay: 0.1 })
useScrollReveal(revealBooks, { delay: 0.15 })

onMounted(async () => {
  if (series.value?.series_id) {
    try {
      seriesRecommendations.value = await recommendationsStore.fetchSeriesRecommendations(series.value.series_id) ?? []
    }
    catch { /* Silently fail */ }
  }
})

// Get book covers for collage (max 4)
const collageCovers = computed(() => {
  if (!books.value || books.value.length === 0)
    return []

  return books.value.slice(0, 4).map(book => book.primary_cover_url || '/placeholder-book-lazy.jpg')
})
</script>

<template>
  <v-container v-if="series">
    <v-row>
      <v-col cols="12">
        <v-card ref="revealHeader">
          <v-row no-gutters>
            <!-- Book Covers Collage -->
            <v-col
              cols="12"
              md="3"
              class="pa-0"
            >
              <CoversCollage :covers="collageCovers" />
            </v-col>

            <!-- Series Info -->
            <v-col
              cols="12"
              md="6"
            >
              <v-card-text class="d-flex flex-column h-100">
                <div>
                  <div class="text-secondary text-h6 mb-1">
                    Book Series
                  </div>

                  <div class="d-flex align-center justify-space-between">
                    <h1 class="text-h4 font-weight-bold">
                      {{ series.name }}
                    </h1>

                    <ClientOnly>
                      <div class="d-flex">
                        <v-btn
                          v-if="isAdmin"
                          icon="mdi-pencil"
                          variant="text"
                          size="small"
                          color="secondary"
                          @click="editDialogOpen = true"
                        />

                        <v-btn
                          v-if="isAdmin"
                          icon="mdi-delete"
                          variant="text"
                          size="small"
                          color="error"
                          @click="deleteDialogOpen = true"
                        />
                      </div>
                    </ClientOnly>
                  </div>

                  <ClientOnly>
                    <AdminEditDialog
                      v-model="editDialogOpen"
                      title="Edit Series"
                      :fields="seriesEditFields"
                      :original-data="seriesEditOriginalData"
                      :loading="adminStore.isUpdateLoading"
                      :error="editError"
                      @save="handleSeriesEditSave"
                    />

                    <v-dialog
                      v-model="deleteDialogOpen"
                      max-width="400"
                    >
                      <v-card>
                        <v-card-title>Delete Series?</v-card-title>

                        <v-card-text>
                          This action cannot be undone. Are you sure you want to delete "{{ series?.name }}"?
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
                            @click="handleSeriesDelete"
                          >
                            Delete
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </ClientOnly>

                  <!-- Rating -->
                  <div class="text-secondary mb-1 mt-6">
                    Minsik users reviews
                  </div>

                  <RatingDisplay
                    :rating="seriesAvgRating"
                    :rating-count="seriesTotalRatings"
                  />

                  <!-- Other Platform Ratings -->
                  <div class="text-secondary mb-1 mt-4">
                    Other platforms reviews
                  </div>

                  <RatingDisplay
                    :rating="series.ol_avg_rating"
                    :rating-count="series.ol_rating_count"
                    size="small"
                  />

                  <!-- Metadata -->
                  <div class="mt-6">
                    <v-icon icon="mdi-book-multiple" />

                    {{ series.total_books }} {{ series.total_books === 1
                      ? 'book'
                      : 'books' }}
                  </div>
                </div>

                <!-- Statistics Toggle at bottom -->
                <div class="pt-4">
                  <v-btn
                    variant="text"
                    color="secondary"
                    size="small"
                    @click="toggleStatistics"
                  >
                    Statistics
                    <v-icon
                      :icon="statisticsExpanded
                        ? 'mdi-chevron-up'
                        : 'mdi-chevron-down'"
                    />
                  </v-btn>

                  <v-expand-transition>
                    <div v-show="statisticsExpanded">
                      <div class="text-body-2 mt-2">
                        <div>Minsik want to read: {{ (series.app_want_to_read_count ?? 0).toLocaleString() }}</div>

                        <div>Minsik reading: {{ (series.app_reading_count ?? 0).toLocaleString() }}</div>

                        <div>Minsik read: {{ (series.app_read_count ?? 0).toLocaleString() }}</div>

                        <div class="mt-3">
                          Open Library want to read: {{ (series.ol_want_to_read_count ?? 0).toLocaleString() }}
                        </div>

                        <div>Open Library reading: {{ (series.ol_currently_reading_count ?? 0).toLocaleString() }}</div>

                        <div>Open Library read: {{ (series.ol_already_read_count ?? 0).toLocaleString() }}</div>
                      </div>
                    </div>
                  </v-expand-transition>
                </div>
              </v-card-text>
            </v-col>

            <!-- Author Section -->
            <v-col
              v-if="primaryAuthor"
              cols="12"
              md="3"
            >
              <AuthorShortCard :author="primaryAuthor" />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Description Section -->
    <v-row class="mt-6">
      <v-col cols="12">
        <DescriptionCard
          ref="revealDescription"
          :description="series.description"
        />
      </v-col>
    </v-row>

    <!-- Books List -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card ref="revealBooks">
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
