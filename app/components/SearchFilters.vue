<script setup lang="ts">
import type { SearchType } from '~/types/api'

interface Props {
  modelValue: SearchType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SearchType]
}>()

const filters = [
  { label: 'All', value: 'all' as SearchType },
  { label: 'Books', value: 'books' as SearchType },
  { label: 'Authors', value: 'authors' as SearchType },
  { label: 'Series', value: 'series' as SearchType },
]

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
