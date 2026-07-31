<script setup lang="ts">
import type { SearchResult } from '~/types/api'
import { totalRatingCount, weightedRating } from '~/utils/format'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
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
    // Immediate: this is a deep link with the query already known, not a
    // user typing — the 300ms debounce exists for the latter and only
    // delays the first paint of results here.
    searchStore.search(false, true)
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

const { sentinel } = useInfiniteScroll(
  () => searchStore.loadMore(),
  {
    enabled: computed(() => searchStore.hasMore && !searchStore.isLoading),
  },
)

useSeo({
  title: computed(() => {
    const q = (route.query.q as string) || searchStore.query

    return q
      ? t('searchPage.titleWithQuery', { query: q })
      : t('nav.search')
  }),
  description: t('searchPage.pageDescription'),
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
    return t('searchPage.badgeBook')
  if (type === 'author')
    return t('searchPage.badgeAuthor')

  return t('searchPage.badgeSeries')
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
          {{ t('searchPage.resultCount', {"count": searchStore.total}, searchStore.total) }}
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
        <!-- Author card -->
        <AuthorPreviewCard
          v-if="result.type === 'author'"
          :name="result.title"
          :slug="result.slug"
          :photo-url="result.cover_url"
          :book-count="result.book_count"
          :rating="resultRating(result)"
          :rating-count="resultRatingCount(result)"
          :readers="result.readers"
          :badge="resultBadgeLabel(result.type)"
          :badge-color="resultBadgeColor(result.type)"
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
          :readers="result.readers"
          :badge="resultBadgeLabel(result.type)"
          :badge-color="resultBadgeColor(result.type)"
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
          {{ t('searchPage.noResults', {"query": searchStore.query}) }}
        </div>

        <div class="text-secondary mt-2">
          {{ t('searchPage.noResultsHint') }}
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
          {{ t('searchPage.startTyping') }}
        </div>
      </v-col>
    </v-row>

    <div ref="sentinel" />
  </v-container>
</template>
