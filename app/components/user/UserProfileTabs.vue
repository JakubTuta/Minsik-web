<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()

const tabs = computed(() => [
  { label: t('nav.dashboard'), to: '/dashboard', icon: 'mdi-view-dashboard' },
  { label: t('nav.yearInReview'), to: '/year-in-review', icon: 'mdi-calendar-star' },
  { label: t('nav.myBookshelf'), to: '/bookshelf', icon: 'mdi-bookshelf' },
  { label: t('nav.favourites'), to: '/favourites', icon: 'mdi-heart' },
  { label: t('nav.ratings'), to: '/ratings', icon: 'mdi-star' },
  { label: t('nav.comments'), to: '/comments', icon: 'mdi-comment-text' },
])

const activeTab = computed(() => tabs.value.findIndex(tab => tab.to === route.path))
</script>

<template>
  <v-tabs
    :model-value="activeTab"
    color="primary"
    class="mb-6"
  >
    <v-tab
      v-for="tab in tabs"
      :key="tab.to"
      :prepend-icon="tab.icon"
      :to="localePath(tab.to)"
    >
      {{ tab.label }}
    </v-tab>
  </v-tabs>
</template>
