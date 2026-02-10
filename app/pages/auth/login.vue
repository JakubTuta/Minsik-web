<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Login',
  robots: 'noindex, nofollow',
})

const authStore = useAuthStore()

const formRef = ref()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isFormValid = ref(false)

async function handleLogin() {
  if (!isFormValid.value)
    return

  error.value = ''
  loading.value = true

  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value,
    })

    if (!result.success)
      error.value = result.error || 'Login failed. Please try again.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard title="Login">
    <v-form
      ref="formRef"
      v-model="isFormValid"
      @submit.prevent="handleLogin"
    >
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
        Login
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
        <span class="text-body-2 text-medium-emphasis me-1">Don't have an account?</span>

        <NuxtLink
          to="/auth/register"
          class="text-body-2 text-primary font-weight-medium"
          style="text-decoration: none;"
        >
          Sign up
        </NuxtLink>
      </div>
    </v-form>
  </AuthCard>
</template>
