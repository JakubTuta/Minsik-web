<script setup lang="ts">
definePageMeta({ ssr: false })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const state = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

async function handleCallback() {
  const code = route.query.code as string | undefined
  const oauthError = route.query.error as string | undefined

  if (oauthError) {
    state.value = 'error'
    errorMessage.value = oauthError === 'access_denied'
      ? 'You cancelled the Google sign-in. You can try again any time.'
      : `Google sign-in error: ${oauthError}`

    return
  }

  if (!code) {
    state.value = 'error'
    errorMessage.value = 'No authorisation code received. Please try again.'

    return
  }

  const redirectUri = `${config.public.siteUrl}/auth/google/callback`
  const result = await authStore.googleAuth(code, redirectUri)

  if (result.success) {
    state.value = 'success'
    const savedRedirect = localStorage.getItem('minsik_google_redirect')
    localStorage.removeItem('minsik_google_redirect')
    await router.replace(savedRedirect || '/')
  }
  else {
    state.value = 'error'
    errorMessage.value = result.error || 'Google sign-in failed. Please try again.'
  }
}

onMounted(handleCallback)
</script>

<template>
  <v-container
    class="d-flex align-center justify-center"
    style="min-height: 80vh;"
  >
    <!-- Loading -->
    <div
      v-if="state === 'loading'"
      class="d-flex flex-column align-center gap-6"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      />

      <p class="text-h6 text-medium-emphasis">
        Signing you in…
      </p>
    </div>

    <!-- Error -->
    <v-card
      v-else-if="state === 'error'"
      max-width="440"
      class="pa-6 text-center"
      rounded="xl"
    >
      <v-icon
        icon="mdi-alert-circle-outline"
        color="error"
        size="56"
        class="mb-4"
      />

      <h2 class="text-h5 font-weight-bold mb-2">
        Sign-in failed
      </h2>

      <p class="text-body-2 text-medium-emphasis mb-6">
        {{ errorMessage }}
      </p>

      <NuxtLink to="/">
        <v-btn
          color="primary"
          variant="elevated"
          block
        >
          Back to home
        </v-btn>
      </NuxtLink>
    </v-card>
  </v-container>
</template>
