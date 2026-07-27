<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

useSeo({ title: t('comment.pageTitle'), description: t('comment.pageDescription') })

const commentsStore = useUserCommentsStore()

const sortBy = ref<'created_at' | 'updated_at'>('created_at')
const order = ref<'asc' | 'desc'>('desc')
const titleFilter = ref('')

const filteredItems = computed(() => {
  if (!titleFilter.value)
    return commentsStore.items
  const q = titleFilter.value.toLowerCase()

  return commentsStore.items.filter(e => e.book_title.toLowerCase().includes(q))
})

const sortOptions = computed(() => [
  { label: t('filter.datePosted'), value: 'created_at' },
  { label: t('filter.lastUpdated'), value: 'updated_at' },
])

function fetchWithFilters(reset = true) {
  commentsStore.fetch({ sort_by: sortBy.value, order: order.value }, reset)
}

watch([sortBy, order], () => fetchWithFilters(true))

onMounted(() => fetchWithFilters(true))

const { sentinel } = useInfiniteScroll(
  () => commentsStore.loadMore(),
  { enabled: computed(() => commentsStore.hasMore && !commentsStore.isLoading) },
)
</script>

<template>
  <v-container>
    <UserProfileTabs />

    <div class="mb-6 mt-4">
      <div class="text-h2 font-weight-bold">
        {{ t('common.commentCount', {"count": commentsStore.total}, commentsStore.total) }}
      </div>

      <div class="text-body-1 text-medium-emphasis mt-1">
        {{ t('comment.pageHint') }}
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
          v-model:title-filter="titleFilter"
          :sort-options="sortOptions"
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <ErrorState
          v-if="commentsStore.error"
          :message="t('comment.loadPageFailed')"
          @retry="fetchWithFilters(true)"
        />

        <template v-else>
          <BookUserHeaderRow
            v-if="commentsStore.hasData"
            :secondary-label="t('filter.updated')"
          />

          <div class="d-flex flex-column mt-2 gap-2">
            <CommentItem
              v-for="entry in filteredItems"
              :key="entry.comment_id"
              :entry="entry"
            />
          </div>

          <div
            v-if="commentsStore.hasData && filteredItems.length === 0"
            class="py-12 text-center"
          >
            <div class="text-h6 text-secondary">
              {{ t('comment.noCommentsMatch', {"query": titleFilter}) }}
            </div>
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
              {{ t('comment.noneYet') }}
            </div>

            <div class="text-secondary mt-2">
              {{ t('comment.emptyHint') }}
            </div>
          </div>
        </template>

        <div ref="sentinel" />
      </v-col>
    </v-row>
  </v-container>
</template>
