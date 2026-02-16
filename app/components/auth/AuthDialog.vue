<script setup lang="ts">
import { usernameRequirements, usernameRules } from '~/utils/validation'

const authDialogStore = useAuthDialogStore()
const authStore = useAuthStore()
const router = useRouter()

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
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
