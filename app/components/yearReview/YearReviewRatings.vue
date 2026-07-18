<script setup lang="ts">
interface Props {
  averageRatingGiven: number
  ratingsGiven: number
  ratingDistribution: Record<string, number>
  reviewsWritten: number
}

const props = defineProps<Props>()

const cardRef = ref<HTMLElement | null>(null)

useScrollReveal(cardRef)

const roundedAvg = computed(() => Math.floor(props.averageRatingGiven * 2) / 2)

function starCount(star: number): number {
  const full = props.ratingDistribution[`${star}.0`] ?? props.ratingDistribution[String(star)] ?? 0
  const half = star < 5
    ? (props.ratingDistribution[`${star}.5`] ?? 0)
    : 0

  return full + half
}

const totalCount = computed(() => [1, 2, 3, 4, 5].reduce((sum, s) => sum + starCount(s), 0),
)

function starPercent(star: number): number {
  const total = totalCount.value
  if (total === 0)
    return 0

  return (starCount(star) / total) * 100
}
</script>

<template>
  <v-card
    v-if="ratingsGiven > 0"
    ref="cardRef"
  >
    <v-card-text class="text-center">
      <h2 class="text-h6 font-weight-bold mb-4">
        How you rated
      </h2>

      <div class="avg-number text-primary font-weight-black">
        {{ averageRatingGiven.toFixed(1) }}
      </div>

      <v-rating
        :model-value="roundedAvg"
        readonly
        half-increments
        color="warning"
        active-color="warning"
        density="comfortable"
        class="my-1"
      />

      <div class="text-body-2 text-medium-emphasis mb-6">
        across {{ ratingsGiven.toLocaleString() }} {{ ratingsGiven === 1
          ? 'rating'
          : 'ratings' }}
      </div>

      <div class="d-flex flex-column ga-2 text-left">
        <div
          v-for="star in [
            5,
            4,
            3,
            2,
            1,
          ]"
          :key="star"
          class="d-flex align-center ga-2"
        >
          <span
            class="text-body-2 font-weight-bold text-right"
            style="min-width: 10px;"
          >{{ star }}</span>

          <v-icon
            icon="mdi-star"
            size="small"
            color="warning"
          />

          <v-progress-linear
            :model-value="starPercent(star)"
            color="primary"
            rounded
            height="10"
            class="flex-grow-1"
          />

          <span
            class="text-caption text-medium-emphasis text-right"
            style="min-width: 28px;"
          >{{ starCount(star) }}</span>
        </div>
      </div>

      <template v-if="reviewsWritten > 0">
        <v-divider class="my-4" />

        <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis justify-center">
          <v-icon
            icon="mdi-comment-text-outline"
            size="small"
          />
          {{ reviewsWritten }} written {{ reviewsWritten === 1
            ? 'review'
            : 'reviews' }}
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.avg-number {
  font-size: 4rem;
  line-height: 1;
}
</style>
