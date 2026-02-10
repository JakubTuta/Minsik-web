<script setup lang="ts">
import { usernameRequirements, usernameRules } from '~/utils/validation'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Register',
  robots: 'noindex, nofollow',
})

const authStore = useAuthStore()

const formRef = ref()
const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isFormValid = ref(false)
const usernameFocused = ref(false)

const isUsernameValid = computed(() => username.value && usernameRules.every((rule: (v: string) => boolean | string) => rule(username.value) === true))
const isUsernameInvalid = computed(() => username.value && usernameRules.some((rule: (v: string) => boolean | string) => rule(username.value) !== true))

async function handleRegister() {
  if (!isFormValid.value)
    return

  error.value = ''
  loading.value = true

  try {
    const result = await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    })

    if (!result.success)
      error.value = result.error || 'Registration failed. Please try again.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard title="Create Account">
    <v-form
      ref="formRef"
      v-model="isFormValid"
      @submit.prevent="handleRegister"
    >
      <v-text-field
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
          v-if="usernameFocused && username"
          class="mb-4"
        >
          <v-card
            variant="outlined"
            class="pa-3"
          >
            <div class="text-caption font-weight-medium mb-2">
              Username requirements:
            </div>

            <div
              v-for="(req, index) in usernameRequirements"
              :key="index"
              class="d-flex align-center text-caption mb-1"
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
        Create Account
      </v-btn>

      <v-alert
        v-if="error"
        type="error"
        class="mb-4"
        density="compact"
      >
        {{ error }}
      </v-alert>

      <div class="d-flex mt-4 justify-center">
        <span class="text-body-2 text-medium-emphasis me-1">Already have an account?</span>

        <NuxtLink
          to="/auth/login"
          class="text-body-2 text-primary font-weight-medium"
          style="text-decoration: none;"
        >
          Sign in
        </NuxtLink>
      </div>
    </v-form>
  </AuthCard>
</template>
