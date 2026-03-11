<script setup lang="ts">
import type { SearchResult } from '~/types/api'
import { totalRatingCount, weightedRating } from '~/utils/format'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()

const selectedType = computed({
  get: () => searchStore.type,
  set: (value) => {
    searchStore.setType(value)
  },
})

onMounted(() => {
  const query = route.query.q as string
  const type = route.query.type as string

  if (query) {
    searchStore.query = query
  }

  if (type && ['all', 'books', 'authors', 'series', 'categories'].includes(type)) {
    searchStore.type = type as any
  }

  if (query) {
    searchStore.search()
  }
})

watch(() => searchStore.type, (newType) => {
  if (!newType || !router || !import.meta.client)
    return

  router.replace({ query: { ...route.query, type: newType } })
})

watch(() => searchStore.query, (newQuery) => {
  if (!router || !import.meta.client)
    return

  router.replace({
    query: newQuery
      ? { ...route.query, q: newQuery }
      : {},
  })
})

useInfiniteScroll(
  () => searchStore.loadMore(),
  {
    threshold: 400,
    enabled: computed(() => searchStore.hasMore && !searchStore.isLoading),
  },
)

useSeo({
  title: computed(() => {
    const q = (route.query.q as string) || searchStore.query

    return q
      ? `Search: ${q}`
      : 'Search'
  }),
  description: 'Search for books, authors, and series on Minsik.',
})

function resultBadgeColor(type: SearchResult['type']) {
  if (type === 'book')
    return 'primary'
  if (type === 'author')
    return 'success'

  return 'info'
}

function resultBadgeLabel(type: SearchResult['type']) {
  if (type === 'book')
    return 'Book'
  if (type === 'author')
    return 'Author'

  return 'Series'
}

function resultRating(result: SearchResult) {
  return weightedRating(result.app_avg_rating, result.app_rating_count, result.ol_avg_rating, result.ol_rating_count)
}

function resultRatingCount(result: SearchResult) {
  return totalRatingCount(result.app_rating_count, result.ol_rating_count)
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
          class="text-h6 text-secondary mb-2"
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
        v-for="(result, index) in searchStore.results"
        :key="`${result.type}-${result.id}`"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <!-- Author card -->
        <AuthorPreviewCard
          v-if="result.type === 'author'"
          :name="result.title"
          :slug="result.slug"
          :photo-url="result.cover_url"
          :book-count="result.book_count"
          :rating="resultRating(result)"
          :rating-count="resultRatingCount(result)"
          :badge="resultBadgeLabel(result.type)"
          :badge-color="resultBadgeColor(result.type)"
          :eager="index < 4"
        />

        <!-- Book / Series card -->
        <BookPreviewCard
          v-else
          :title="result.title"
          :slug="result.slug"
          :link-to="result.type === 'series'
            ? `/series/${result.slug}`
            : undefined"
          :cover-url="result.cover_url"
          :author-names="result.authors"
          :author-slugs="result.author_slugs"
          :rating="resultRating(result)"
          :rating-count="resultRatingCount(result)"
          :badge="resultBadgeLabel(result.type)"
          :badge-color="resultBadgeColor(result.type)"
          :eager="index < 4"
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

        <div class="text-secondary mt-2">
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
