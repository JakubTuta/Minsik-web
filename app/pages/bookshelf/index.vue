<script setup lang="ts">
import type { BookshelfStatus } from '~/types/user'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

useSeo({ title: t('nav.myBookshelf'), description: t('bookshelfPage.pageDescription') })

const bookshelfStore = useBookshelfStore()
const dashboardStore = useDashboardStore()

const totalBooks = computed(() => {
  const s = dashboardStore.stats
  if (!s)
    return 0

  return s.want_to_read_count + s.reading_count + s.read_count + s.abandoned_count
})

const sortBy = ref<'created_at' | 'updated_at' | 'book_title'>('created_at')
const order = ref<'asc' | 'desc'>('desc')
const status = ref<BookshelfStatus | null>(null)
const titleFilter = ref('')

const filteredItems = computed(() => {
  if (!titleFilter.value)
    return bookshelfStore.myItems
  const q = titleFilter.value.toLowerCase()

  return bookshelfStore.myItems.filter(e => e.book_title.toLowerCase().includes(q))
})

const sortOptions = computed(() => [
  { label: t('filter.dateAdded'), value: 'created_at' },
  { label: t('filter.lastUpdated'), value: 'updated_at' },
  { label: t('filter.titleSort'), value: 'book_title' },
])

function fetchWithFilters(reset = true) {
  bookshelfStore.fetchMine(
    { sort_by: sortBy.value, order: order.value, status: status.value ?? undefined },
    reset,
  )
}

watch([sortBy, order, status], () => fetchWithFilters(true))

onMounted(() => {
  fetchWithFilters(true)
  if (!dashboardStore.stats)
    dashboardStore.fetchStats()
})

const { sentinel } = useInfiniteScroll(
  () => bookshelfStore.loadMoreMine(),
  { enabled: computed(() => bookshelfStore.myHasMore && !bookshelfStore.myIsLoading) },
)
</script>

<template>
  <v-container>
    <UserProfileTabs />

    <div class="mb-6 mt-4">
      <div class="text-h2 font-weight-bold">
        {{ t('bookshelfPage.booksOnShelf', {"count": totalBooks}, totalBooks) }}
      </div>

      <div class="text-body-1 text-medium-emphasis mt-1">
        {{ t('bookshelfPage.pageHint') }}
      </div>
    </div>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <UserFilterPanel
          v-model:sort="sortBy"
          v-model:order="order"
          v-model:status="status"
          v-model:title-filter="titleFilter"
          :sort-options="sortOptions"
          show-status-filter
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <ErrorState
          v-if="bookshelfStore.myError"
          :message="t('bookshelfPage.loadFailed')"
          @retry="fetchWithFilters(true)"
        />

        <template v-else>
          <BookUserHeaderRow
            v-if="bookshelfStore.myHasData"
            :is-public-profile="false"
          />

          <div class="d-flex flex-column mt-2 gap-2">
            <BookshelfItem
              v-for="entry in filteredItems"
              :key="entry.book_id"
              :entry="entry"
              :is-public-profile="false"
            />
          </div>

          <div
            v-if="bookshelfStore.myHasData && filteredItems.length === 0"
            class="py-12 text-center"
          >
            <div class="text-h6 text-secondary">
              {{ t('filter.noMatch', {"query": titleFilter}) }}
            </div>
          </div>

          <div
            v-if="bookshelfStore.myIsLoading && !bookshelfStore.myHasData"
            class="d-flex flex-column gap-2"
          >
            <v-skeleton-loader
              v-for="i in 5"
              :key="i"
              type="list-item-avatar-three-line"
            />
          </div>

          <div
            v-if="bookshelfStore.myIsLoading && bookshelfStore.myHasData"
            class="py-6 text-center"
          >
            <v-progress-circular
              indeterminate
              color="primary"
            />
          </div>

          <div
            v-if="bookshelfStore.myIsEmpty"
            class="py-12 text-center"
          >
            <v-icon
              icon="mdi-bookshelf"
              size="64"
              color="secondary"
              class="mb-4"
            />

            <div class="text-h6 text-secondary">
              {{ t('bookshelfPage.empty') }}
            </div>

            <div class="text-secondary mt-2">
              {{ t('bookshelfPage.emptyHint') }}
            </div>
          </div>
        </template>

        <div ref="sentinel" />
      </v-col>
    </v-row>
  </v-container>
</template>
