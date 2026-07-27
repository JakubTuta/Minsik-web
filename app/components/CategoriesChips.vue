<script setup lang="ts">
interface CategoryChip {
  slug: string
  name: string
}

interface Props {
  categories: CategoryChip[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 5,
})

const localePath = useLocalePath()

const { t } = useI18n()
const genreLabel = useGenreLabel()

const expanded = ref(false)

const visibleCategories = computed(() => {
  if (expanded.value || props.categories.length <= props.maxVisible)
    return props.categories

  return props.categories.slice(0, props.maxVisible)
})

const hasMore = computed(() => props.categories.length > props.maxVisible)
</script>

<template>
  <div v-if="categories.length > 0">
    <div class="text-secondary mb-2">
      {{ t('nav.categories') }}
    </div>

    <div class="d-flex flex-wrap gap-2">
      <v-chip
        v-for="category in visibleCategories"
        :key="category.slug"
        size="small"
        variant="tonal"
        :to="localePath(`/search?q=${encodeURIComponent(category.name)}&type=categories`)"
      >
        {{ genreLabel(category.slug) }}
      </v-chip>

      <v-chip
        v-if="hasMore"
        size="small"
        variant="tonal"
        @click="expanded = !expanded"
      >
        {{ expanded
          ? '-'
          : `+${categories.length - maxVisible}` }}
      </v-chip>
    </div>
  </div>
</template>
