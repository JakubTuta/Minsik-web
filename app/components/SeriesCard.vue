<script setup lang="ts">
import type { Series } from '~/types/api'

interface Props {
  series?: Series
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  series: undefined,
  loading: false,
})

const seriesLink = computed(() => (props.series
  ? `/series/${props.series.slug}`
  : ''))
const name = computed(() => props.series?.name || '')
const description = computed(() => {
  if (!props.series?.description)
    return ''

  return props.series.description.length > 120
    ? `${props.series.description.substring(0, 120)}...`
    : props.series.description
})
</script>

<template>
  <v-card
    :to="seriesLink"
    :loading="loading"
    hover
    class="series-card d-flex flex-column h-100"
  >
    <template v-if="loading">
      <v-skeleton-loader type="article" />
    </template>

    <template v-else-if="series">
      <v-card-text class="d-flex flex-column flex-grow-1 pa-4">
        <div class="d-flex justify-space-between mb-3 gap-3 align-start">
          <div class="flex-1-1">
            <div class="text-h6 font-weight-bold line-clamp-2 mb-2">
              {{ name }}
            </div>

            <div
              v-if="series.author"
              class="text-body-2"
            >
              <span class="text-secondary">by </span>

              <NuxtLink
                class="author-link text-secondary"
                :to="`/authors/${series.author.slug}`"
              >
                {{ series.author.name }}
              </NuxtLink>
            </div>
          </div>

          <v-chip
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ series.book_count }} {{ series.book_count === 1
              ? 'book'
              : 'books' }}
          </v-chip>
        </div>

        <div
          v-if="description"
          class="text-body-2 text-secondary line-clamp-4 mt-auto"
        >
          {{ description }}
        </div>
      </v-card-text>
    </template>
  </v-card>
</template>

<style scoped>
.series-card {
  min-height: 240px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author-link {
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.author-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
  text-decoration: underline;
}
</style>
