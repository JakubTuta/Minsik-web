<script setup lang="ts">
import type { BookshelfStatus } from '~/types/user'

definePageMeta({ middleware: 'auth' })

useSeo({ title: 'My Bookshelf', description: 'Your personal reading list.' })

const bookshelfStore = useBookshelfStore()

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

const sortOptions = [
  { label: 'Date Added', value: 'created_at' },
  { label: 'Last Updated', value: 'updated_at' },
  { label: 'Title', value: 'book_title' },
]

function fetchWithFilters(reset = true) {
  bookshelfStore.fetchMine(
    { sort_by: sortBy.value, order: order.value, status: status.value ?? undefined },
    reset,
  )
}

watch([sortBy, order, status], () => fetchWithFilters(true))

onMounted(() => fetchWithFilters(true))

const isLoadingMore = ref(false)

async function onIntersectLoadMore(isIntersecting: boolean) {
  if (!isIntersecting || isLoadingMore.value || !bookshelfStore.myHasMore || bookshelfStore.myIsLoading)
    return
  isLoadingMore.value = true
  try { await bookshelfStore.loadMoreMine() }
  finally { isLoadingMore.value = false }
}
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
        <!-- Book list -->
        <div class="d-flex flex-column gap-2">
          <div
            v-for="(entry, index) in filteredItems"
            :key="entry.book_id"
            v-intersect="index === filteredItems.length - 3
              ? onIntersectLoadMore
              : undefined"
          >
            <BookshelfItem
              :entry="entry"
              :is-public-profile="false"
            />
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

        <!-- Loading more indicator -->
        <div
          v-if="bookshelfStore.myIsLoading && bookshelfStore.myHasData"
          class="py-6 text-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <!-- Empty state -->
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
            Your bookshelf is empty
          </div>

          <div class="text-secondary mt-2">
            Add books to your bookshelf while browsing
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
