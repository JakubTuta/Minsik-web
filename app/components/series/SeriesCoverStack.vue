<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { coverColor } from '~/utils/coverColor'

interface Props {
  books: BookSummary[]
}

const props = defineProps<Props>()

/**
 * Three covers fanned out rather than a flat grid: a series is a stack of books
 * and the shape should say so before the reader has read a word of it.
 */
const fanned = computed(() => [...props.books]
  .sort((a, b) => (a.series_position ?? 0) - (b.series_position ?? 0))
  .slice(0, 3)
  .map((book, index) => ({
    book,
    style: {
      left: `${index * 22}%`,
      top: `${index * 8}%`,
      zIndex: String(3 - index),
      transform: `rotate(${(index - 1) * 2.5}deg)`,
    },
  })))
</script>

<template>
  <div
    v-if="fanned.length > 0"
    class="cover-stack"
  >
    <NuxtLinkLocale
      v-for="entry in fanned"
      :key="entry.book.book_id"
      :to="`/books/${entry.book.slug}`"
      class="cover-stack-item"
      :style="entry.style"
      :title="entry.book.title"
    >
      <BookCover
        :title="entry.book.title"
        :src="entry.book.primary_cover_url"
        :author-names="(entry.book.authors ?? []).map(a => a.name)"
        :width="200"
        :height="300"
        fit="cover"
        :fallback-color="coverColor(entry.book)"
        priority
      />
    </NuxtLinkLocale>
  </div>
</template>

<style scoped>
.cover-stack {
  position: relative;
  width: 100%;
  /* Three covers offset by 22% and 8% of the box, at a 2:3 aspect ratio. */
  aspect-ratio: 0.92;
}

/* AppImage fills its parent, so every cover slot needs an explicit box. */
.cover-stack-item {
  position: absolute;
  width: 56%;
  aspect-ratio: 0.67;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 12px 26px -14px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease;
}

.cover-stack-item:hover {
  transform: translateY(-6px) rotate(0deg) !important;
  z-index: 4 !important;
}
</style>
