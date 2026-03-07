<script setup lang="ts">
import type { RecommendationBookItem } from '~/types/recommendations'

interface Props {
  book: RecommendationBookItem
  eager?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  eager: false,
})
</script>

<template>
  <v-card class="rec-book-card d-flex flex-column">
    <!-- Cover zone: 80% -->
    <div class="cover-zone bg-surface-variant">
      <v-img
        :src="book.primary_cover_url || '/placeholder-book-lazy.jpg'"
        :alt="book.title"
        :eager="eager"
        class="h-100"
      />
    </div>

    <!-- Info zone: 20% -->
    <div class="info-zone px-3 pb-1 pt-2">
      <NuxtLink
        :to="`/books/${book.slug}`"
        class="text-body-2 font-weight-bold text-decoration-none book-title-link line-clamp-2"
      >
        {{ book.title }}
      </NuxtLink>

      <div
        v-if="book.author_names.length > 0"
        class="text-medium-emphasis line-clamp-1 mt-1"
      >
        <template
          v-for="(name, i) in book.author_names.slice(0, 2)"
          :key="book.author_slugs[i] ?? name"
        >
          <NuxtLink
            class="text-medium-emphasis text-decoration-none author-link"
            :to="`/authors/${book.author_slugs[i]}`"
          >
            {{ name }}
          </NuxtLink>

          <span v-if="i < Math.min(book.author_names.length, 2) - 1">, </span>
        </template>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.rec-book-card {
  height: 380px;
}

.cover-zone {
  height: 75%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-zone :deep(.v-img__img) {
  object-fit: contain !important;
}

.info-zone {
  height: 25%;
  overflow: hidden;
}

.book-title-link {
  color: inherit;
  display: block;
}

.book-title-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

.author-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

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
</style>
