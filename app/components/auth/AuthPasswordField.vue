<script setup lang="ts">
import { passwordRequirements, passwordRules } from '~/utils/validation'

defineProps<{
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })

const showPassword = ref(false)
const passwordFocused = ref(false)

const isValid = computed(() => model.value && passwordRules.every(rule => rule(model.value) === true))
const isInvalid = computed(() => model.value && passwordRules.some(rule => rule(model.value) !== true))
</script>

<template>
  <v-text-field
    v-model="model"
    label="Password"
    :type="showPassword
      ? 'text'
      : 'password'"
    variant="outlined"
    class="mb-2"
    :disabled="disabled"
    :rules="passwordRules"
    :color="isValid
      ? 'success'
      : isInvalid
        ? 'error'
        : undefined"
    validate-on="input"
    @focus="passwordFocused = true"
    @blur="passwordFocused = false"
  >
    <template #append-inner>
      <v-icon
        v-if="isValid"
        color="success"
        class="me-2"
      >
        mdi-check-circle
      </v-icon>

      <v-icon
        v-else-if="isInvalid"
        color="error"
        class="me-2"
      >
        mdi-close-circle
      </v-icon>

      <v-icon
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      >
        {{ showPassword
          ? 'mdi-eye-off'
          : 'mdi-eye' }}
      </v-icon>
    </template>
  </v-text-field>

  <v-expand-transition>
    <div
      v-if="passwordFocused && model"
      class="mb-4"
    >
      <v-card
        variant="outlined"
        class="pa-3"
      >
        <div class="font-weight-medium mb-2">
          Password requirements:
        </div>

        <div
          v-for="(req, index) in passwordRequirements"
          :key="index"
          class="d-flex align-center mb-1"
        >
          <v-icon
            :color="req.test(model)
              ? 'success'
              : 'error'"
            size="small"
            class="me-2"
          >
            {{ req.test(model)
              ? 'mdi-check'
              : 'mdi-close' }}
          </v-icon>

          <span
            :class="req.test(model)
              ? 'text-success'
              : 'text-error'"
          >
            {{ req.text }}
          </span>
        </div>
      </v-card>
    </div>
  </v-expand-transition>
</template>
