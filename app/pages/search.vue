<script setup lang="ts">
import type { SearchResult } from '~/types/api'

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

// SEO — use route.query.q so the title is correct on SSR before onMounted runs
useSeo({
  title: computed(() => {
    const q = (route.query.q as string) || searchStore.query
    return q ? `Search: ${q}` : 'Search'
  }),
  description: 'Search for books, authors, and series on Minsik.',
})

// Get chip color for each type
function getTypeChipColor(type: SearchResult['type']) {
  switch (type) {
    case 'book':
      return 'primary'
    case 'author':
      return 'success'
    case 'series':
      return 'info'
    default:
      return 'secondary'
  }
}

// Get collage covers for series (max 4)
function getSeriesCollageCovers(result: SearchResult) {
  if (!result.book_covers || result.book_covers.length === 0) {
    return [result.cover_url || '/placeholder-book-lazy.jpg']
  }

  return result.book_covers.slice(0, 4)
}

// Format rating display
function formatRating(result: SearchResult) {
  const avg = Number(result.avg_rating) || 0
  const count = result.rating_count || 0

  return { avg: avg.toFixed(1), count }
}

function getTypeLabel(type: SearchResult['type']) {
  if (type === 'book')
    return 'Book'

  if (type === 'author')
    return 'Author'

  return 'Series'
}

function getResultPath(result: SearchResult) {
  if (result.type === 'book')
    return `/books/${result.slug}`

  if (result.type === 'author')
    return `/authors/${result.slug}`

  return `/series/${result.slug}`
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
        v-for="result in searchStore.results"
        :key="`${result.type}-${result.id}`"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="result-card">
          <!-- Type chip -->
          <v-chip
            :color="getTypeChipColor(result.type)"
            size="small"
            class="position-absolute right-0 top-0 ma-2"
            variant="elevated"
            style="z-index: 1"
          >
            {{ getTypeLabel(result.type) }}
          </v-chip>

          <!-- Image zone (top 50%) -->
          <div class="result-image-zone bg-surface-variant d-flex align-center justify-center">
            <!-- Book: cover -->
            <v-img
              v-if="result.type === 'book'"
              :src="result.cover_url || '/placeholder-book-lazy.jpg'"
              :alt="result.title"
              lazy-src="/placeholder-book-lazy.jpg"
              aspect-ratio="0.67"
              class="rounded"
              width="110"
              height="164"
            />

            <!-- Author: avatar -->
            <v-avatar
              v-else-if="result.type === 'author'"
              size="130"
            >
              <v-img
                :src="result.cover_url || '/placeholder-avatar-lazy.jpg'"
                :alt="result.title"
                lazy-src="/placeholder-avatar-lazy.jpg"
              />
            </v-avatar>

            <!-- Series: collage -->
            <CoversCollage
              v-else
              :covers="getSeriesCollageCovers(result)"
              width="110px"
              height="164px"
            />
          </div>

          <!-- Info zone (bottom 50%) -->
          <div class="result-info-zone d-flex flex-column pa-3">
            <!-- Title row -->
            <div class="result-row-title">
              <NuxtLink
                :to="getResultPath(result)"
                class="result-link"
              >
                <span class="text-subtitle-1 font-weight-bold line-clamp-2">
                  {{ result.title }}
                </span>
              </NuxtLink>
            </div>

            <!-- Author row: shown for book/series, empty for author -->
            <div class="result-row-secondary text-body-2 text-truncate">
              <template v-if="result.type !== 'author'">
                <template
                  v-for="(author, index) in result.authors"
                  :key="index"
                >
                  <NuxtLink
                    :to="`/authors/${result.author_slugs[index]}`"
                    class="result-link"
                  >
                    {{ author }}
                  </NuxtLink>

                  <span v-if="index < result.authors.length - 1">, </span>
                </template>
              </template>
            </div>

            <!-- Books count row: shown for author/series, empty for book -->
            <div class="result-row-secondary text-caption text-secondary">
              <template v-if="result.type !== 'book'">
                {{ result.book_count }} {{ result.book_count === 1
                  ? 'book'
                  : 'books' }}
              </template>
            </div>

            <!-- Spacer -->
            <div class="flex-grow-1" />

            <!-- Rating row -->
            <div class="result-row-rating d-flex align-center">
              <span class="text-primary font-weight-bold text-h6 mr-1">
                {{ formatRating(result).avg }}
              </span>

              <span class="text-body-2">
                ({{ formatRating(result).count }})
              </span>
            </div>
          </div>
        </v-card>
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

<style scoped>
.result-card {
  position: relative;
  height: 380px;
  overflow: hidden;
}

.result-image-zone {
  height: 190px;
  overflow: hidden;
}

.result-info-zone {
  height: 190px;
  overflow: hidden;
}

.result-row-title {
  height: 48px;
  overflow: hidden;
  margin-bottom: 6px;
}

.result-row-secondary {
  height: 22px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.result-row-rating {
  flex-shrink: 0;
}

.result-link {
  text-decoration: none;
  color: inherit;
}

.result-link:hover {
  text-decoration: underline;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
