<script setup lang="ts">
interface Props {
  categories: string[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 5,
})

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
    <h3 class="text-subtitle-2 text-secondary font-weight-bold mb-2">
      Categories
    </h3>

    <div class="d-flex flex-wrap gap-2">
      <v-chip
        v-for="category in visibleCategories"
        :key="category"
        size="small"
        variant="tonal"
      >
        {{ toTitleCase(category) }}
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
