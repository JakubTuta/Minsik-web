<script setup lang="ts">
import type { RecommendationAuthorItem } from '~/types/recommendations'

interface Props {
  author: RecommendationAuthorItem
}

defineProps<Props>()
</script>

<template>
  <v-card
    :to="`/authors/${author.slug}`"
    hover
    class="rec-author-card d-flex flex-column align-center justify-center text-center"
  >
    <div class="px-4 pb-5 pt-5">
      <v-avatar
        size="150"
        class="author-avatar mb-4"
      >
        <v-img
          :src="author.photo_url || '/placeholder-avatar.jpg'"
          lazy-src="/placeholder-avatar-lazy.jpg"
          :alt="author.name"
          cover
        />
      </v-avatar>

      <div class="text-body-2 font-weight-bold line-clamp-2 mb-2">
        {{ author.name }}
      </div>

      <v-chip
        size="x-small"
        color="primary"
        variant="tonal"
        prepend-icon="mdi-book-open-variant"
      >
        {{ author.book_count }} books
      </v-chip>
    </div>
  </v-card>
</template>

<style scoped>
.rec-author-card {
  min-height: 360px;
}

.author-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
