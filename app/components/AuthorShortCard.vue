<script setup lang="ts">
import type { Author } from '~/types/api'
import { hashColor } from '~/utils/coverColor'

interface Props {
  author: Author
}

const props = defineProps<Props>()

const photoBg = computed(() => hashColor(props.author.name))
const { optimized } = useOptimizedImage()
</script>

<template>
  <v-card
    class="author-short-card"
    color="surface-bright"
    flat
    rounded="lg"
  >
    <v-card-text class="d-flex flex-column overflow-hidden pa-4">
      <h3 class="text-h6 font-weight-bold mb-4 flex-shrink-0">
        About Author
      </h3>

      <v-divider class="mb-4 flex-shrink-0" />

      <div class="d-flex flex-column align-center min-h-0 overflow-hidden text-center">
        <v-avatar
          size="120"
          class="author-avatar-shadow mb-3 flex-shrink-0"
        >
          <v-img
            :src="optimized(author.photo_url, 240)"
            :alt="author.name"
          >
            <template #placeholder>
              <HashedFill :color="photoBg" />
            </template>
          </v-img>
        </v-avatar>

        <NuxtLink
          class="text-h5 font-weight-bold text-primary text-decoration-none mb-2 flex-shrink-0"
          :to="`/authors/${author.slug}`"
        >
          {{ author.name }}
        </NuxtLink>

        <p
          v-if="author.bio"
          class="text-body-2 author-bio mt-2"
          style="white-space: pre-line; text-align: left;"
        >
          {{ author.bio }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.author-short-card {
  max-height: 500px;
}

.author-avatar-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.author-bio {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
}
</style>
