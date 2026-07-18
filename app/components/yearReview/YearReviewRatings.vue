<script setup lang="ts">
interface Props {
  averageRatingGiven: number
  ratingsGiven: number
  ratingDistribution: Record<string, number>
  reviewsWritten: number
}

defineProps<Props>()
</script>

<template>
  <v-card v-if="ratingsGiven > 0">
    <v-card-text>
      <h2 class="text-h6 font-weight-bold mb-4">
        Ratings this year
      </h2>

      <RatingDistributionCard
        :avg-rating="averageRatingGiven"
        :rating-count="ratingsGiven"
        :distribution="ratingDistribution"
      />

      <v-divider
        v-if="reviewsWritten > 0"
        class="my-4"
      />

      <div
        v-if="reviewsWritten > 0"
        class="d-flex align-center ga-2 text-body-2 text-medium-emphasis"
      >
        <v-icon
          icon="mdi-comment-text-outline"
          size="small"
        />
        {{ reviewsWritten }} written {{ reviewsWritten === 1
          ? 'review'
          : 'reviews' }}
      </div>
    </v-card-text>
  </v-card>
</template>
