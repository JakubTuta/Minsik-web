<script setup lang="ts">
import type { Book } from '~/types/api'

interface Props {
  book?: Book
  loading?: boolean
  variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  book: undefined,
  variant: 'default',
})

const bookLink = computed(() => (props.book
  ? `/books/${props.book.slug}`
  : ''))
const coverUrl = computed(() => props.book?.cover_url || '/placeholder-book.jpg')
const title = computed(() => props.book?.title || '')

const seriesText = computed(() => {
  if (!props.book?.series)
    return null
  const position = props.book.series_position
    ? ` #${props.book.series_position}`
    : ''

  return `${props.book.series.name}${position}`
})
</script>

<template>
  <v-card
    :to="bookLink"
    :loading="loading"
    hover
    class="book-card h-100"
  >
    <template v-if="loading">
      <v-skeleton-loader type="image, article" />
    </template>

    <template v-else-if="book">
      <v-img
        :src="coverUrl"
        :alt="title"
        height="320"
        cover
        class="bg-surface-variant"
      >
        <template #placeholder>
          <div class="d-flex align-center fill-height justify-center">
            <v-progress-circular
              indeterminate
              color="primary"
            />
          </div>
        </template>
      </v-img>

      <v-card-text class="pa-4">
        <div class="text-h6 font-weight-bold line-clamp-2 mb-2">
          {{ title }}
        </div>

        <div
          v-if="book.authors.length > 0"
          class="text-body-2 mb-2"
        >
          <template
            v-for="(author, index) in book.authors"
            :key="author.slug"
          >
            <NuxtLink
              class="author-link text-secondary"
              :to="`/authors/${author.slug}`"
            >
              {{ author.name }}
            </NuxtLink>

            <span
              v-if="index < book.authors.length - 1"
              class="text-secondary"
            >, </span>
          </template>
        </div>

        <div
          v-if="seriesText"
          class="text-caption text-info mb-2"
        >
          {{ seriesText }}
        </div>

        <div
          v-if="book.rating"
          class="d-flex align-center gap-1"
        >
          <v-icon
            icon="mdi-star"
            size="small"
            color="warning"
          />

          <span class="text-body-2">{{ book.rating.toFixed(1) }}</span>

          <span
            v-if="book.rating_count"
            class="text-caption text-secondary"
          >
            ({{ book.rating_count }})
          </span>
        </div>
      </v-card-text>
    </template>
  </v-card>
</template>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3.2em;
  line-clamp: 2;
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
