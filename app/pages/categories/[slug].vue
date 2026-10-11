<script setup lang="ts">
import type { BookSummary } from '~/types/api'

type CategorySort = 'popularity' | 'rating'

const PAGE_SIZE = 20

const route = useRoute()
const { t, n } = useI18n()
// Which edition of each book is listed depends on the reader's language.
const { language } = useUserLanguage()
const categoriesStore = useCategoriesStore()
const { categories, getCategoryBySlug } = useCategories()

const slug = computed(() => route.params.slug as string)

// eslint-disable-next-line vue/no-ref-object-reactivity-loss -- a one-off guard for the category this request names
if (!getCategoryBySlug(slug.value)) {
  throw createError({ statusCode: 404, message: t('categories.notFound'), fatal: true })
}

const sortBy = ref<CategorySort>('popularity')
const sortOptions = computed(() => [
  { value: 'popularity', title: t('categories.mostPopular') },
  { value: 'rating', title: t('categories.highestRated') },
])

const allBooks = ref<BookSummary[]>([])
const booksTotalCount = ref(0)
const hasMoreBooks = computed(() => allBooks.value.length < booksTotalCount.value)

// The first page is part of the data key, so changing the sort or the language fetches again
// and a stale answer to an earlier key can never replace the current one.
const { data: firstPage } = await useAsyncData(
  computed(() => `category-books-${slug.value}-${sortBy.value}-${language.value}`),
  () => categoriesStore.fetchCategoryBooksPage(slug.value, sortBy.value, 'desc', 0, PAGE_SIZE),
)

watch(firstPage, (data) => {
  allBooks.value = data?.books ?? []
  booksTotalCount.value = data?.total_count ?? 0
}, { immediate: true })

let loadingMore = false

async function loadMoreBooks() {
  if (loadingMore || !hasMoreBooks.value)
    return

  loadingMore = true
  const requestedKey = `${slug.value}-${sortBy.value}-${language.value}`
  try {
    const result = await categoriesStore.fetchCategoryBooksPage(slug.value, sortBy.value, 'desc', allBooks.value.length, PAGE_SIZE)
    // The reader changed sort or language while this page was loading: it belongs to another list.
    if (requestedKey !== `${slug.value}-${sortBy.value}-${language.value}`)
      return

    allBooks.value.push(...result.books)
    booksTotalCount.value = result.total_count
  }
  finally {
    loadingMore = false
  }
}

const pageTitle = computed(() => getCategoryBySlug(slug.value)?.name ?? t('categories.browse'))

useSeo({
  title: pageTitle,
  description: computed(() => t('categories.seoDescription', { category: pageTitle.value })),
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
          :categories="categories"
          :selected-slug="slug"
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
                  {{ t('common.bookCount', {"count": n(booksTotalCount)}, booksTotalCount) }}
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
              :empty-message="t('categories.noBooksInCategory')"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
