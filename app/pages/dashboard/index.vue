<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t, n } = useI18n()

useSeo({ title: t('nav.dashboard'), description: t('dashboardPage.pageDescription') })

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const confirmDialog = ref(false)
const deleting = ref(false)

const publicProfileUrl = computed(() => {
  const base = config.public.siteUrl.replace(/\/$/, '')

  return `${base}/bookshelf/${authStore.user?.username}`
})

const publicProfileDisplay = computed(() => {
  const host = config.public.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return `${host}/@${authStore.user?.username}`
})

const totalBookshelf = computed(() => {
  const s = dashboardStore.stats
  if (!s)
    return 0

  return s.want_to_read_count + s.reading_count + s.read_count + s.abandoned_count
})

const collectionStats = computed(() => [
  {
    label: t('nav.myBookshelf'),
    icon: 'mdi-bookshelf',
    color: 'primary',
    value: totalBookshelf.value,
  },
  {
    label: t('dashboardPage.liked'),
    icon: 'mdi-heart',
    color: 'error',
    value: dashboardStore.stats?.favourites_count ?? 0,
  },
  {
    label: t('nav.comments'),
    icon: 'mdi-comment-text',
    color: 'blue-grey',
    value: dashboardStore.stats?.comments_count ?? 0,
  },
  {
    label: t('nav.ratings'),
    icon: 'mdi-star',
    color: 'amber',
    value: dashboardStore.stats?.ratings_count ?? 0,
  },
  {
    label: t('dashboardPage.booksFinishedThisYear'),
    icon: 'mdi-check-circle',
    color: 'success',
    value: dashboardStore.stats?.finished_this_year_count ?? 0,
  },
  {
    label: t('dashboardPage.pagesReadThisYear'),
    icon: 'mdi-file-document',
    color: 'info',
    value: dashboardStore.stats?.pages_read_this_year ?? 0,
  },
  {
    label: t('dashboardPage.hoursReadThisYear'),
    icon: 'mdi-clock-outline',
    color: 'deep-purple',
    value: dashboardStore.stats?.hours_read_this_year ?? 0,
  },
])

const listCards = computed(() => [
  {
    label: t('nav.myBookshelf'),
    icon: 'mdi-bookshelf',
    color: 'primary',
    to: '/bookshelf',
    count: totalBookshelf.value,
    updatedAt: dashboardStore.stats?.bookshelf_updated_at || null,
  },
  {
    label: t('dashboardPage.likedBooks'),
    icon: 'mdi-heart',
    color: 'error',
    to: '/favourites',
    count: dashboardStore.stats?.favourites_count ?? 0,
    updatedAt: dashboardStore.stats?.favourites_updated_at || null,
  },
  {
    label: t('nav.comments'),
    icon: 'mdi-comment-text',
    color: 'blue-grey',
    to: '/comments',
    count: dashboardStore.stats?.comments_count ?? 0,
    updatedAt: dashboardStore.stats?.comments_updated_at || null,
  },
  {
    label: t('dashboardPage.rated'),
    icon: 'mdi-star',
    color: 'amber',
    to: '/ratings',
    count: dashboardStore.stats?.ratings_count ?? 0,
    updatedAt: dashboardStore.stats?.ratings_updated_at || null,
  },
])

function formatUpdatedAt(iso: string | null): string {
  if (!iso)
    return t('dashboardPage.never')
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1)
    return t('time.justNowCompact')
  if (minutes < 60)
    return t('time.minutesAgoCompact', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return t('time.hoursAgoCompact', { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 30)
    return t('time.daysAgoCompact', { n: days })
  const months = Math.floor(days / 30)
  if (months < 12)
    return t('time.monthsAgoCompact', { n: months })

  return t('time.yearsAgoCompact', { n: Math.floor(months / 12) })
}

async function deleteAccount() {
  deleting.value = true
  try {
    await dashboardStore.deleteAccount()
  }
  catch (error) {
    console.error('Failed to delete account:', error)
    useToastStore().error(t('dashboardPage.deleteAccountFailed'))
    deleting.value = false
  }
}

onMounted(() => {
  dashboardStore.fetchStats()
})
</script>

<template>
  <v-container>
    <UserProfileTabs />

    <UserProfileCard
      :display-name="authStore.user?.display_name || authStore.user?.username || ''"
      :username="authStore.user?.username || ''"
      :avatar-url="authStore.user?.avatar_url"
      :bio="authStore.user?.bio ?? null"
      :copy-url="publicProfileUrl"
      :copy-display="publicProfileDisplay"
    />

    <ErrorState
      v-if="dashboardStore.error"
      :message="t('dashboardPage.loadStatsFailed')"
      @retry="dashboardStore.fetchStats(true)"
    />

    <template v-else>
      <div class="text-overline text-medium-emphasis mb-1">
        {{ t('dashboardPage.yourNumbers') }}
      </div>

      <div class="text-h5 font-weight-bold mb-4">
        {{ t('dashboardPage.collectionAndMilestones') }}
      </div>

      <v-row class="mb-8">
        <v-col
          v-for="item in collectionStats"
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
              size="28"
              class="mb-2"
            />

            <div class="text-h4 font-weight-bold">
              {{ n(item.value) }}
            </div>

            <div class="text-body-2 text-medium-emphasis">
              {{ item.label }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <div class="text-overline text-medium-emphasis mb-1">
        {{ t('dashboardPage.jumpIn') }}
      </div>

      <div class="text-h5 font-weight-bold mb-4">
        {{ t('dashboardPage.yourLists') }}
      </div>

      <v-row class="mb-8">
        <v-col
          v-for="card in listCards"
          :key="card.label"
          cols="12"
          sm="6"
          lg="3"
        >
          <NuxtLinkLocale
            :to="card.to"
            class="text-decoration-none"
          >
            <v-card
              variant="elevated"
              class="position-relative h-100 pa-4"
            >
              <v-icon
                :icon="card.icon"
                :color="card.color"
                size="32"
                class="mb-2"
              />

              <div class="text-h4 font-weight-bold">
                {{ n(card.count) }}
              </div>

              <div class="text-body-1 font-weight-medium mb-1">
                {{ card.label }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ t('dashboardPage.lastUpdated', {"time": formatUpdatedAt(card.updatedAt)}) }}
              </div>

              <v-icon
                icon="mdi-chevron-right"
                size="20"
                class="position-absolute"
                style="bottom: 16px; right: 16px;"
              />
            </v-card>
          </NuxtLinkLocale>
        </v-col>
      </v-row>
    </template>

    <v-card
      variant="outlined"
      color="error"
      class="mb-6"
    >
      <v-card-title class="text-error">
        {{ t('dashboardPage.deleteAccount') }}
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <div class="text-body-2 text-secondary">
            {{ t('dashboardPage.deleteAccountWarning') }}
          </div>
        </div>

        <v-btn
          color="error"
          variant="elevated"
          @click="confirmDialog = true"
        >
          {{ t('dashboardPage.deleteAccount') }}
        </v-btn>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="confirmDialog"
      max-width="400"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <v-card>
        <v-card-title
          id="delete-dialog-title"
          class="text-error"
        >
          {{ t('dashboardPage.deleteAccountConfirmTitle') }}
        </v-card-title>

        <v-card-text
          id="delete-dialog-description"
          class="text-body-2"
        >
          <div class="mb-2">
            {{ t('dashboardPage.deleteAccountConfirmBody1') }}
          </div>

          <div>
            {{ t('dashboardPage.deleteAccountConfirmBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="deleting"
            @click="confirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="error"
            variant="elevated"
            :loading="deleting"
            @click="deleteAccount"
          >
            {{ t('dashboardPage.deleteAccount') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
