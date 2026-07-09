<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
}>(), {
  message: 'Something went wrong loading this.',
})

const emit = defineEmits<{
  retry: []
}>()
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
      {{ message }}
    </div>

    <div class="text-secondary mb-4 mt-2">
      Your data is safe — this is just a loading problem.
    </div>

    <v-btn
      color="primary"
      variant="tonal"
      prepend-icon="mdi-refresh"
      @click="emit('retry')"
    >
      Try again
    </v-btn>
  </div>
</template>
