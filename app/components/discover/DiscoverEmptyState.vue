<script setup lang="ts">
const emit = defineEmits<{ 'reset-filters': [] }>()
const { t } = useI18n()
</script>

<template>
  <v-card
    class="mx-auto pa-8 text-center"
    max-width="500"
    elevation="2"
  >
    <v-icon
      size="80"
      color="warning"
      class="mb-4"
    >
      mdi-book-off-outline
    </v-icon>

    <h3 class="text-h5 font-weight-bold mb-3">
      {{ t('discover.noMatchingBooks') }}
    </h3>

    <p class="text-body-1 text-medium-emphasis mb-6">
      {{ t('discover.noMatchingBooksHint') }}
    </p>

    <v-btn
      color="primary"
      variant="elevated"
      prepend-icon="mdi-filter-remove"
      @click="emit('reset-filters')"
    >
      {{ t('discover.resetFilters') }}
    </v-btn>
  </v-card>
</template>
