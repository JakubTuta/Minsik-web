<script setup lang="ts">
import type { YearBook } from '~/types/yearInReview'

interface Props {
  book: YearBook
  width?: number
  showRating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 96,
})

const height = computed(() => Math.round(props.width * 1.5))
</script>

<template>
  <NuxtLink
    :to="`/books/${book.book_slug}`"
    class="cover-link text-decoration-none"
  >
    <div
      class="cover-frame"
      :style="{'width': `${width}px`}"
    >
      <v-img
        :src="book.book_cover_url"
        lazy-src="/placeholder-book-lazy.jpg"
        :alt="book.book_title"
        :width="width"
        :height="height"
        cover
        class="cover-img rounded-lg"
      >
        <template #placeholder>
          <div class="cover-placeholder d-flex align-center justify-center">
            <v-icon
              icon="mdi-book"
              size="28"
              class="text-medium-emphasis"
            />
          </div>
        </template>
      </v-img>

      <div
        v-if="showRating && book.my_rating !== null"
        class="rating-badge d-flex align-center ga-1"
      >
        <v-icon
          icon="mdi-star"
          size="12"
          color="amber"
        />

        <span class="text-caption font-weight-bold">{{ book.my_rating.toFixed(1) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.cover-frame {
  position: relative;
  transition: transform 0.25s ease;
}

.cover-link:hover .cover-frame {
  transform: translateY(-6px) scale(1.03);
}

.cover-img {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-surface-variant), 0.6);
}

.rating-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  backdrop-filter: blur(4px);
}
</style>
