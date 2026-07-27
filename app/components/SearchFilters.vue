<script setup lang="ts">
import type { SearchType } from '~/types/api'

interface Props {
  modelValue: SearchType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SearchType]
}>()

const { t } = useI18n()

const filters = computed(() => [
  { label: t('search.filterAll'), value: 'all' as SearchType },
  { label: t('search.filterBooks'), value: 'books' as SearchType },
  { label: t('search.filterAuthors'), value: 'authors' as SearchType },
  { label: t('search.filterSeries'), value: 'series' as SearchType },
  { label: t('search.filterCategories'), value: 'categories' as SearchType },
])

const selectedFilter = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})
</script>

<template>
  <v-chip-group
    v-model="selectedFilter"
    mandatory
    selected-class="text-primary"
  >
    <v-chip
      v-for="filter in filters"
      :key="filter.value"
      :value="filter.value"
      filter
    >
      {{ filter.label }}
    </v-chip>
  </v-chip-group>
</template>
