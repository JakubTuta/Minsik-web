<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()

// Computed for type filter that calls setType
const selectedType = computed({
  get: () => searchStore.type,
  set: (value) => {
    searchStore.setType(value)
  },
})

// Initialize from URL query params
onMounted(() => {
  const query = route.query.q as string
  const type = route.query.type as string

  if (query) {
    searchStore.query = query
  }

  if (type && ['all', 'books', 'authors', 'series'].includes(type)) {
    searchStore.type = type as any
  }

  if (query) {
    searchStore.search()
  }
})

// Watch for type changes and update URL
watch(() => searchStore.type, (newType) => {
  if (!newType || !router || !import.meta.client)
    return

  router.replace({
    query: {
      ...route.query,
      type: newType,
    },
  })
})

// Watch for query changes and update URL
watch(() => searchStore.query, (newQuery) => {
  if (!router || !import.meta.client)
    return

  if (!newQuery) {
    // Clear URL when query is empty
    router.replace({
      query: {},
    })
  }
  else {
    router.replace({
      query: {
        ...route.query,
        q: newQuery,
      },
    })
  }
})

// Infinite scroll
useInfiniteScroll(
  () => searchStore.loadMore(),
  {
    threshold: 400,
    enabled: computed(() => searchStore.hasMore && !searchStore.isLoading),
  },
)

// SEO
useSeo({
  title: searchStore.query
    ? `Search: ${searchStore.query}`
    : 'Search',
  description: 'Search for books, authors, and series on Minsik.',
})

// Transform search result to card-compatible format
function transformToBook(result: any) {
  return {
    id: result.id.toString(),
    slug: result.slug,
    title: result.title,
    cover_url: result.cover_url,
    authors: result.authors.map((name: string, index: number) => ({
      name,
      slug: result.author_slugs[index] || '',
    })),
    view_count: result.view_count,
    rating: 0,
    rating_count: 0,
    genres: [],
    formats: [],
  }
}

function transformToAuthor(result: any) {
  return {
    id: result.id.toString(),
    slug: result.slug,
    name: result.title,
    photo_url: result.cover_url,
    view_count: result.view_count,
    book_count: 0,
  }
}

function transformToSeries(result: any) {
  return {
    id: result.id.toString(),
    slug: result.slug,
    name: result.title,
    view_count: result.view_count,
    book_count: 0,
  }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <SearchBar
          v-model="searchStore.query"
          variant="full"
          autofocus
          class="mb-4"
        />

        <SearchFilters
          v-model="selectedType"
          class="mb-6"
        />

        <div
          v-if="searchStore.query && searchStore.hasData"
          class="text-subtitle-2 text-secondary mb-4"
        >
          {{ searchStore.total }} {{ searchStore.total === 1
            ? 'result'
            : 'results' }}
        </div>
      </v-col>
    </v-row>

    <!-- Results Grid -->
    <v-row v-if="searchStore.hasData">
      <v-col
        v-for="result in searchStore.results"
        :key="`${result.type}-${result.id}`"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <BookCard
          v-if="result.type === 'book'"
          :book="transformToBook(result)"
        />

        <AuthorCard
          v-else-if="result.type === 'author'"
          :author="transformToAuthor(result)"
        />

        <SeriesCard
          v-else-if="result.type === 'series'"
          :series="transformToSeries(result)"
        />
      </v-col>
    </v-row>

    <!-- Loading State -->
    <LoadingState
      v-if="searchStore.isLoading && !searchStore.hasData"
      type="grid"
      :count="8"
    />

    <!-- Loading More Indicator (only show when scrolling for more) -->
    <v-row v-if="searchStore.isLoading && searchStore.hasData && searchStore.offset > 0">
      <v-col
        cols="12"
        class="py-8 text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-if="searchStore.isEmpty">
      <v-col
        cols="12"
        class="py-12 text-center"
      >
        <v-icon
          icon="mdi-magnify"
          size="64"
          color="secondary"
          class="mb-4"
        />

        <div class="text-h6 text-secondary">
          No results found for "{{ searchStore.query }}"
        </div>

        <div class="text-caption text-secondary mt-2">
          Try different keywords or filters
        </div>
      </v-col>
    </v-row>

    <!-- No Query State -->
    <v-row v-if="!searchStore.query && !searchStore.isLoading">
      <v-col
        cols="12"
        class="py-12 text-center"
      >
        <v-icon
          icon="mdi-snowflake-variant"
          size="64"
          color="secondary"
          class="mb-4"
        />

        <div class="text-h6 text-secondary">
          Start typing to search
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
