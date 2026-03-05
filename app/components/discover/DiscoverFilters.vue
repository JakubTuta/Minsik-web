<script setup lang="ts">
import type { BookLength, Quality, Mood, Era, SeriesFilter, Popularity } from '~/types/discover'
import {
  BOOK_LENGTH_OPTIONS,
  QUALITY_OPTIONS,
  MOOD_OPTIONS,
  ERA_OPTIONS,
  SERIES_OPTIONS,
  POPULARITY_OPTIONS,
} from '~/types/discover'

const bookLength = defineModel<BookLength | null>('bookLength', { default: null })
const quality = defineModel<Quality | null>('quality', { default: null })
const moods = defineModel<Mood[]>('moods', { default: () => [] })
const era = defineModel<Era | null>('era', { default: null })
const seriesFilter = defineModel<SeriesFilter | null>('seriesFilter', { default: null })
const popularity = defineModel<Popularity | null>('popularity', { default: null })

const emit = defineEmits<{ 'clear-all': [] }>()

const hasActiveFilters = computed(() =>
  bookLength.value !== null
  || quality.value !== null
  || moods.value.length > 0
  || era.value !== null
  || seriesFilter.value !== null
  || popularity.value !== null,
)

function clearAll() {
  bookLength.value = null
  quality.value = null
  moods.value = []
  era.value = null
  seriesFilter.value = null
  popularity.value = null
  emit('clear-all')
}
</script>

<template>
  <v-card
    class="pa-6 mx-auto filter-card"
    max-width="820"
    elevation="2"
  >
    <!-- Book Length -->
    <div class="filter-section mb-6">
      <div class="filter-label text-subtitle-1 font-weight-bold mb-3">
        <v-icon
          start
          size="20"
        >
          mdi-ruler
        </v-icon>
        Book Length
      </div>

      <v-chip-group
        v-model="bookLength"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in BOOK_LENGTH_OPTIONS"
          :key="opt.value"
          :value="opt.value"
          filter
          variant="outlined"
          class="filter-chip"
        >
          <v-icon start>
            {{ opt.icon }}
          </v-icon>
          {{ opt.label }}
          <span
            v-if="opt.description"
            class="text-caption text-medium-emphasis ml-1"
          >({{ opt.description }})</span>
        </v-chip>
      </v-chip-group>
    </div>

    <v-divider class="mb-6" />

    <!-- Quality -->
    <div class="filter-section mb-6">
      <div class="filter-label text-subtitle-1 font-weight-bold mb-3">
        <v-icon
          start
          size="20"
        >
          mdi-trophy
        </v-icon>
        Quality
      </div>

      <v-chip-group
        v-model="quality"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in QUALITY_OPTIONS"
          :key="opt.value"
          :value="opt.value"
          filter
          variant="outlined"
          class="filter-chip"
        >
          <v-icon start>
            {{ opt.icon }}
          </v-icon>
          {{ opt.label }}
          <span
            v-if="opt.description"
            class="text-caption text-medium-emphasis ml-1"
          >({{ opt.description }})</span>
        </v-chip>
      </v-chip-group>
    </div>

    <v-divider class="mb-6" />

    <!-- Moods -->
    <div class="filter-section mb-6">
      <div class="filter-label text-subtitle-1 font-weight-bold mb-1">
        <v-icon
          start
          size="20"
        >
          mdi-emoticon
        </v-icon>
        Mood
        <span class="text-caption text-medium-emphasis ml-2 font-weight-regular">select multiple</span>
      </div>

      <v-chip-group
        v-model="moods"
        multiple
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in MOOD_OPTIONS"
          :key="opt.value"
          :value="opt.value"
          filter
          variant="outlined"
          class="filter-chip"
        >
          <v-icon start>
            {{ opt.icon }}
          </v-icon>
          {{ opt.label }}
        </v-chip>
      </v-chip-group>
    </div>

    <v-divider class="mb-6" />

    <!-- Era -->
    <div class="filter-section mb-6">
      <div class="filter-label text-subtitle-1 font-weight-bold mb-3">
        <v-icon
          start
          size="20"
        >
          mdi-calendar-range
        </v-icon>
        Era
      </div>

      <v-chip-group
        v-model="era"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in ERA_OPTIONS"
          :key="opt.value"
          :value="opt.value"
          filter
          variant="outlined"
          class="filter-chip"
        >
          <v-icon start>
            {{ opt.icon }}
          </v-icon>
          {{ opt.label }}
          <span
            v-if="opt.description"
            class="text-caption text-medium-emphasis ml-1"
          >({{ opt.description }})</span>
        </v-chip>
      </v-chip-group>
    </div>

    <v-divider class="mb-6" />

    <!-- Series -->
    <div class="filter-section mb-6">
      <div class="filter-label text-subtitle-1 font-weight-bold mb-3">
        <v-icon
          start
          size="20"
        >
          mdi-book-multiple
        </v-icon>
        Series
      </div>

      <v-chip-group
        v-model="seriesFilter"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in SERIES_OPTIONS"
          :key="opt.value"
          :value="opt.value"
          filter
          variant="outlined"
          class="filter-chip"
        >
          <v-icon start>
            {{ opt.icon }}
          </v-icon>
          {{ opt.label }}
        </v-chip>
      </v-chip-group>
    </div>

    <v-divider class="mb-6" />

    <!-- Popularity -->
    <div class="filter-section">
      <div class="filter-label text-subtitle-1 font-weight-bold mb-3">
        <v-icon
          start
          size="20"
        >
          mdi-chart-bar
        </v-icon>
        Popularity
      </div>

      <v-chip-group
        v-model="popularity"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in POPULARITY_OPTIONS"
          :key="opt.value"
          :value="opt.value"
          filter
          variant="outlined"
          class="filter-chip"
        >
          <v-icon start>
            {{ opt.icon }}
          </v-icon>
          {{ opt.label }}
          <span
            v-if="opt.description"
            class="text-caption text-medium-emphasis ml-1"
          >({{ opt.description }})</span>
        </v-chip>
      </v-chip-group>
    </div>

    <!-- Clear All -->
    <div
      v-if="hasActiveFilters"
      class="text-center mt-6 pt-4 border-t"
    >
      <v-btn
        variant="text"
        prepend-icon="mdi-filter-remove"
        @click="clearAll"
      >
        Clear All Filters
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.filter-label {
  display: flex;
  align-items: center;
}

.filter-chip {
  transition: transform 0.15s ease;
}

.filter-chip:hover {
  transform: translateY(-1px);
}
</style>
