<script setup lang="ts">
const recommendationsStore = useRecommendationsStore()

// SEO
useSeo({
  description: 'Discover your next favorite book through curated recommendations, emotional reading profiles, and a passionate reading community.',
})

// SSR fetch
const { data: categories, error } = await useAsyncData(
  'home-recommendations',
  () => recommendationsStore.fetchHomeRecommendations(),
)
</script>

<template>
  <div>
    <HeroBanner />

    <v-container class="py-8">
      <!-- Error state -->
      <v-alert
        v-if="error && !categories?.length"
        type="warning"
        variant="tonal"
        icon="mdi-alert-circle-outline"
        class="mb-6"
      >
        Recommendations are not available right now. Please try again later.
      </v-alert>

      <!-- Loading state (SSR fallback) -->
      <template v-else-if="recommendationsStore.isLoading && !categories?.length">
        <div
          v-for="n in 4"
          :key="n"
          class="mb-8"
        >
          <v-skeleton-loader
            type="heading"
            width="200"
            class="mb-3"
          />

          <div class="d-flex gap-3">
            <v-skeleton-loader
              v-for="m in 5"
              :key="m"
              type="image, article"
              width="160"
              class="flex-shrink-0 rounded-lg"
            />
          </div>
        </div>
      </template>

      <!-- Recommendation rows -->
      <template v-else-if="categories?.length">
        <template
          v-for="category in categories"
          :key="category.category"
        >
          <RecommendationRow
            v-if="(category.book_items?.length ?? 0) > 0 || (category.author_items?.length ?? 0) > 0"
            :category="category"
          />
        </template>
      </template>
    </v-container>
  </div>
</template>
