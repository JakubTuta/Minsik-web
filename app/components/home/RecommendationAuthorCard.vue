<script setup lang="ts">
import type { RecommendationAuthorItem } from '~/types/recommendations'

interface Props {
  author: RecommendationAuthorItem
  eager?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  eager: false,
})
</script>

<template>
  <v-card class="rec-author-card d-flex flex-column">
    <!-- Avatar zone: 80% -->
    <div class="avatar-zone bg-surface-variant d-flex align-center justify-center">
      <v-avatar
        size="160"
        class="author-avatar"
      >
        <v-img
          :src="author.photo_url || '/placeholder-avatar-lazy.jpg'"
          :alt="author.name"
          :eager="eager"
          cover
        />
      </v-avatar>
    </div>

    <!-- Info zone: 20% -->
    <div class="info-zone px-3 pb-1 pt-2 text-center">
      <NuxtLink
        :to="`/authors/${author.slug}`"
        class="text-body-2 font-weight-bold text-decoration-none author-name-link line-clamp-2"
      >
        {{ author.name }}
      </NuxtLink>

      <div class="text-medium-emphasis mt-1">
        {{ author.book_count }} {{ author.book_count === 1
          ? 'book'
          : 'books' }}
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.rec-author-card {
  height: 380px;
}

.avatar-zone {
  height: 75%;
  overflow: hidden;
}

.info-zone {
  height: 25%;
  overflow: hidden;
}

.author-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
}

.author-name-link {
  color: inherit;
  display: block;
}

.author-name-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
