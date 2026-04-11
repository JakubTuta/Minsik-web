<script setup lang="ts">
import type { BookSummary } from '~/types/api'

const route = useRoute()
const categoriesStore = useCategoriesStore()

const selectedSlug = computed(() => route.query.category as string | null ?? null)

const sortBy = ref<'popularity' | 'rating'>('popularity')
const sortOptions = [
  { value: 'popularity', title: 'Most Popular' },
  { value: 'rating', title: 'Highest Rated' },
]

const { data: categoriesData } = await useAsyncData(
  'categories-list',
  () => categoriesStore.fetchCategories(),
)

// Pagination state
const allBooks = ref<BookSummary[]>([])
const booksOffset = ref(0)
const booksTotalCount = ref(0)
const hasMoreBooks = computed(() => allBooks.value.length < booksTotalCount.value)

async function loadBooks(slug: string, sort: 'popularity' | 'rating', offset: number) {
  return categoriesStore.fetchCategoryBooksPage(slug, sort, 'desc', offset, 20)
}

async function resetAndFetch() {
  if (!selectedSlug.value)
    return

  allBooks.value = []
  booksTotalCount.value = 0
  booksOffset.value = 0

  const result = await loadBooks(selectedSlug.value, sortBy.value, 0)
  allBooks.value = result.books
  booksTotalCount.value = result.total_count
  booksOffset.value = result.books.length
}

// Redirect to home when no category is selected
if (!selectedSlug.value) {
  await navigateTo('/')
}

// Initial fetch when a category is selected
if (selectedSlug.value) {
  const { data: initialBooksData } = await useAsyncData(
    `category-books-${selectedSlug.value}-${sortBy.value}`,
    () => loadBooks(selectedSlug.value!, sortBy.value, 0),
  )

  if (initialBooksData.value) {
    allBooks.value = initialBooksData.value.books
    booksTotalCount.value = initialBooksData.value.total_count
    booksOffset.value = initialBooksData.value.books.length
  }
}

watch(selectedSlug, resetAndFetch)
watch(sortBy, resetAndFetch)

async function loadMoreBooks() {
  if (!hasMoreBooks.value || !selectedSlug.value)
    return

  const result = await loadBooks(selectedSlug.value, sortBy.value, booksOffset.value)
  allBooks.value.push(...result.books)
  booksTotalCount.value = result.total_count
  booksOffset.value += result.books.length
}

const currentCategory = computed(() => (selectedSlug.value
  ? categoriesStore.getCategoryBySlug(selectedSlug.value)
  : null))

const pageTitle = computed(() => currentCategory.value?.name ?? 'Browse Categories')

useSeo({
  title: pageTitle.value,
  description: `Browse ${pageTitle.value} — discover your next read by genre`,
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <CategorySidebar
          :categories="categoriesData ?? []"
          :selected-slug="selectedSlug"
          :loading="categoriesStore.isLoading"
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
              <div>
                <h1 class="text-h5 font-weight-bold">
                  {{ pageTitle }}
                </h1>

                <span
                  v-if="booksTotalCount > 0"
                  class="text-body-2 text-medium-emphasis"
                >
                  {{ booksTotalCount.toLocaleString() }} books
                </span>
              </div>

              <v-select
                v-model="sortBy"
                :items="sortOptions"
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 200px;"
              />
            </div>

            <BooksList
              :books="allBooks"
              :loading="categoriesStore.isLoadingBooks"
              :load-more="loadMoreBooks"
              :has-more="hasMoreBooks"
              empty-message="No books found for this category."
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
