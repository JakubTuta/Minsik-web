<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard' },
  { label: 'Year in Review', to: '/year-in-review', icon: 'mdi-calendar-star' },
  { label: 'My Bookshelf', to: '/bookshelf', icon: 'mdi-bookshelf' },
  { label: 'Favourites', to: '/favourites', icon: 'mdi-heart' },
  { label: 'Ratings', to: '/ratings', icon: 'mdi-star' },
  { label: 'Comments', to: '/comments', icon: 'mdi-comment-text' },
]

const activeTab = computed(() => tabs.findIndex(tab => tab.to === route.path))
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
      :to="tab.to"
    >
      {{ tab.label }}
    </v-tab>
  </v-tabs>
</template>
