<script setup lang="ts">
const route = useRoute()
const username = computed(() => route.params.username as string)

const { t, n } = useI18n()
const bookshelfStore = useBookshelfStore()
const dashboardStore = useDashboardStore()
const profileStore = useProfileStore()

const { error: overviewError } = await useAsyncData(
  `profile-overview-${username.value}`,
  () => profileStore.fetchOverview(username.value),
)

if (overviewError.value) {
  throw createError({
    statusCode: (overviewError.value as any)?.response?.status === 404
      ? 404
      : 500,
    message: (overviewError.value as any)?.response?.status === 404
      ? t('profile.userNotFound')
      : t('profile.loadFailed'),
    fatal: true,
  })
}

const currentYear = new Date().getFullYear()

const statsItems = computed(() => {
  const s = dashboardStore.publicStats
  const totalBooks = (s?.want_to_read_count ?? 0) + (s?.reading_count ?? 0) + (s?.read_count ?? 0) + (s?.abandoned_count ?? 0)

  return [
    { icon: 'mdi-bookshelf', iconColor: 'primary', value: totalBooks, label: t('profile.booksOnShelves') },
    { icon: 'mdi-star', iconColor: 'amber', value: s?.ratings_count ?? 0, label: t('nav.ratings') },
    { icon: 'mdi-comment-text', iconColor: 'blue-grey', value: s?.reviews_count ?? 0, label: t('profile.reviews') },
    { icon: 'mdi-check-circle', iconColor: 'success', value: s?.read_count ?? 0, label: t('profile.finished') },
    { icon: 'mdi-file-document', iconColor: 'info', value: n(s?.pages_read_total ?? 0), label: t('profile.pagesRead') },
    { icon: 'mdi-star-half-full', iconColor: 'amber', value: s?.average_rating
      ? s.average_rating.toFixed(1)
      : '—', label: t('profile.avgRating') },
  ]
})

useSeo({
  title: computed(() => t('profile.usersBookshelf', { username: username.value })),
  description: computed(() => t('profile.usersBookshelfDescription', { username: username.value })),
})

function fetchAll(reset = true) {
  bookshelfStore.fetchByUsername(username.value, { sort_by: 'created_at', order: 'desc' }, reset)
  dashboardStore.fetchStatsByUsername(username.value)
  profileStore.fetchOverview(username.value).catch(() => {})
}

// Initial load's overview already came from useAsyncData above (with the 404 gate);
// this only re-fetches everything when navigating client-side to a different username.
watch(username, () => fetchAll(true))

onMounted(() => {
  bookshelfStore.fetchByUsername(username.value, { sort_by: 'created_at', order: 'desc' }, true)
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

        <ErrorState
          v-if="bookshelfStore.publicError"
          :message="t('profile.bookshelfLoadFailed')"
          @retry="fetchAll(true)"
        />

        <template v-else>
          <div class="d-flex flex-column mt-2 gap-2">
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
              {{ t('profile.noBooksInBookshelf') }}
            </div>
          </div>
        </template>

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
