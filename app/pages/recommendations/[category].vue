<script setup lang="ts">
import type { RecommendationAuthorItem, RecommendationBookItem } from '~/types/recommendations'
import { totalRatingCount, weightedRating } from '~/utils/format'

const route = useRoute()
const recommendationsStore = useRecommendationsStore()

const category = route.params.category as string

// SSR fetch — first page (20 items)
const { data: categoryData, error } = await useAsyncData(
  `recommendation-${category}`,
  () => recommendationsStore.fetchCategoryRecommendations(category, 20, 0),
)

// SEO
useSeo({
  title: categoryData.value?.display_name ?? 'Recommendations',
  description: `Browse the full ${categoryData.value?.display_name ?? 'recommendations'} list on Minsik.`,
  image: '/og-image.jpg',
})

if (error.value || !categoryData.value) {
  throw createError({ statusCode: 404, message: 'Category not found' })
}

const isAuthorCategory = computed(() => categoryData.value?.item_type === 'author')
const itemLabel = computed(() => (isAuthorCategory.value
  ? 'authors'
  : 'books'))

// Pagination
const items = ref<(RecommendationBookItem | RecommendationAuthorItem)[]>(
  categoryData.value?.item_type === 'author'
    ? [...(categoryData.value?.author_items ?? [])]
    : [...(categoryData.value?.book_items ?? [])],
)
const total = ref(categoryData.value.total)
const isLoadingMore = ref(false)

const hasMore = computed(() => items.value.length < total.value)

async function loadMore() {
  if (isLoadingMore.value || !hasMore.value)
    return

  isLoadingMore.value = true
  try {
    const nextPage = await recommendationsStore.fetchCategoryRecommendations(
      category,
      20,
      items.value.length,
      true,
    )
    if (nextPage) {
      const newItems = isAuthorCategory.value
        ? nextPage.author_items ?? []
        : nextPage.book_items ?? []
      items.value.push(...newItems)
      total.value = nextPage.total
    }
  }
  finally {
    isLoadingMore.value = false
  }
}
</script>

<template>
  <v-container class="py-6">
    <!-- Back navigation -->
    <div class="mb-6">
      <NuxtLink
        to="/"
        class="text-decoration-none"
      >
        <v-btn
          variant="text"
          color="default"
          prepend-icon="mdi-arrow-left"
          class="text-none"
        >
          Back to Home
        </v-btn>
      </NuxtLink>
    </div>

    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-h4 text-sm-h3 font-weight-bold mb-1">
        {{ categoryData?.display_name }}
      </h1>

      <p class="text-body-1 text-medium-emphasis">
        {{ total }} {{ itemLabel }}
      </p>
    </div>

    <!-- Grid of items -->
    <v-row>
      <template v-if="isAuthorCategory">
        <v-col
          v-for="(item, index) in (items as RecommendationAuthorItem[])"
          :key="item.author_id"
          cols="6"
          sm="4"
          md="3"
        >
          <AuthorPreviewCard
            :name="item.name"
            :slug="item.slug"
            :photo-url="item.photo_url"
            :book-count="item.book_count"
            :rating="weightedRating(item.avg_rating, item.rating_count, item.ol_avg_rating, item.ol_rating_count)"
            :rating-count="totalRatingCount(item.rating_count, item.ol_rating_count)"
            :readers="item.readers"
            :eager="index < 2"
          />
        </v-col>
      </template>

      <template v-else>
        <v-col
          v-for="(item, index) in (items as RecommendationBookItem[])"
          :key="item.book_id"
          cols="6"
          sm="4"
          md="3"
        >
          <BookPreviewCard
            :title="item.title"
            :slug="item.slug"
            :cover-url="item.primary_cover_url"
            :author-names="item.author_names"
            :author-slugs="item.author_slugs"
            :rating="weightedRating(item.avg_rating, item.rating_count, item.ol_avg_rating, item.ol_rating_count)"
            :rating-count="totalRatingCount(item.rating_count, item.ol_rating_count)"
            :readers="item.readers"
            :eager="index < 2"
          />
        </v-col>
      </template>
    </v-row>

    <!-- Load more -->
    <div
      v-if="hasMore"
      class="d-flex mt-8 justify-center"
    >
      <v-btn
        :loading="isLoadingMore"
        variant="tonal"
        color="primary"
        size="large"
        prepend-icon="mdi-refresh"
        @click="loadMore"
      >
        Load more
      </v-btn>
    </div>

    <!-- End of list -->
    <div
      v-else-if="items.length > 0"
      class="text-medium-emphasis py-6 text-center"
    >
      <v-icon
        icon="mdi-check-circle-outline"
        class="mr-2"
      />

      You've seen all {{ total }} {{ itemLabel }}
    </div>
  </v-container>
</template>
