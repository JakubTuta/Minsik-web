<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({ title: 'My Ratings', description: 'Books you have rated.' })

const ratingsStore = useRatingsStore()

const sortBy = ref<'created_at' | 'overall_rating'>('created_at')
const order = ref<'asc' | 'desc'>('desc')
const titleFilter = ref('')
const selectedRatings = ref<number[]>([])

const ratingCounts = computed(() => {
  const counts: Record<number, number> = { 0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0 }
  ratingsStore.items.forEach((e) => {
    const rounded = Math.round(e.overall_rating * 2) / 2
    if (rounded >= 0.5 && rounded <= 5)
      counts[rounded]++
  })

  return counts
})

const filteredItems = computed(() => {
  let items = ratingsStore.items
  if (titleFilter.value) {
    const q = titleFilter.value.toLowerCase()
    items = items.filter(e => e.book_title.toLowerCase().includes(q))
  }
  if (selectedRatings.value.length > 0) {
    items = items.filter(e => selectedRatings.value.includes(Math.round(e.overall_rating)))
  }

  return items
})

const sortOptions = [
  { label: 'Date Rated', value: 'created_at' },
  { label: 'Rating', value: 'overall_rating' },
]

function fetchWithFilters(reset = true) {
  ratingsStore.fetch({ sort_by: sortBy.value, order: order.value }, reset)
}

watch([sortBy, order], () => fetchWithFilters(true))

onMounted(() => fetchWithFilters(true))

useInfiniteScroll(
  () => ratingsStore.loadMore(),
  {
    threshold: 400,
    enabled: computed(() => ratingsStore.hasMore && !ratingsStore.isLoading),
  },
)
</script>

<template>
  <v-container>
    <UserProfileTabs />

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <UserFilterPanel
          v-model:sort="sortBy"
          v-model:order="order"
          v-model:title-filter="titleFilter"
          v-model:selected-ratings="selectedRatings"
          :sort-options="sortOptions"
          :rating-counts="ratingCounts"
          show-rating-filter
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <div class="d-flex flex-column gap-2">
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
      </v-col>
    </v-row>
  </v-container>
</template>
