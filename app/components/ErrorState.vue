<script setup lang="ts">
const props = defineProps<{
  message?: string
}>()

const emit = defineEmits<{
  retry: []
}>()

const { t } = useI18n()

const displayMessage = computed(() => props.message ?? t('common.loadFailed'))
</script>

<template>
  <div class="py-12 text-center">
    <v-icon
      icon="mdi-cloud-alert-outline"
      size="64"
      color="error"
      class="mb-4"
    />

    <div class="text-h6 text-error">
      {{ displayMessage }}
    </div>

    <div class="text-secondary mb-4 mt-2">
      {{ t('common.loadFailedHint') }}
    </div>

    <v-btn
      color="primary"
      variant="tonal"
      prepend-icon="mdi-refresh"
      @click="emit('retry')"
    >
      {{ t('common.tryAgain') }}
    </v-btn>
  </div>
</template>
