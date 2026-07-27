<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

useSeo({ title: t('favourites.pageTitle'), description: t('favourites.pageDescription') })

const favouritesStore = useFavouritesStore()
const dashboardStore = useDashboardStore()

const sortOptions = computed(() => [
  { label: t('filter.dateAdded'), value: 'created_at' },
])

const order = ref<'asc' | 'desc'>('desc')
const titleFilter = ref('')

const filteredItems = computed(() => {
  if (!titleFilter.value)
    return favouritesStore.items
  const q = titleFilter.value.toLowerCase()

  return favouritesStore.items.filter(e => e.book_title.toLowerCase().includes(q))
})

watch(order, newOrder => favouritesStore.fetch(true, 'created_at', newOrder))

onMounted(() => {
  favouritesStore.fetch(true, 'created_at', order.value)
  if (!dashboardStore.stats)
    dashboardStore.fetchStats()
})

const { sentinel } = useInfiniteScroll(
  () => favouritesStore.loadMore(),
  { enabled: computed(() => favouritesStore.hasMore && !favouritesStore.isLoading) },
)
</script>

<template>
  <v-container>
    <UserProfileTabs />

    <div class="mb-6 mt-4">
      <div class="text-h2 font-weight-bold">
        {{ t('favourites.likedBooksCount', {"count": dashboardStore.stats?.favourites_count ?? 0}, dashboardStore.stats?.favourites_count ?? 0) }}
      </div>

      <div class="text-body-1 text-medium-emphasis mt-1">
        {{ t('favourites.pageHint') }}
      </div>
    </div>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <UserFilterPanel
          v-model:order="order"
          v-model:title-filter="titleFilter"
          :sort-options="sortOptions"
          sort="created_at"
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <ErrorState
          v-if="favouritesStore.error"
          :message="t('favourites.loadFailed')"
          @retry="favouritesStore.fetch(true, 'created_at', order)"
        />

        <template v-else>
          <BookUserHeaderRow
            v-if="favouritesStore.hasData"
            :is-public-profile="false"
          />

          <div class="d-flex flex-column mt-2 gap-2">
            <FavouriteItem
              v-for="entry in filteredItems"
              :key="entry.book_id"
              :entry="entry"
            />
          </div>

          <div
            v-if="favouritesStore.hasData && filteredItems.length === 0"
            class="py-12 text-center"
          >
            <div class="text-h6 text-secondary">
              {{ t('filter.noMatch', {"query": titleFilter}) }}
            </div>
          </div>

          <div
            v-if="favouritesStore.isLoading && !favouritesStore.hasData"
            class="d-flex flex-column gap-2"
          >
            <v-skeleton-loader
              v-for="i in 5"
              :key="i"
              type="list-item-avatar-three-line"
            />
          </div>

          <div
            v-if="favouritesStore.isLoading && favouritesStore.hasData"
            class="py-6 text-center"
          >
            <v-progress-circular
              indeterminate
              color="primary"
            />
          </div>

          <div
            v-if="favouritesStore.isEmpty"
            class="py-12 text-center"
          >
            <v-icon
              icon="mdi-heart-outline"
              size="64"
              color="secondary"
              class="mb-4"
            />

            <div class="text-h6 text-secondary">
              {{ t('favourites.empty') }}
            </div>

            <div class="text-secondary mt-2">
              {{ t('favourites.emptyHint') }}
            </div>
          </div>
        </template>

        <div ref="sentinel" />
      </v-col>
    </v-row>
  </v-container>
</template>
