<script setup lang="ts">
import type { RecommendationSection } from '~/types/recommendations'

const recommendationsStore = useRecommendationsStore()
const authStore = useAuthStore()

// SEO
useSeo({
  description: 'Discover your next favorite book through curated recommendations, emotional reading profiles, and a passionate reading community.',
})

// SSR fetch for guest recommendations
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

onMounted(() => {
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
})
</script>

<template>
  <div>
    <HeroBanner />

    <v-container class="py-8">
      <ClientOnly>
        <div v-if="isLoadingPersonalized || personalizedCategories.length > 0">
          <div v-if="isLoadingPersonalized">
            <div
              v-for="n in 2"
              :key="`ps-${n}`"
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
          </div>

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

      <div v-else-if="recommendationsStore.isLoading && !filteredCategories.length">
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
      </div>

      <div v-else>
        <RecommendationRow
          v-for="category in filteredCategories"
          :key="category.key"
          :category="category"
        />
      </div>
    </v-container>
  </div>
</template>
