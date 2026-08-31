<script setup lang="ts">
import type { RecommendationSection } from '~/types/recommendations'

interface Props {
  sections: RecommendationSection[]
}

const props = defineProps<Props>()

const populated = computed(() => props.sections.filter(
  section => (section.book_items?.length ?? 0) > 0 || (section.author_items?.length ?? 0) > 0,
))
</script>

<template>
  <div v-if="populated.length > 0">
    <RecommendationRow
      v-for="section in populated"
      :key="section.key"
      :category="section"
      hide-show-more
    />
  </div>
</template>
