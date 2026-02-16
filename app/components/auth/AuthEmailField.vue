<script setup lang="ts">
import { emailRules } from '~/utils/validation'

defineProps<{
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })

const isValid = computed(() => model.value && emailRules.every(rule => rule(model.value) === true))
const isInvalid = computed(() => model.value && emailRules.some(rule => rule(model.value) !== true))
</script>

<template>
  <v-text-field
    v-model="model"
    label="Email"
    type="email"
    variant="outlined"
    class="mb-2"
    :disabled="disabled"
    :rules="emailRules"
    :color="isValid
      ? 'success'
      : isInvalid
        ? 'error'
        : undefined"
    validate-on="input"
  >
    <template #append-inner>
      <v-icon
        v-if="isValid"
        color="success"
      >
        mdi-check-circle
      </v-icon>

      <v-icon
        v-else-if="isInvalid"
        color="error"
      >
        mdi-close-circle
      </v-icon>
    </template>
  </v-text-field>
</template>
