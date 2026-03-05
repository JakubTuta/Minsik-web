<script setup lang="ts">
import { usernameRequirements, usernameRules } from '~/utils/validation'

const authDialogStore = useAuthDialogStore()
const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const formRef = ref()
const email = ref('')
const password = ref('')
const username = ref('')
const loading = ref(false)
const error = ref('')
const isFormValid = ref(false)
const usernameFocused = ref(false)

const isLoginMode = computed(() => authDialogStore.mode === 'login')
const title = computed(() => (isLoginMode.value
  ? 'Login'
  : 'Create Account'))

const isUsernameValid = computed(() => username.value && usernameRules.every((rule: (v: string) => boolean | string) => rule(username.value) === true))
const isUsernameInvalid = computed(() => username.value && usernameRules.some((rule: (v: string) => boolean | string) => rule(username.value) !== true))

function resetForm() {
  email.value = ''
  password.value = ''
  username.value = ''
  error.value = ''
  isFormValid.value = false
  usernameFocused.value = false
  formRef.value?.reset()
}

function switchMode() {
  resetForm()
  authDialogStore.switchMode()
}

function closeDialog() {
  authDialogStore.close()
  resetForm()
}

async function handleSuccess() {
  const redirect = authDialogStore.redirectTo
  closeDialog()
  if (redirect) {
    await router.push(redirect)
  }
}

async function handleSubmit() {
  if (!isFormValid.value)
    return

  error.value = ''
  loading.value = true

  try {
    const result = isLoginMode.value
      ? await authStore.login({ email: email.value, password: password.value })
      : await authStore.register({ username: username.value, email: email.value, password: password.value })

    if (result.success) {
      await handleSuccess()
    }
    else {
      const action = isLoginMode.value
        ? 'Login'
        : 'Registration'
      error.value = result.error || `${action} failed. Please try again.`
    }
  }
  finally {
    loading.value = false
  }
}

function signInWithGoogle() {
  if (!config.public.googleClientId) {
    error.value = 'Google sign-in is not configured.'

    return
  }

  if (authDialogStore.redirectTo) {
    localStorage.setItem('minsik_google_redirect', authDialogStore.redirectTo)
  }

  const redirectUri = `${config.public.siteUrl}/auth/google/callback`
  const params = new URLSearchParams({
    client_id: config.public.googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  })

  authDialogStore.close()
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
</script>

<template>
  <v-dialog
    :model-value="authDialogStore.show"
    max-width="440"
    persistent
    @update:model-value="closeDialog"
  >
    <v-card
      rounded="xl"
      class="pa-2"
    >
      <v-btn
        icon
        variant="text"
        size="small"
        class="position-absolute right-2 top-2"
        @click="closeDialog"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-card-title class="d-flex align-center flex-column gap-2 pb-2 pt-6">
        <v-icon
          icon="mdi-snowflake"
          size="36"
          color="primary"
        />

        <span class="text-h5 font-weight-bold">{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <v-form
          ref="formRef"
          v-model="isFormValid"
          @submit.prevent="handleSubmit"
        >
          <!-- Register only: Username -->
          <v-text-field
            v-if="!isLoginMode"
            v-model="username"
            label="Username"
            type="text"
            variant="outlined"
            class="mb-2"
            :disabled="loading"
            :rules="usernameRules"
            :color="isUsernameValid
              ? 'success'
              : isUsernameInvalid
                ? 'error'
                : undefined"
            validate-on="input"
            @focus="usernameFocused = true"
            @blur="usernameFocused = false"
          >
            <template #append-inner>
              <v-icon
                v-if="isUsernameValid"
                color="success"
              >
                mdi-check-circle
              </v-icon>

              <v-icon
                v-else-if="isUsernameInvalid"
                color="error"
              >
                mdi-close-circle
              </v-icon>
            </template>
          </v-text-field>

          <v-expand-transition>
            <div
              v-if="!isLoginMode && usernameFocused && username"
              class="mb-4"
            >
              <v-card
                variant="outlined"
                class="pa-3"
              >
                <div class="font-weight-medium mb-2">
                  Username requirements:
                </div>

                <div
                  v-for="(req, index) in usernameRequirements"
                  :key="index"
                  class="d-flex align-center mb-1"
                >
                  <v-icon
                    :color="req.test(username)
                      ? 'success'
                      : 'error'"
                    size="small"
                    class="me-2"
                  >
                    {{ req.test(username)
                      ? 'mdi-check'
                      : 'mdi-close' }}
                  </v-icon>

                  <span
                    :class="req.test(username)
                      ? 'text-success'
                      : 'text-error'"
                  >
                    {{ req.text }}
                  </span>
                </div>
              </v-card>
            </div>
          </v-expand-transition>

          <AuthEmailField
            v-model="email"
            :disabled="loading"
          />

          <AuthPasswordField
            v-model="password"
            :disabled="loading"
          />

          <v-btn
            type="submit"
            block
            color="primary"
            size="large"
            variant="elevated"
            :loading="loading"
            :disabled="!isFormValid"
          >
            {{ isLoginMode
              ? 'Login'
              : 'Create Account' }}
          </v-btn>

          <v-alert
            v-if="error"
            type="error"
            class="mt-4"
            density="compact"
          >
            {{ error }}
          </v-alert>

          <div class="d-flex mt-4 justify-center">
            <template v-if="isLoginMode">
              <span class="text-body-2 text-medium-emphasis me-1">Don't have an account?</span>

              <span
                class="text-body-2 text-primary font-weight-medium cursor-pointer"
                @click="switchMode"
              >Sign up</span>
            </template>

            <template v-else>
              <span class="text-body-2 text-medium-emphasis me-1">Already have an account?</span>

              <span
                class="text-body-2 text-primary font-weight-medium cursor-pointer"
                @click="switchMode"
              >Sign in</span>
            </template>
          </div>

          <!-- Google Auth Divider -->
          <div class="d-flex align-center my-4 gap-3">
            <v-divider />

            <span class="text-medium-emphasis text-no-wrap">or continue with</span>

            <v-divider />
          </div>

          <v-btn
            block
            variant="outlined"
            size="large"
            :disabled="loading"
            @click="signInWithGoogle"
          >
            <template #prepend>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                class="me-1"
              >
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                />

                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                />

                <path
                  fill="#FBBC05"
                  d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                />

                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
            </template>

            Sign in with Google
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
