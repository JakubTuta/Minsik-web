<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  ssr: false,
})

useSeoMeta({
  title: 'Dashboard',
  robots: 'noindex, nofollow',
})

const authStore = useAuthStore()
const { user, authInitialized, isAuthenticated } = storeToRefs(authStore)

const displayName = computed(() => user.value?.display_name || user.value?.username || 'User')
</script>

<template>
  <!-- Auth loading state — shown during SSR and client-side auth check -->
  <v-container
    v-if="!authInitialized || !isAuthenticated"
    class="fill-height d-flex align-center justify-center"
  >
    <div class="text-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="52"
      />

      <p class="text-h6 mt-4">
        Verifying your session...
      </p>
    </div>
  </v-container>

  <!-- Dashboard content -->
  <v-container
    v-else
    class="py-8"
  >
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-avatar
            v-if="user?.avatar_url"
            :image="user.avatar_url"
            size="64"
            class="me-4"
          />

          <v-avatar
            v-else
            color="primary"
            size="64"
            class="me-4"
          >
            <span class="text-h5 font-weight-bold">{{ displayName.charAt(0).toUpperCase() }}</span>
          </v-avatar>

          <div>
            <h1 class="text-h4 font-weight-bold">
              Welcome back, {{ displayName }}!
            </h1>

            <p class="text-body-1 text-medium-emphasis mt-1">
              {{ user?.email }}
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="pa-4"
          variant="outlined"
        >
          <v-card-title class="d-flex align-center gap-2">
            <v-icon
              color="primary"
              icon="mdi-book-open-variant"
            />
            My Reading List
          </v-card-title>

          <v-card-text class="text-medium-emphasis">
            Coming soon
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="pa-4"
          variant="outlined"
        >
          <v-card-title class="d-flex align-center gap-2">
            <v-icon
              color="primary"
              icon="mdi-star"
            />
            My Reviews
          </v-card-title>

          <v-card-text class="text-medium-emphasis">
            Coming soon
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="pa-4"
          variant="outlined"
        >
          <v-card-title class="d-flex align-center gap-2">
            <v-icon
              color="primary"
              icon="mdi-lightbulb"
            />
            Recommendations
          </v-card-title>

          <v-card-text class="text-medium-emphasis">
            Coming soon
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
