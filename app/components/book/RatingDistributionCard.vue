<script setup lang="ts">
interface Props {
  avgRating: number
  ratingCount: number
  distribution: Record<string, number>
  clickable?: boolean
  selectedStar?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedStar: null,
})

const emit = defineEmits<{
  'update:selectedStar': [value: number | null]
}>()

const { t, n } = useI18n()

const roundedAvg = computed(() => Math.floor(props.avgRating * 2) / 2)

function distributionCount(star: number): number {
  const full = props.distribution[`${star}.0`] ?? props.distribution[String(star)] ?? 0
  const half = star < 5
    ? (props.distribution[`${star}.5`] ?? 0)
    : 0

  return full + half
}

const totalCount = computed(() => [1, 2, 3, 4, 5].reduce((sum, s) => sum + distributionCount(s), 0),
)

function distributionPercent(star: number): number {
  const total = totalCount.value
  if (total === 0)
    return 0

  return (distributionCount(star) / total) * 100
}

function handleStarClick(star: number) {
  if (!props.clickable)
    return
  emit('update:selectedStar', props.selectedStar === star
    ? null
    : star)
}
</script>

<template>
  <v-row align="center">
    <v-col
      cols="12"
      sm="4"
      class="d-flex flex-column align-center text-center"
    >
      <div class="text-h2 font-weight-bold text-primary">
        {{ avgRating.toFixed(1) }}
      </div>

      <v-rating
        :model-value="roundedAvg"
        readonly
        half-increments
        color="warning"
        active-color="warning"
        density="compact"
      />

      <div class="text-body-2 text-secondary mt-1">
        {{ t('rating.withCount', {'count': n(ratingCount)}) }}
      </div>
    </v-col>

    <v-col
      cols="12"
      sm="8"
    >
      <div
        v-for="star in [
          5,
          4,
          3,
          2,
          1,
        ]"
        :key="star"
        class="d-flex align-center rounded-pill distribution-row mb-2 gap-2 px-3 py-1"
        :class="{
          'distribution-row--selected': clickable && selectedStar === star,
          'distribution-row--muted': clickable && selectedStar !== null && selectedStar !== star,
          'cursor-pointer': clickable,
        }"
        @click="handleStarClick(star)"
      >
        <span
          class="text-body-2 font-weight-bold"
          style="min-width: 10px; text-align: right;"
        >{{ star }}</span>

        <v-icon
          icon="mdi-star"
          size="small"
          color="warning"
        />

        <v-progress-linear
          :model-value="distributionPercent(star)"
          color="primary"
          rounded
          height="10"
          class="flex-1"
        />

        <span
          class="text-body-2"
          style="min-width: 40px; text-align: right;"
        >{{ n(distributionCount(star)) }}</span>

        <span
          class="text-caption text-secondary"
          style="min-width: 36px; text-align: right;"
        >{{ distributionPercent(star).toFixed(0) }}%</span>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
.distribution-row {
  transition: opacity 0.15s ease, background-color 0.15s ease;
}

/* Picking a score filters the comments below, so the chosen row is lit and the
   rest recede — the bars alone gave no sign of which filter was active. */
.distribution-row--selected {
  background: rgba(var(--v-theme-primary), 0.16);
  outline: 1px solid rgba(var(--v-theme-primary), 0.5);
}

.distribution-row--muted {
  opacity: 0.4;
}

.distribution-row--muted:hover {
  opacity: 0.7;
}
</style>
