<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeo({ title: 'Dashboard', description: 'Your personal account dashboard.' })

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

const confirmDialog = ref(false)
const deleting = ref(false)

const userInitials = computed(() => {
  const displayName = authStore.user?.display_name || authStore.user?.username || 'User'

  return displayName.charAt(0).toUpperCase()
})

const statItems = [
  {
    label: 'Want to Read',
    icon: 'mdi-bookmark',
    color: 'info',
    getValue: () => dashboardStore.stats?.want_to_read_count ?? 0,
  },
  {
    label: 'Currently Reading',
    icon: 'mdi-book-open',
    color: 'primary',
    getValue: () => dashboardStore.stats?.reading_count ?? 0,
  },
  {
    label: 'Books Read',
    icon: 'mdi-bookshelf',
    color: 'success',
    getValue: () => dashboardStore.stats?.read_count ?? 0,
  },
  {
    label: 'Abandoned',
    icon: 'mdi-book-off',
    color: 'warning',
    getValue: () => dashboardStore.stats?.abandoned_count ?? 0,
  },
  {
    label: 'Favourite Books',
    icon: 'mdi-heart',
    color: 'error',
    getValue: () => dashboardStore.stats?.favourites_count ?? 0,
  },
  {
    label: 'Books Rated',
    icon: 'mdi-star',
    color: 'amber',
    getValue: () => dashboardStore.stats?.ratings_count ?? 0,
  },
  {
    label: 'Comments',
    icon: 'mdi-comment-text',
    color: 'blue-grey',
    getValue: () => dashboardStore.stats?.comments_count ?? 0,
  },
]

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

    <!-- Profile Section -->
    <v-card
      class="mb-6"
      variant="elevated"
    >
      <div class="pa-6">
        <div class="d-flex align-center gap-4">
          <v-avatar
            size="90"
            color="secondary"
          >
            <span class="text-h4 font-weight-bold">{{ userInitials }}</span>
          </v-avatar>

          <div>
            <div class="text-h5 font-weight-bold">
              {{ authStore.user?.display_name || authStore.user?.username }}
            </div>

            <div class="text-secondary">
              @{{ authStore.user?.username }}
            </div>
          </div>
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
