<script setup lang="ts">
interface CategoryChip {
  slug: string
  name: string
}

interface Props {
  categories: CategoryChip[]
  maxVisible?: number
  hideLabel?: boolean
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
    <div
      v-if="!hideLabel"
      class="text-secondary mb-2"
    >
      {{ t('nav.categories') }}
    </div>

    <div class="d-flex flex-wrap gap-2">
      <v-chip
        v-for="category in visibleCategories"
        :key="category.slug"
        size="small"
        variant="tonal"
        color="primary"
        class="category-chip"
        :to="localePath(`/search?q=${encodeURIComponent(category.name)}&type=categories`)"
      >
        {{ genreLabel(category.slug) }}
      </v-chip>

      <v-chip
        v-if="hasMore"
        size="small"
        variant="tonal"
        color="primary"
        class="category-chip"
        @click="expanded = !expanded"
      >
        {{ expanded
          ? '-'
          : `+${categories.length - maxVisible}` }}
      </v-chip>
    </div>
  </div>
</template>

<style scoped>
/*
 * Vuetify tints a tonal chip's text with the same colour as its background, and
 * on this palette's primary that leaves the label washed out against the tint.
 * Paint the label with the surface's own text colour instead.
 */
.category-chip {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}
</style>
