<script setup lang="ts">
import { useDisplay } from 'vuetify'

const props = withDefaults(defineProps<Props>(), { size: 'default' })

const { mobile } = useDisplay()

interface Props {
  rating: number
  ratingCount: number
  size?: 'default' | 'small'
}

// Round rating down to nearest 0.5
const roundedRating = computed(() => Math.floor(props.rating * 2) / 2)

const isSmall = computed(() => props.size === 'small')
</script>

<template>
  <div class="d-flex align-center gap-2">
    <v-rating
      :model-value="roundedRating"
      readonly
      half-increments
      color="warning"
      active-color="warning"
      :size="isSmall
        ? 'small'
        : 'x-large'"
      density="compact"
    />

    <span
      :class="isSmall
        ? 'text-body-1 font-weight-bold text-primary'
        : 'text-h4 font-weight-bold text-primary'"
    >
      {{ rating.toFixed(1) }}
    </span>

    <span
      :class="isSmall
        ? 'text-caption text-secondary'
        : 'text-body-1 text-secondary'"
    >
      ({{ ratingCount.toLocaleString() }}{{ mobile
        ? ''
        : ' ratings' }})
    </span>
  </div>
</template>
