<script setup lang="ts">
import type { RatingEntry } from '~/types/user'

const props = defineProps<{
  entry: RatingEntry
}>()

const authors = computed(() => props.entry.book.authors.map(a => a.name).join(', '))
const ratedDate = computed(() => new Date(props.entry.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }))

const subRatings = computed(() => {
  const labels: Record<string, string> = {
    pacing: 'Pacing',
    emotional_impact: 'Emotional',
    intellectual_depth: 'Intellectual',
    writing_quality: 'Writing',
    rereadability: 'Rereadability',
  }

  return Object.entries(labels)
    .map(([key, label]) => ({ label, value: props.entry[key as keyof RatingEntry] as number | null | undefined }))
    .filter(r => r.value != null)
})
</script>

<template>
  <NuxtLink
    :to="`/books/${entry.book.slug}`"
    class="text-decoration-none"
  >
    <v-card
      variant="outlined"
      class="d-flex flex-row gap-3 pa-3"
      hover
    >
      <v-img
        :src="entry.book.primary_cover_url || undefined"
        lazy-src="/placeholder-book-lazy.jpg"
        :alt="entry.book.title"
        width="60"
        height="90"
        cover
        rounded="sm"
        class="flex-shrink-0"
      />

      <div class="min-w-0 flex-grow-1">
        <div class="d-flex justify-space-between flex-wrap gap-2 align-start">
          <div class="min-w-0">
            <div class="text-body-1 font-weight-medium text-truncate">
              {{ entry.book.title }}
            </div>

            <div class="text-caption text-medium-emphasis text-truncate">
              {{ authors }}
            </div>
          </div>

          <div class="d-flex align-center flex-shrink-0 gap-1">
            <v-icon
              icon="mdi-star"
              color="amber"
              size="18"
            />

            <span class="text-body-2 font-weight-bold">{{ entry.overall_rating.toFixed(1) }}</span>
          </div>
        </div>

        <!-- Sub-ratings -->
        <div
          v-if="subRatings.length > 0"
          class="d-flex mt-2 flex-wrap gap-1"
        >
          <v-chip
            v-for="sub in subRatings"
            :key="sub.label"
            size="x-small"
            variant="tonal"
            color="primary"
          >
            {{ sub.label }}: {{ sub.value!.toFixed(1) }}
          </v-chip>
        </div>

        <!-- Review text -->
        <div
          v-if="entry.review_text"
          class="text-body-2 text-medium-emphasis mt-2"
          style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;"
        >
          {{ entry.review_text }}
        </div>

        <div class="text-caption text-disabled mt-2">
          Rated {{ ratedDate }}
        </div>
      </div>
    </v-card>
  </NuxtLink>
</template>
