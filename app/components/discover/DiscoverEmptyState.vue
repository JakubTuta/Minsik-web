<script setup lang="ts">
const emit = defineEmits<{ 'reset-filters': [] }>()
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
      No Matching Books
    </h3>

    <p class="text-body-1 text-medium-emphasis mb-6">
      We couldn't find any books matching your filters. Try adjusting your criteria to discover more books.
    </p>

    <v-btn
      color="primary"
      variant="elevated"
      prepend-icon="mdi-filter-remove"
      @click="emit('reset-filters')"
    >
      Reset Filters
    </v-btn>
  </v-card>
</template>
