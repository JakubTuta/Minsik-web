<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({ title: 'My Comments', description: 'Comments you have posted on books.' })

const commentsStore = useUserCommentsStore()

const sortBy = ref<'created_at' | 'updated_at'>('created_at')
const order = ref<'asc' | 'desc'>('desc')
const titleFilter = ref('')

const filteredItems = computed(() => {
  if (!titleFilter.value)
    return commentsStore.items
  const q = titleFilter.value.toLowerCase()

  return commentsStore.items.filter(e => e.book.title.toLowerCase().includes(q))
})

const sortOptions = [
  { label: 'Date Posted', value: 'created_at' },
  { label: 'Last Updated', value: 'updated_at' },
]

function fetchWithFilters(reset = true) {
  commentsStore.fetch({ sort_by: sortBy.value, order: order.value }, reset)
}

watch([sortBy, order], () => fetchWithFilters(true))

onMounted(() => fetchWithFilters(true))

useInfiniteScroll(
  () => commentsStore.loadMore(),
  {
    threshold: 400,
    enabled: computed(() => commentsStore.hasMore && !commentsStore.isLoading),
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
          :sort-options="sortOptions"
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <div class="d-flex flex-column gap-2">
          <CommentItem
            v-for="entry in filteredItems"
            :key="entry.comment_id"
            :entry="entry"
          />
        </div>

        <div
          v-if="commentsStore.isLoading && !commentsStore.hasData"
          class="d-flex flex-column gap-2"
        >
          <v-skeleton-loader
            v-for="i in 5"
            :key="i"
            type="list-item-avatar-three-line"
          />
        </div>

        <div
          v-if="commentsStore.isLoading && commentsStore.hasData"
          class="py-6 text-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <div
          v-if="commentsStore.isEmpty"
          class="py-12 text-center"
        >
          <v-icon
            icon="mdi-comment-outline"
            size="64"
            color="secondary"
            class="mb-4"
          />

          <div class="text-h6 text-secondary">
            No comments yet
          </div>

          <div class="text-caption text-secondary mt-2">
            Comment on books while browsing to see them here
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
