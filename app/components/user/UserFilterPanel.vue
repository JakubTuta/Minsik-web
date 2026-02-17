<script setup lang="ts">
import type { BookshelfStatus } from '~/types/user'

interface SortOption {
  label: string
  value: string
}

interface Props {
  sortOptions: SortOption[]
  showStatusFilter?: boolean
  showRatingFilter?: boolean
  sort: string
  order: 'asc' | 'desc'
  titleFilter: string
  status?: BookshelfStatus | null
  selectedRatings?: number[]
  ratingCounts?: Record<number, number>
}

const props = withDefaults(defineProps<Props>(), {
  showStatusFilter: false,
  showRatingFilter: false,
  status: null,
  selectedRatings: () => [],
  ratingCounts: () => ({}),
})

const emit = defineEmits<{
  'update:sort': [value: string]
  'update:order': [value: 'asc' | 'desc']
  'update:titleFilter': [value: string]
  'update:status': [value: BookshelfStatus | null]
  'update:selectedRatings': [value: number[]]
}>()

const statusOptions: { label: string, value: BookshelfStatus, color: string }[] = [
  { label: 'Want to Read', value: 'want_to_read', color: 'orange' },
  { label: 'Reading', value: 'reading', color: 'blue' },
  { label: 'Read', value: 'read', color: 'green' },
  { label: 'Abandoned', value: 'abandoned', color: 'grey' },
]

const starLevels = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5]

function toggleRating(star: number) {
  const current = [...props.selectedRatings!]
  const idx = current.indexOf(star)
  if (idx === -1)
    current.push(star)
  else current.splice(idx, 1)
  emit('update:selectedRatings', current)
}

function starLabel(star: number): string {
  const unit = star === 1
    ? 'star'
    : 'stars'
  const count = props.ratingCounts![star] ?? 0

  return `${star.toFixed(1)} ${unit} (${count})`
}
</script>

<template>
  <v-card
    variant="outlined"
    class="pa-4"
  >
    <!-- Title Search -->
    <v-text-field
      :model-value="titleFilter"
      label="Search by title"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      hide-details
      clearable
      class="mb-5"
      @update:model-value="emit('update:titleFilter', $event ?? '')"
    />

    <!-- Sort By -->
    <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase mb-2">
      Sort By
    </div>

    <v-select
      :model-value="sort"
      :items="sortOptions"
      item-title="label"
      item-value="value"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-3"
      @update:model-value="emit('update:sort', $event)"
    />

    <v-btn-toggle
      :model-value="order"
      mandatory
      density="compact"
      class="mb-2 w-full"
      color="primary"
      @update:model-value="emit('update:order', $event)"
    >
      <v-btn
        value="desc"
        size="x-small"
        class="mx-1 flex-1"
        prepend-icon="mdi-sort-descending"
      >
        Descending
      </v-btn>

      <v-btn
        value="asc"
        size="x-small"
        class="mx-1 flex-1"
        prepend-icon="mdi-sort-ascending"
      >
        Ascending
      </v-btn>
    </v-btn-toggle>

    <!-- Status Filter -->
    <template v-if="showStatusFilter">
      <v-divider class="my-4" />

      <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase mb-3">
        Reading Status
      </div>

      <div class="d-flex flex-column gap-2">
        <v-chip
          :color="status === null
            ? 'primary'
            : undefined"
          :variant="status === null
            ? 'elevated'
            : 'outlined'"
          size="small"
          class="cursor-pointer"
          @click="emit('update:status', null)"
        >
          All
        </v-chip>

        <v-chip
          v-for="opt in statusOptions"
          :key="opt.value"
          :color="status === opt.value
            ? opt.color
            : undefined"
          :variant="status === opt.value
            ? 'elevated'
            : 'outlined'"
          size="small"
          @click="emit('update:status', opt.value)"
        >
          {{ opt.label }}
        </v-chip>
      </div>
    </template>

    <!-- Rating Checkboxes -->
    <template v-if="showRatingFilter">
      <v-divider class="my-4" />

      <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase mb-2">
        Filter by Rating
      </div>

      <div class="d-flex flex-column">
        <v-checkbox
          v-for="star in starLevels"
          :key="star"
          :model-value="selectedRatings!.includes(star)"
          :label="starLabel(star)"
          density="compact"
          hide-details
          color="primary"
          @update:model-value="toggleRating(star)"
        />
      </div>
    </template>
  </v-card>
</template>
