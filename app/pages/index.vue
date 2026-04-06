<script setup lang="ts">
import type { RecommendationSection } from '~/types/recommendations'

const recommendationsStore = useRecommendationsStore()
const authStore = useAuthStore()

// SEO
useSeo({
  description: 'Discover your next favorite book through curated recommendations, emotional reading profiles, and a passionate reading community.',
})

const { data: categories, error } = await useAsyncData(
  'home-recommendations',
  () => recommendationsStore.fetchHomeRecommendations(),
)

const filteredCategories = computed<RecommendationSection[]>(() => (categories.value ?? []).filter(
  c => (c.book_items?.length ?? 0) > 0 || (c.author_items?.length ?? 0) > 0,
),
)

// Personalized recommendations — rendered inside <ClientOnly> so no SSR involvement
const personalizedCategories = ref<RecommendationSection[]>([])
const isLoadingPersonalized = ref(false)

if (import.meta.client) {
  watch(() => authStore.isAuthenticated, async (isAuth) => {
    if (isAuth) {
      isLoadingPersonalized.value = true
      try {
        personalizedCategories.value = await recommendationsStore.fetchPersonalizedHomeRecommendations() ?? []
      }
      finally {
        isLoadingPersonalized.value = false
      }
    }
    else {
      personalizedCategories.value = []
    }
  }, { immediate: true })
}
</script>

<template>
  <div>
    <HeroBanner />

    <LandingMarquee />

    <v-container class="py-8">
      <FeaturesShowcase />

      <div class="mb-10 mt-16 text-center">
        <h2 class="text-h3 font-weight-bold mb-4">
          Trending Now
        </h2>

        <p
          class="text-h6 text-medium-emphasis mx-auto"
          style="max-width: 600px;"
        >
          See what the community is discovering this week.
        </p>
      </div>

      <ClientOnly>
        <div v-if="isLoadingPersonalized || personalizedCategories.length > 0">
          <RecommendationRowSkeleton v-if="isLoadingPersonalized" />

          <div v-else>
            <RecommendationRow
              v-for="category in personalizedCategories"
              :key="category.key"
              :category="category"
              hide-show-more
            />
          </div>
        </div>
      </ClientOnly>

      <v-alert
        v-if="error && !filteredCategories.length"
        type="warning"
        variant="tonal"
        icon="mdi-alert-circle-outline"
        class="mb-6"
      >
        Recommendations are not available right now. Please try again later.
      </v-alert>

      <RecommendationRowSkeleton
        v-else-if="recommendationsStore.isLoading && !filteredCategories.length"
        :count="4"
      />

      <div v-else>
        <RecommendationRow
          v-for="category in filteredCategories"
          :key="category.key"
          :category="category"
        />
      </div>
    </v-container>

    <LandingCta />
  </div>
</template>
