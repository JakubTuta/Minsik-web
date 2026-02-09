<script setup lang="ts">
interface Props {
  rating: number
  ratingCount: number
}

const props = defineProps<Props>()

// Round rating down to nearest 0.5
const roundedRating = computed(() => Math.floor(props.rating * 2) / 2)
</script>

<template>
  <div class="d-flex align-center gap-2">
    <v-rating
      :model-value="roundedRating"
      readonly
      half-increments
      color="warning"
      active-color="warning"
      size="x-large"
      density="compact"
    />

    <span class="text-h4 font-weight-bold text-primary">
      {{ rating.toFixed(1) }}
    </span>

    <span class="text-body-1 text-secondary">
      ({{ ratingCount.toLocaleString() }} ratings)
    </span>
  </div>
</template>
