<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeo({ title: 'Dashboard', description: 'Your personal account dashboard.' })

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
  if (!s) return 0
  return s.want_to_read_count + s.reading_count + s.read_count + s.abandoned_count
})

const collectionStats = computed(() => [
  {
    label: 'Bookshelf',
    icon: 'mdi-bookshelf',
    color: 'primary',
    value: totalBookshelf.value,
  },
  {
    label: 'Liked',
    icon: 'mdi-heart',
    color: 'error',
    value: dashboardStore.stats?.favourites_count ?? 0,
  },
  {
    label: 'Comments',
    icon: 'mdi-comment-text',
    color: 'blue-grey',
    value: dashboardStore.stats?.comments_count ?? 0,
  },
  {
    label: 'Ratings',
    icon: 'mdi-star',
    color: 'amber',
    value: dashboardStore.stats?.ratings_count ?? 0,
  },
  {
    label: 'Books finished this year',
    icon: 'mdi-check-circle',
    color: 'success',
    value: dashboardStore.stats?.finished_this_year_count ?? 0,
  },
  {
    label: 'Pages read this year',
    icon: 'mdi-file-document',
    color: 'info',
    value: dashboardStore.stats?.pages_read_this_year ?? 0,
  },
  {
    label: 'Hours read this year',
    icon: 'mdi-clock-outline',
    color: 'deep-purple',
    value: dashboardStore.stats?.hours_read_this_year ?? 0,
  },
])

const listCards = computed(() => [
  {
    label: 'Bookshelf',
    icon: 'mdi-bookshelf',
    color: 'primary',
    to: '/bookshelf',
    count: totalBookshelf.value,
    updatedAt: dashboardStore.stats?.bookshelf_updated_at || null,
  },
  {
    label: 'Liked books',
    icon: 'mdi-heart',
    color: 'error',
    to: '/favourites',
    count: dashboardStore.stats?.favourites_count ?? 0,
    updatedAt: dashboardStore.stats?.favourites_updated_at || null,
  },
  {
    label: 'Comments',
    icon: 'mdi-comment-text',
    color: 'blue-grey',
    to: '/comments',
    count: dashboardStore.stats?.comments_count ?? 0,
    updatedAt: dashboardStore.stats?.comments_updated_at || null,
  },
  {
    label: 'Rated',
    icon: 'mdi-star',
    color: 'amber',
    to: '/ratings',
    count: dashboardStore.stats?.ratings_count ?? 0,
    updatedAt: dashboardStore.stats?.ratings_updated_at || null,
  },
])

function formatUpdatedAt(iso: string | null): string {
  if (!iso) return 'Never'
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

async function deleteAccount() {
  deleting.value = true
  try {
    await dashboardStore.deleteAccount()
  }
  catch (error) {
    console.error('Failed to delete account:', error)
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

    <!-- Profile Card -->
    <UserProfileCard
      :display-name="authStore.user?.display_name || authStore.user?.username || ''"
      :username="authStore.user?.username || ''"
      :avatar-url="authStore.user?.avatar_url"
      :bio="authStore.user?.bio ?? null"
      :copy-url="publicProfileUrl"
      :copy-display="publicProfileDisplay"
    />

    <!-- Collection & Milestones -->
    <div class="text-overline text-medium-emphasis mb-1">
      Your numbers
    </div>
    <div class="text-h5 font-weight-bold mb-4">
      Collection &amp; milestones
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
            {{ item.value.toLocaleString() }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ item.label }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Your Lists -->
    <div class="text-overline text-medium-emphasis mb-1">
      Jump in
    </div>
    <div class="text-h5 font-weight-bold mb-4">
      Your lists
    </div>

    <v-row class="mb-8">
      <v-col
        v-for="card in listCards"
        :key="card.label"
        cols="12"
        sm="6"
        lg="3"
      >
        <NuxtLink
          :to="card.to"
          class="text-decoration-none"
        >
          <v-card
            variant="elevated"
            class="h-100 pa-4 position-relative"
          >
            <v-icon
              :icon="card.icon"
              :color="card.color"
              size="32"
              class="mb-2"
            />
            <div class="text-h4 font-weight-bold">
              {{ card.count.toLocaleString() }}
            </div>
            <div class="text-body-1 font-weight-medium mb-1">
              {{ card.label }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Last updated {{ formatUpdatedAt(card.updatedAt) }}
            </div>
            <v-icon
              icon="mdi-chevron-right"
              size="20"
              class="position-absolute"
              style="bottom: 16px; right: 16px;"
            />
          </v-card>
        </NuxtLink>
      </v-col>
    </v-row>

    <!-- Danger Zone -->
    <v-card
      variant="outlined"
      color="error"
      class="mb-6"
    >
      <v-card-title class="text-error">
        Delete Account
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <div class="text-body-2 text-secondary">
            Permanently delete your account and all associated data. This action cannot be undone.
          </div>
        </div>

        <v-btn
          color="error"
          variant="elevated"
          @click="confirmDialog = true"
        >
          Delete Account
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
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
          Delete Account?
        </v-card-title>

        <v-card-text
          id="delete-dialog-description"
          class="text-body-2"
        >
          <div class="mb-2">
            This will permanently delete your account and all associated data.
          </div>

          <div>
            This action cannot be undone.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="deleting"
            @click="confirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="error"
            variant="elevated"
            :loading="deleting"
            @click="deleteAccount"
          >
            Delete Account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
