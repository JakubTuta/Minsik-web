<script setup lang="ts">
import type { RatingEntry } from '~/types/user'

const props = defineProps<{
  entry: RatingEntry
}>()

const subRatingConfig = [
  { key: 'pacing', label: 'Pacing', color: 'blue' },
  { key: 'emotional_impact', label: 'Emotional', color: 'red' },
  { key: 'intellectual_depth', label: 'Intellectual', color: 'purple' },
  { key: 'writing_quality', label: 'Writing', color: 'teal' },
  { key: 'rereadability', label: 'Rereadability', color: 'amber' },
  { key: 'readability', label: 'Readability', color: 'green' },
  { key: 'plot_complexity', label: 'Complexity', color: 'orange' },
  { key: 'humor', label: 'Humor', color: 'pink' },
]

const subRatings = computed(() => {
  return subRatingConfig
    .map(config => ({
      ...config,
      value: props.entry[config.key as keyof RatingEntry] as number | null | undefined,
    }))
    .filter(r => r.value != null)
})
</script>

<template>
  <BookUserItemBase
    :slug="entry.book_slug"
    :title="entry.book_title"
    :cover-url="entry.book_cover_url"
    :author-names="entry.book_author_names"
    :author-slugs="entry.book_author_slugs"
    :series-name="entry.book_series_name"
    :series-slug="entry.book_series_slug"
  >
    <template #topRight>
      <div class="d-flex align-center flex-shrink-0 gap-1">
        <v-icon
          icon="mdi-star"
          color="amber"
          size="18"
        />

        <span class="text-body-1 font-weight-bold text-primary">
          {{ entry.overall_rating.toFixed(1) }}
        </span>
      </div>
    </template>

    <template #middle>
      <div
        v-if="subRatings.length > 0"
        class="d-flex mt-2 flex-wrap gap-2"
      >
        <v-chip
          v-for="sub in subRatings"
          :key="sub.label"
          :color="sub.color"
          size="small"
          variant="tonal"
        >
          {{ sub.label }}: {{ sub.value!.toFixed(1) }}
        </v-chip>
      </div>
    </template>
  </BookUserItemBase>
</template>
