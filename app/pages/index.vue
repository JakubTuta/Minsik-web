<script setup lang="ts">
import type { PopularCategory } from '~/types/categories'
import type { BookOfTheWeek, RecommendationSection } from '~/types/recommendations'
import { readCookie } from '~/utils/cookie'

const recommendationsStore = useRecommendationsStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()
const { t } = useI18n()
const { language } = useUserLanguage()

useSeo({
  description: t('home.seoDescription'),
})

const { data: categories, error } = useCachedAsyncData(
  'home-recommendations',
  () => recommendationsStore.fetchHomeRecommendations(),
  { lazy: true, watch: [language] },
)

const { data: popularCategories } = useCachedAsyncData<PopularCategory[]>(
  'home-popular-categories',
  () => categoriesStore.fetchPopularCategories(12),
  { lazy: true },
)

const { data: botw } = useCachedAsyncData<BookOfTheWeek | null>(
  'hero-book-of-the-week',
  () => recommendationsStore.fetchBookOfTheWeek(),
  { lazy: true, default: () => null, watch: [language] },
)

const siteUrl = useRuntimeConfig().public.siteUrl as string

useHead(() => {
  if (!botw.value)
    return {}

  return {
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Book',
        'name': botw.value.title,
        'author': botw.value.authors.map(a => ({ '@type': 'Person', 'name': a.name })),
        'url': `${siteUrl}/books/${botw.value.slug}`,
        'image': botw.value.primary_cover_url,
        'inLanguage': botw.value.language,
        'genre': botw.value.categories.map(c => c.name),
        'aggregateRating': botw.value.rating_count > 0
          ? {
              '@type': 'AggregateRating',
              'ratingValue': botw.value.weighted_avg_rating,
              'ratingCount': botw.value.rating_count,
              'bestRating': 5,
              'worstRating': 1,
            }
          : undefined,
      }),
    }],
  }
})

const filteredCategories = computed<RecommendationSection[]>(() => (categories.value ?? []).filter(
  c => (c.book_items?.length ?? 0) > 0 || (c.author_items?.length ?? 0) > 0,
),
)

const SSR_ROW_COUNT = 3
const eagerCategories = computed(() => filteredCategories.value.slice(0, SSR_ROW_COUNT))
const remainingCategories = computed(() => filteredCategories.value.slice(SSR_ROW_COUNT))

const personalizedCategories = ref<RecommendationSection[]>([])
const isLoadingPersonalized = ref(import.meta.client && Boolean(readCookie('csrf_token')))

if (import.meta.client) {
  authStore.waitForAuth().then(async () => {
    if (!authStore.isAuthenticated) {
      isLoadingPersonalized.value = false

      return
    }

    isLoadingPersonalized.value = true
    try {
      personalizedCategories.value = await recommendationsStore.fetchPersonalizedHomeRecommendations() ?? []
    }
    finally {
      isLoadingPersonalized.value = false
    }
  })
}

const PERSONALIZED_EAGER_COUNT = 2
const eagerPersonalized = computed(() => personalizedCategories.value.slice(0, PERSONALIZED_EAGER_COUNT))
const remainingPersonalized = computed(() => personalizedCategories.value.slice(PERSONALIZED_EAGER_COUNT))
</script>

<template>
  <div>
    <HeroBanner :book="botw" />

    <v-container class="py-8">
      <FeaturesShowcase class="home-section" />

      <PopularCategoriesGrid
        class="home-section"
        :categories="popularCategories"
      />

      <ClientOnly>
        <section
          v-if="isLoadingPersonalized || personalizedCategories.length > 0"
          class="home-section"
        >
          <div class="mb-10 text-center">
            <h2 class="text-h3 font-weight-bold mb-4">
              {{ t('home.recommendedForYou') }}
            </h2>
          </div>

          <RecommendationRowSkeleton
            v-if="isLoadingPersonalized"
            :count="2"
          />

          <div v-else>
            <RecommendationRow
              v-for="category in eagerPersonalized"
              :key="category.key"
              :category="category"
              hide-show-more
            />

            <DeferredRecommendationRows
              :sections="remainingPersonalized"
              hide-show-more
            />
          </div>
        </section>
      </ClientOnly>

      <section class="home-section">
        <div class="mb-10 text-center">
          <h2 class="text-h3 font-weight-bold mb-4">
            {{ t('home.trendingNow') }}
          </h2>

          <p
            class="text-h6 text-medium-emphasis mx-auto"
            style="max-width: 600px;"
          >
            {{ t('home.trendingNowSubtitle') }}
          </p>
        </div>

        <v-alert
          v-if="error && !filteredCategories.length"
          type="warning"
          variant="tonal"
          icon="mdi-alert-circle-outline"
          class="mb-6"
        >
          {{ t('home.recommendationsUnavailable') }}
        </v-alert>

        <RecommendationRowSkeleton
          v-else-if="recommendationsStore.isLoading && !filteredCategories.length"
          :count="3"
        />

        <div v-else>
          <RecommendationRow
            v-for="category in eagerCategories"
            :key="category.key"
            :category="category"
          />

          <DeferredRecommendationRows :sections="remainingCategories" />
        </div>
      </section>
    </v-container>

    <LandingCta />
  </div>
</template>

<style scoped>
.home-section {
  display: block;
  margin-block: clamp(10rem, 20vw, 20rem);
}

.home-section:first-child {
  margin-block-start: clamp(6rem, 12vw, 12rem);
}
</style>
