<script setup lang="ts">
import { useDisplay } from 'vuetify'

interface Props {
  rating: number
  ratingCount: number
  size?: 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), { size: 'default' })

const { t, n } = useI18n()
const { mobile } = useDisplay()

const roundedRating = computed(() => Math.floor(props.rating * 2) / 2)

const isSmall = computed(() => props.size === 'small')
</script>

<template>
  <div
    class="d-flex gap-2"
    style="align-items: center;"
  >
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
      style="display: inline-flex; align-items: center;"
    />

    <span
      :class="isSmall
        ? 'text-body-1 font-weight-bold text-primary'
        : 'text-h4 font-weight-bold text-primary'"
      style="line-height: 1;"
    >
      {{ rating.toFixed(1) }}
    </span>

    <span
      :class="isSmall
        ? 'text-secondary'
        : 'text-body-1 text-secondary'"
      style="line-height: 1;"
    >
      {{ mobile
        ? `(${n(ratingCount)})`
        : t('common.ratingsCount', {'count': n(ratingCount)}) }}
    </span>
  </div>
</template>
