<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({ title: 'My Ratings', description: 'Books you have rated.' })

const ratingsStore = useRatingsStore()
const dashboardStore = useDashboardStore()

const sortBy = ref<'created_at' | 'overall_rating'>('created_at')
const order = ref<'asc' | 'desc'>('desc')
const titleFilter = ref('')
const selectedRating = ref<number | null>(null)

const filteredItems = computed(() => {
  if (!titleFilter.value)
    return ratingsStore.items
  const q = titleFilter.value.toLowerCase()
  return ratingsStore.items.filter(e => e.book_title.toLowerCase().includes(q))
})

const sortOptions = [
  { label: 'Date Rated', value: 'created_at' },
  { label: 'Rating', value: 'overall_rating' },
]

function fetchWithFilters(reset = true) {
  const n = selectedRating.value
  const min = n
  const max = n === null
    ? null
    : n === 5
      ? 5
      : n + 0.5
  ratingsStore.fetch({ sort_by: sortBy.value, order: order.value, min_rating: min, max_rating: max }, reset)
}

watch([sortBy, order, selectedRating], () => fetchWithFilters(true))

onMounted(() => {
  fetchWithFilters(true)
  if (!dashboardStore.stats)
    dashboardStore.fetchStats()
})

const { sentinel } = useInfiniteScroll(
  () => ratingsStore.loadMore(),
  { enabled: computed(() => ratingsStore.hasMore && !ratingsStore.isLoading) },
)

const distribution = computed(() => dashboardStore.stats?.rating_distribution ?? {})
const avgRating = computed(() => dashboardStore.stats?.average_rating ?? 0)
const ratingsCount = computed(() => dashboardStore.stats?.ratings_count ?? 0)
</script>

<template>
  <v-container>
    <UserProfileTabs />

    <div class="mb-6 mt-4">
      <div class="text-h2 font-weight-bold">
        {{ ratingsCount }} rated books
      </div>

      <div class="text-body-1 text-medium-emphasis mt-1">
        Overall score plus 8 optional dimensions — emotion, depth, writing, rereadability, pacing, readability, plot, humor.
      </div>
    </div>

    <v-card
      v-if="ratingsCount > 0"
      class="mb-6"
    >
      <v-card-text>
        <h2 class="text-h6 font-weight-bold mb-4">
          Rating Distribution
        </h2>

        <RatingDistributionCard
          :avg-rating="avgRating"
          :rating-count="ratingsCount"
          :distribution="distribution"
          clickable
          :selected-star="selectedRating"
          @update:selected-star="selectedRating = $event"
        />
      </v-card-text>
    </v-card>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <UserFilterPanel
          v-model:sort="sortBy"
          v-model:order="order"
          v-model:title-filter="titleFilter"
          :sort-options="sortOptions"
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <BookUserHeaderRow
          v-if="ratingsStore.hasData"
          secondary-label="Rated On"
        >
          <template #metaHeaders>
            <div
              class="flex-shrink-0 text-caption text-medium-emphasis font-weight-bold text-uppercase"
              style="width: 140px;"
            >
              Your Rating
            </div>

            <div
              class="flex-shrink-0 text-caption text-medium-emphasis font-weight-bold text-uppercase"
              style="width: 140px;"
            >
              Community avg
            </div>
          </template>
        </BookUserHeaderRow>

        <div class="d-flex flex-column gap-2 mt-2">
          <RatingItem
            v-for="entry in filteredItems"
            :key="entry.book_id"
            :entry="entry"
          />
        </div>

        <div
          v-if="ratingsStore.isLoading && !ratingsStore.hasData"
          class="d-flex flex-column gap-2"
        >
          <v-skeleton-loader
            v-for="i in 5"
            :key="i"
            type="list-item-avatar-three-line"
          />
        </div>

        <div
          v-if="ratingsStore.isLoading && ratingsStore.hasData"
          class="py-6 text-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <div
          v-if="ratingsStore.isEmpty"
          class="py-12 text-center"
        >
          <v-icon
            icon="mdi-star-outline"
            size="64"
            color="secondary"
            class="mb-4"
          />

          <div class="text-h6 text-secondary">
            No ratings yet
          </div>

          <div class="text-secondary mt-2">
            Rate books while browsing to see them here
          </div>
        </div>

        <div ref="sentinel" />
      </v-col>
    </v-row>
  </v-container>
</template>
