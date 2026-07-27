<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()
const { t } = useI18n()
const { emailRules } = useValidationRules()

const model = defineModel<string>({ default: '' })

const isValid = computed(() => model.value && emailRules.value.every(rule => rule(model.value) === true))
const isInvalid = computed(() => model.value && emailRules.value.some(rule => rule(model.value) !== true))
</script>

<template>
  <v-text-field
    v-model="model"
    :label="t('auth.email')"
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
