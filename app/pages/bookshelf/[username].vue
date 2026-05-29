<script setup lang="ts">
const route = useRoute()
const username = computed(() => route.params.username as string)

const bookshelfStore = useBookshelfStore()
const dashboardStore = useDashboardStore()
const profileStore = useProfileStore()

const currentYear = new Date().getFullYear()

const statsItems = computed(() => {
  const s = dashboardStore.publicStats
  const totalBooks = (s?.want_to_read_count ?? 0) + (s?.reading_count ?? 0) + (s?.read_count ?? 0) + (s?.abandoned_count ?? 0)
  return [
    { icon: 'mdi-bookshelf', iconColor: 'primary', value: totalBooks, label: 'Books on shelves' },
    { icon: 'mdi-star', iconColor: 'amber', value: s?.ratings_count ?? 0, label: 'Ratings' },
    { icon: 'mdi-comment-text', iconColor: 'blue-grey', value: s?.reviews_count ?? 0, label: 'Reviews' },
    { icon: 'mdi-check-circle', iconColor: 'success', value: s?.read_count ?? 0, label: 'Finished' },
    { icon: 'mdi-file-document', iconColor: 'info', value: (s?.pages_read_total ?? 0).toLocaleString(), label: 'Pages read' },
    { icon: 'mdi-star-half-full', iconColor: 'amber', value: s?.average_rating ? s.average_rating.toFixed(1) : '—', label: 'Avg rating' },
  ]
})

useSeo({
  title: computed(() => `${username.value}'s Bookshelf`),
  description: computed(() => `View ${username.value}'s reading list.`),
})

function fetchAll(reset = true) {
  bookshelfStore.fetchByUsername(username.value, { sort_by: 'created_at', order: 'desc' }, reset)
  dashboardStore.fetchStatsByUsername(username.value)
  profileStore.fetchOverview(username.value)
}

watch(username, () => fetchAll(true))

onMounted(() => fetchAll(true))

const { sentinel } = useInfiniteScroll(
  () => bookshelfStore.loadMoreByUsername(username.value),
  {
    enabled: computed(() => bookshelfStore.publicHasMore && !bookshelfStore.publicIsLoading),
  },
)
</script>

<template>
  <v-container>
    <UserProfileCard
      :display-name="profileStore.overview?.user.display_name || username"
      :username="username"
      :avatar-url="profileStore.overview?.user.avatar_url"
      :bio="profileStore.overview?.user.bio"
    />

    <v-card
      variant="elevated"
      class="mb-6 pa-4"
    >
      <StatsRow :stats="statsItems" />
    </v-card>

    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <BookUserHeaderRow is-public-profile />

        <div class="d-flex flex-column gap-2 mt-2">
          <BookshelfItem
            v-for="entry in bookshelfStore.publicItems"
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

      <v-col
        cols="12"
        md="4"
      >
        <ReadingNowCard :book="profileStore.overview?.reading_now ?? null" />

        <TopGenresCard :genres="profileStore.overview?.top_genres ?? []" />

        <FavouriteAuthorsCard :authors="profileStore.overview?.favourite_authors ?? []" />

        <FavouritesOfYearCard
          :books="profileStore.overview?.favourites_this_year ?? []"
          :year="currentYear"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
