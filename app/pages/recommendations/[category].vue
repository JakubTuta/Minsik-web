<script setup lang="ts">
import type { RecommendationAuthorItem, RecommendationBookItem } from '~/types/recommendations'

const route = useRoute()
const { t } = useI18n()
// The list is built per language server-side.
const { language } = useUserLanguage()
const recommendationsStore = useRecommendationsStore()
const recommendationTitle = useRecommendationTitle()

const category = route.params.category as string

// SSR fetch — first page (20 items)
const { data: categoryData, error } = await useAsyncData(
  `recommendation-${category}`,
  () => recommendationsStore.fetchCategoryRecommendations(category, 20, 0),
  { watch: [language] },
)

const pageTitle = computed(() => (categoryData.value
  ? recommendationTitle(categoryData.value)
  : t('recommendationsPage.title')))

// SEO
useSeo({
  title: pageTitle,
  description: computed(() => t('recommendationsPage.description', { name: pageTitle.value })),
  image: '/og-image.jpg',
})

if (error.value || !categoryData.value) {
  throw createError({ statusCode: 404, message: t('recommendationsPage.categoryNotFound'), fatal: true })
}

const isAuthorCategory = computed(() => categoryData.value?.item_type === 'author')
const itemLabel = computed(() => (isAuthorCategory.value
  ? t('recommendationsPage.authorsLabel')
  : t('recommendationsPage.booksLabel')))

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
      <NuxtLinkLocale
        to="/"
        class="text-decoration-none"
      >
        <v-btn
          variant="text"
          color="default"
          prepend-icon="mdi-arrow-left"
          class="text-none"
        >
          {{ t('recommendationsPage.backToHome') }}
        </v-btn>
      </NuxtLinkLocale>
    </div>

    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-h4 text-sm-h3 font-weight-bold mb-1">
        {{ pageTitle }}
      </h1>

      <p class="text-body-1 text-medium-emphasis">
        {{ t('recommendationsPage.itemCount', {"count": total,
                                               "label": itemLabel}) }}
      </p>
    </div>

    <!-- Grid of items -->
    <v-row>
      <template v-if="isAuthorCategory">
        <v-col
          v-for="item in (items as RecommendationAuthorItem[])"
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
            :rating="item.avg_rating"
            :rating-count="item.rating_count"
            :readers="item.readers"
          />
        </v-col>
      </template>

      <template v-else>
        <v-col
          v-for="item in (items as RecommendationBookItem[])"
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
            :rating="item.avg_rating"
            :rating-count="item.rating_count"
            :readers="item.readers"
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
        {{ t('recommendationsPage.loadMore') }}
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

      {{ t('recommendationsPage.seenAll', {"count": total,
                                           "label": itemLabel}) }}
    </div>
  </v-container>
</template>
