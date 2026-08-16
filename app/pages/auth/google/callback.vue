<script setup lang="ts">
definePageMeta({ ssr: false })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const { t } = useI18n()

const state = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

async function handleCallback() {
  const code = route.query.code as string | undefined
  const oauthError = route.query.error as string | undefined

  if (oauthError) {
    state.value = 'error'
    errorMessage.value = oauthError === 'access_denied'
      ? t('auth.googleCancelled')
      : t('auth.googleError', { error: oauthError })

    return
  }

  if (!code) {
    state.value = 'error'
    errorMessage.value = t('auth.noAuthCode')

    return
  }

  const redirectUri = `${config.public.siteUrl}/auth/google/callback`
  const result = await authStore.googleAuth(code, redirectUri)

  if (result.success) {
    state.value = 'success'
    // Google always returns to the unprefixed callback route, so the locale
    // has to come back from the saved path (already prefixed, captured before
    // leaving) or from localePath — never a bare '/', which would strand a
    // non-default-locale reader in the default language.
    const savedRedirect = localStorage.getItem('minsik_google_redirect')
    localStorage.removeItem('minsik_google_redirect')
    await router.replace(savedRedirect || localePath('index'))
  }
  else {
    state.value = 'error'
    errorMessage.value = result.error || t('auth.googleFailed')
  }
}

onMounted(handleCallback)
</script>

<template>
  <v-container
    class="d-flex align-center justify-center"
    style="min-height: 80vh;"
  >
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
        {{ t('auth.signingIn') }}
      </p>
    </div>

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
        {{ t('auth.signInFailed') }}
      </h2>

      <p class="text-body-2 text-medium-emphasis mb-6">
        {{ errorMessage }}
      </p>

      <NuxtLinkLocale to="/">
        <v-btn
          color="primary"
          variant="elevated"
          block
        >
          {{ t('common.backToHome') }}
        </v-btn>
      </NuxtLinkLocale>
    </v-card>
  </v-container>
</template>
