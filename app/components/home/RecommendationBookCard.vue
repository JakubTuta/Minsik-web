<script setup lang="ts">
import type { RecommendationBookItem } from '~/types/recommendations'

interface Props {
  book: RecommendationBookItem
}

const props = defineProps<Props>()

const avgRating = computed(() => {
  const r = Number.parseFloat(props.book.avg_rating ?? '0')

  return Number.isNaN(r)
    ? 0
    : r
})
</script>

<template>
  <v-card
    :to="`/books/${book.slug}`"
    hover
    class="rec-book-card d-flex flex-column"
  >
    <v-img
      :src="book.primary_cover_url || '/placeholder-book.jpg'"
      lazy-src="/placeholder-book-lazy.jpg"
      :alt="book.title"
      :aspect-ratio="0.67"
      cover
      class="bg-surface-variant flex-shrink-0"
    />

    <v-card-text class="d-flex flex-column flex-grow-1 pa-3">
      <div class="text-body-2 font-weight-bold line-clamp-2 mb-1">
        {{ book.title }}
      </div>

      <div
        v-if="book.author_names.length > 0"
        class="text-caption text-medium-emphasis line-clamp-1 mb-auto"
      >
        <template
          v-for="(name, i) in book.author_names.slice(0, 2)"
          :key="book.author_slugs[i] ?? name"
        >
          <NuxtLink
            class="text-medium-emphasis text-decoration-none author-link"
            :to="`/authors/${book.author_slugs[i]}`"
            @click.stop
          >
            {{ name }}
          </NuxtLink>

          <span v-if="i < Math.min(book.author_names.length, 2) - 1">, </span>
        </template>
      </div>

      <div
        v-if="avgRating > 0"
        class="d-flex align-center ga-1 mt-2"
      >
        <v-icon
          icon="mdi-star"
          size="12"
          color="warning"
        />

        <span class="text-caption text-medium-emphasis">{{ avgRating.toFixed(1) }}</span>

        <span class="text-caption text-disabled">({{ book.rating_count.toLocaleString() }})</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.rec-book-card {}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
