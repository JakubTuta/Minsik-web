<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

useSeo({ title: t('ratingsPage.pageTitle'), description: t('ratingsPage.pageDescription') })

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

const sortOptions = computed(() => [
  { label: t('filter.dateRated'), value: 'created_at' },
  { label: t('ratingsPage.rating'), value: 'overall_rating' },
])

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
        {{ t('ratingsPage.ratedBooksCount', {"count": ratingsCount}, ratingsCount) }}
      </div>

      <div class="text-body-1 text-medium-emphasis mt-1">
        {{ t('ratingsPage.pageHint') }}
      </div>
    </div>

    <v-card
      v-if="ratingsCount > 0"
      class="mb-6"
    >
      <v-card-text>
        <h2 class="text-h6 font-weight-bold mb-4">
          {{ t('ratingsPage.ratingDistribution') }}
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
        <ErrorState
          v-if="ratingsStore.error"
          :message="t('ratingsPage.loadFailed')"
          @retry="fetchWithFilters(true)"
        />

        <template v-else>
          <BookUserHeaderRow
            v-if="ratingsStore.hasData"
            :secondary-label="t('ratingsPage.ratedOn')"
          >
            <template #metaHeaders>
              <div
                class="text-caption text-medium-emphasis font-weight-bold text-uppercase flex-shrink-0"
                style="width: 140px;"
              >
                {{ t('rating.yourRating') }}
              </div>

              <div
                class="text-caption text-medium-emphasis font-weight-bold text-uppercase flex-shrink-0"
                style="width: 140px;"
              >
                {{ t('rating.communityAvg') }}
              </div>
            </template>
          </BookUserHeaderRow>

          <div class="d-flex flex-column mt-2 gap-2">
            <RatingItem
              v-for="entry in filteredItems"
              :key="entry.book_id"
              :entry="entry"
            />
          </div>

          <div
            v-if="ratingsStore.hasData && filteredItems.length === 0"
            class="py-12 text-center"
          >
            <div class="text-h6 text-secondary">
              {{ t('filter.noMatch', {"query": titleFilter}) }}
            </div>
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
              {{ t('rating.noRatingsYet') }}
            </div>

            <div class="text-secondary mt-2">
              {{ t('ratingsPage.emptyHint') }}
            </div>
          </div>
        </template>

        <div ref="sentinel" />
      </v-col>
    </v-row>
  </v-container>
</template>
