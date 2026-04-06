<script setup lang="ts">
const route = useRoute()
const username = computed(() => route.params.username as string)

const bookshelfStore = useBookshelfStore()
const dashboardStore = useDashboardStore()

const statItems = [
  { label: 'Want to Read', icon: 'mdi-bookmark', color: 'info', getValue: () => dashboardStore.publicStats?.want_to_read_count ?? 0 },
  { label: 'Currently Reading', icon: 'mdi-book-open', color: 'primary', getValue: () => dashboardStore.publicStats?.reading_count ?? 0 },
  { label: 'Books Read', icon: 'mdi-bookshelf', color: 'success', getValue: () => dashboardStore.publicStats?.read_count ?? 0 },
  { label: 'Abandoned', icon: 'mdi-book-off', color: 'warning', getValue: () => dashboardStore.publicStats?.abandoned_count ?? 0 },
  { label: 'Favourite Books', icon: 'mdi-heart', color: 'error', getValue: () => dashboardStore.publicStats?.favourites_count ?? 0 },
  { label: 'Books Rated', icon: 'mdi-star', color: 'amber', getValue: () => dashboardStore.publicStats?.ratings_count ?? 0 },
  { label: 'Comments', icon: 'mdi-comment-text', color: 'blue-grey', getValue: () => dashboardStore.publicStats?.comments_count ?? 0 },
]

const sortBy = ref<'created_at' | 'updated_at' | 'book_title'>('created_at')
const order = ref<'asc' | 'desc'>('desc')
const titleFilter = ref('')

const filteredItems = computed(() => {
  if (!titleFilter.value)
    return bookshelfStore.publicItems
  const q = titleFilter.value.toLowerCase()

  return bookshelfStore.publicItems.filter(e => e.book_title.toLowerCase().includes(q))
})

const sortOptions = [
  { label: 'Date Added', value: 'created_at' },
  { label: 'Last Updated', value: 'updated_at' },
  { label: 'Title', value: 'book_title' },
]

useSeo({
  title: computed(() => `${username.value}'s Bookshelf`),
  description: computed(() => `View ${username.value}'s reading list.`),
})

function fetchWithFilters(reset = true) {
  bookshelfStore.fetchByUsername(
    username.value,
    { sort_by: sortBy.value, order: order.value },
    reset,
  )
}

watch([sortBy, order], () => fetchWithFilters(true))
watch(username, (val) => {
  fetchWithFilters(true)
  dashboardStore.fetchStatsByUsername(val)
})

onMounted(() => {
  fetchWithFilters(true)
  dashboardStore.fetchStatsByUsername(username.value)
})

const { sentinel } = useInfiniteScroll(
  () => bookshelfStore.loadMoreByUsername(username.value),
  {
    enabled: computed(() => bookshelfStore.publicHasMore && !bookshelfStore.publicIsLoading),
  },
)
</script>

<template>
  <v-container>
    <!-- User header -->
    <v-card
      variant="outlined"
      class="d-flex align-center mb-6 gap-4 pa-4"
    >
      <v-avatar
        color="secondary"
        size="64"
      >
        <span class="text-h5 font-weight-bold">{{ username.charAt(0).toUpperCase() }}</span>
      </v-avatar>

      <div>
        <div class="text-h6 font-weight-bold">
          @{{ username }}
        </div>

        <div class="text-subtitle-1">
          Public Bookshelf
        </div>
      </div>
    </v-card>

    <!-- Stats Grid -->
    <v-row class="mb-6">
      <v-col
        v-for="item in statItems"
        :key="item.label"
        cols="6"
        sm="4"
        lg="3"
      >
        <v-card
          :color="item.color"
          variant="tonal"
          class="h-100 pa-4 text-center"
        >
          <v-icon
            :icon="item.icon"
            size="32"
            class="mb-2"
          />

          <div class="text-h4 font-weight-bold">
            {{ item.getValue() }}
          </div>

          <div class="text-body-2 text-secondary">
            {{ item.label }}
          </div>
        </v-card>
      </v-col>
    </v-row>

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
        <div class="d-flex flex-column gap-2">
          <BookshelfItem
            v-for="entry in filteredItems"
            :key="entry.book_id"
            :entry="entry"
            is-public-profile
          />
        </div>

        <div
          v-if="bookshelfStore.publicIsLoading && !bookshelfStore.publicHasData"
          class="d-flex flex-column gap-2"
        >
          <v-skeleton-loader
            v-for="i in 5"
            :key="i"
            type="list-item-avatar-three-line"
          />
        </div>

        <div
          v-if="bookshelfStore.publicIsLoading && bookshelfStore.publicHasData"
          class="py-6 text-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <div
          v-if="bookshelfStore.publicIsEmpty"
          class="py-12 text-center"
        >
          <v-icon
            icon="mdi-bookshelf"
            size="64"
            color="secondary"
            class="mb-4"
          />

          <div class="text-h6 text-secondary">
            No books in this bookshelf
          </div>
        </div>

        <div ref="sentinel" />
      </v-col>
    </v-row>
  </v-container>
</template>
