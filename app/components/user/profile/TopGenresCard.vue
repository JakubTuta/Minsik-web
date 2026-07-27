<script setup lang="ts">
import type { TopGenre } from '~/types/user'

defineProps<{
  genres: TopGenre[]
}>()

const { t } = useI18n()
</script>

<template>
  <v-card
    variant="elevated"
    class="mb-6"
  >
    <v-card-title class="text-h6 font-weight-bold">
      {{ t('profile.topGenres') }}
    </v-card-title>

    <v-card-text class="pt-2">
      <div
        v-if="genres.length"
        class="d-flex flex-column gap-4"
      >
        <div
          v-for="genre in genres"
          :key="genre.slug"
        >
          <div class="d-flex justify-space-between text-body-1 mb-2">
            <span class="font-weight-medium">{{ genre.name }}</span>
            <span class="text-medium-emphasis">{{ genre.percent }}%</span>
          </div>

          <v-progress-linear
            :model-value="genre.percent"
            color="primary"
            bg-color="surface-variant"
            rounded
            height="8"
          />
        </div>
      </div>

      <div
        v-else
        class="text-body-2 text-medium-emphasis"
      >
        {{ t('profile.noGenreData') }}
      </div>
    </v-card-text>
  </v-card>
</template>
