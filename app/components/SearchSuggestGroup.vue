<script setup lang="ts">
import type { SuggestItem } from '~/types/api'
import { totalRatingCount, weightedRating } from '~/utils/format'

interface Props {
  title: string
  results: SuggestItem[]
  activeId?: string | null
  optionId: (result: SuggestItem) => string
  pathFor: (result: SuggestItem) => string
}

defineProps<Props>()

defineEmits<{
  select: []
}>()

const { locale } = useI18n()

const compactFormat = computed(() => new Intl.NumberFormat(locale.value, { notation: 'compact', maximumFractionDigits: 1 }))

function ratingLabel(result: SuggestItem): string | null {
  const count = totalRatingCount(result.app_rating_count, result.ol_rating_count)
  if (count <= 0)
    return null

  const average = weightedRating(result.app_avg_rating, result.app_rating_count, result.ol_avg_rating, result.ol_rating_count)

  return `${average.toFixed(1)} (${compactFormat.value.format(count)})`
}

function readersLabel(result: SuggestItem): string | null {
  return result.readers > 0
    ? compactFormat.value.format(result.readers)
    : null
}
</script>

<template>
  <div class="pa-3">
    <div class="text-secondary font-weight-bold mb-2">
      {{ title }}
    </div>

    <v-list
      density="comfortable"
      class="scrollable-list pa-0"
      role="presentation"
    >
      <v-list-item
        v-for="result in results"
        :id="optionId(result)"
        :key="result.id"
        :title="result.title"
        :to="pathFor(result)"
        :active="activeId === optionId(result)"
        role="option"
        :aria-selected="activeId === optionId(result)"
        class="mb-1 rounded"
        @click="$emit('select')"
      >
        <template #prepend>
          <v-avatar
            v-if="result.type === 'book'"
            size="40"
            rounded="lg"
          >
            <BookCover
              :title="result.title"
              :src="result.cover_url"
              :width="40"
              :height="60"
              fit="cover"
            />
          </v-avatar>

          <v-avatar
            v-else-if="result.type === 'author'"
            size="40"
          >
            <AuthorPhoto
              :name="result.title"
              :src="result.cover_url"
              :size="40"
            />
          </v-avatar>

          <v-icon
            v-else
            icon="mdi-book-multiple"
          />
        </template>

        <template #subtitle>
          <span class="d-inline-flex align-center flex-wrap">
            <span v-if="result.authors?.length">{{ result.authors.join(', ') }}</span>

            <template v-if="ratingLabel(result)">
              <v-icon
                v-if="result.authors?.length"
                icon="mdi-circle-small"
                color="secondary"
                size="small"
              />

              <span class="d-inline-flex align-center">
                <v-icon
                  icon="mdi-star"
                  color="amber"
                  size="x-small"
                  class="mr-1"
                />
                {{ ratingLabel(result) }}
              </span>
            </template>

            <template v-if="readersLabel(result)">
              <v-icon
                v-if="result.authors?.length || ratingLabel(result)"
                icon="mdi-circle-small"
                color="secondary"
                size="small"
              />

              <span class="d-inline-flex align-center">
                <v-icon
                  icon="mdi-account-multiple"
                  color="info"
                  size="x-small"
                  class="mr-1"
                />
                {{ readersLabel(result) }}
              </span>
            </template>
          </span>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped>
.scrollable-list {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 599px) {
  .scrollable-list {
    max-height: none;
    overflow-y: visible;
  }
}
</style>
