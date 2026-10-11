<script setup lang="ts">
import type { CategoryInfo } from '~/types/recommendations'

const { t } = useI18n()
const localePath = useLocalePath()
const recommendationsStore = useRecommendationsStore()
const recommendationTitle = useRecommendationTitle()

const { data: lists } = await useAsyncData(
  'recommendation-lists',
  () => recommendationsStore.fetchAvailableCategories(),
)

useSeo({
  title: t('recommendationsPage.browseTitle'),
  description: t('recommendationsPage.browseSubtitle'),
})

// The charts the nightly job builds; a key without an icon here still renders, with the default.
const LIST_ICONS: Record<string, string> = {
  most_read: 'mdi-book-open-page-variant',
  most_wanted: 'mdi-bookmark',
  trending_reads: 'mdi-trending-up',
  most_viewed: 'mdi-eye',
  highest_rated: 'mdi-star-circle',
  community_top_rated: 'mdi-account-group',
  most_rated: 'mdi-star',
  recently_added: 'mdi-clock-outline',
  classics: 'mdi-bank',
  user_favorites: 'mdi-heart',
  recently_finished: 'mdi-check-circle',
  currently_reading: 'mdi-book-open',
  best_writing: 'mdi-pencil',
  most_emotional: 'mdi-emoticon-sad-outline',
  funniest: 'mdi-emoticon-happy',
  most_thought_provoking: 'mdi-brain',
  most_rereadable: 'mdi-refresh',
  top_authors: 'mdi-trophy',
  popular_authors: 'mdi-account-multiple',
}

const sections = computed(() => {
  const all = lists.value ?? []

  return [
    { key: 'books', title: t('recommendationsPage.booksLabel'), lists: all.filter(list => list.item_type === 'book') },
    { key: 'authors', title: t('recommendationsPage.authorsLabel'), lists: all.filter(list => list.item_type === 'author') },
  ].filter(section => section.lists.length > 0)
})

function titleOf(list: CategoryInfo): string {
  return recommendationTitle({ key: list.key, display_name: list.display_name, title_params: {} })
}
</script>

<template>
  <v-container class="py-6">
    <SectionHeading
      :eyebrow="t('recommendationsPage.browseEyebrow')"
      :title="t('recommendationsPage.browseTitle')"
      :subtitle="t('recommendationsPage.browseSubtitle')"
    />

    <div
      v-for="section in sections"
      :key="section.key"
      class="mb-8"
    >
      <h2 class="text-h6 font-weight-bold text-capitalize mb-3">
        {{ section.title }}
      </h2>

      <v-row>
        <v-col
          v-for="list in section.lists"
          :key="list.key"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            :to="localePath(`/recommendations/${list.key}`)"
            hover
            class="h-100"
          >
            <v-card-text class="d-flex align-center gap-3">
              <v-avatar
                color="primary"
                variant="tonal"
                size="44"
              >
                <v-icon :icon="LIST_ICONS[list.key] ?? 'mdi-format-list-bulleted'" />
              </v-avatar>

              <span class="text-subtitle-1 font-weight-medium">{{ titleOf(list) }}</span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
