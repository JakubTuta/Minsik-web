<script setup lang="ts">
import type { BookSummary } from '~/types/api'

const route = useRoute()
const categoriesStore = useCategoriesStore()

const selectedSlug = computed(() => route.query.category as string | null ?? null)
const selectedSubGenre = computed(() => route.query.sub_genre as string | null ?? null)

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

async function loadBooks(slug: string, subGenre: string | null, sort: 'popularity' | 'rating', offset: number) {
  return categoriesStore.fetchCategoryBooksPage(slug, subGenre, sort, 'desc', offset, 20)
}

async function resetAndFetch() {
  if (!selectedSlug.value)
    return

  allBooks.value = []
  booksTotalCount.value = 0
  booksOffset.value = 0

  const result = await loadBooks(selectedSlug.value, selectedSubGenre.value, sortBy.value, 0)
  allBooks.value = result.books
  booksTotalCount.value = result.total_count
  booksOffset.value = result.books.length
}

// Initial fetch when a category is selected
if (selectedSlug.value) {
  const { data: initialBooksData } = await useAsyncData(
    `category-books-${selectedSlug.value}-${selectedSubGenre.value ?? 'all'}-${sortBy.value}`,
    () => loadBooks(selectedSlug.value!, selectedSubGenre.value, sortBy.value, 0),
  )

  if (initialBooksData.value) {
    allBooks.value = initialBooksData.value.books
    booksTotalCount.value = initialBooksData.value.total_count
    booksOffset.value = initialBooksData.value.books.length
  }
}

watch(selectedSlug, resetAndFetch)
watch(selectedSubGenre, resetAndFetch)
watch(sortBy, resetAndFetch)

async function loadMoreBooks() {
  if (!hasMoreBooks.value || !selectedSlug.value)
    return

  const result = await loadBooks(selectedSlug.value, selectedSubGenre.value, sortBy.value, booksOffset.value)
  allBooks.value.push(...result.books)
  booksTotalCount.value = result.total_count
  booksOffset.value += result.books.length
}

const currentCategory = computed(() => selectedSlug.value ? categoriesStore.getCategoryBySlug(selectedSlug.value) : null)

const pageTitle = computed(() => {
  if (selectedSubGenre.value && currentCategory.value) {
    const sub = currentCategory.value.sub_genres.find(s => s.slug === selectedSubGenre.value)
    return sub ? `${sub.name} — ${currentCategory.value.name}` : currentCategory.value.name
  }
  return currentCategory.value?.name ?? 'Browse Categories'
})

useSeo({
  title: pageTitle.value,
  description: `Browse ${pageTitle.value} — discover your next read by genre`,
})
</script>

<template>
  <v-container>
    <!-- No category selected: show grid overview -->
    <template v-if="!selectedSlug">
      <h1 class="text-h4 font-weight-bold mb-2">
        Browse Categories
      </h1>

      <p class="text-body-1 text-medium-emphasis mb-6">
        Explore books by genre and discover your next read
      </p>

      <div
        v-if="categoriesStore.isLoading"
        class="text-center py-12"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>

      <v-row v-else>
        <v-col
          v-for="category in categoriesData"
          :key="category.slug"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <NuxtLink
            :to="`/categories?category=${category.slug}`"
            class="text-decoration-none"
          >
            <v-card
              hover
              height="120"
              class="d-flex flex-column justify-center"
            >
              <v-card-text>
                <h2 class="text-h6 font-weight-bold mb-1">
                  {{ category.name }}
                </h2>

                <span class="text-body-2 text-medium-emphasis">
                  {{ category.sub_genres.length > 0
                    ? `${category.sub_genres.length} sub-genres`
                    : 'Browse books' }}
                </span>
              </v-card-text>
            </v-card>
          </NuxtLink>
        </v-col>
      </v-row>
    </template>

    <!-- Category selected: 2-column layout -->
    <v-row v-else>
      <v-col
        cols="12"
        md="3"
      >
        <CategorySidebar
          :categories="categoriesData ?? []"
          :selected-slug="selectedSlug"
          :selected-sub-genre="selectedSubGenre"
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
