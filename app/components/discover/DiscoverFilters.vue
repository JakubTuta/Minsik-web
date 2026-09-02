<script setup lang="ts">
import type { BookLength, Era, Mood, Popularity, Quality, SeriesFilter } from '~/types/discover'

const emit = defineEmits<{ clearAll: [] }>()
const { t } = useI18n()
const {
  bookLengthOptions,
  qualityOptions,
  moodOptions,
  eraOptions,
  seriesOptions,
  popularityOptions,
} = useDiscoverFilterOptions()

const bookLength = defineModel<BookLength | null>('bookLength', { default: null })
const quality = defineModel<Quality | null>('quality', { default: null })
const moods = defineModel<Mood[]>('moods', { default: () => [] })
const era = defineModel<Era | null>('era', { default: null })
const seriesFilter = defineModel<SeriesFilter | null>('seriesFilter', { default: null })
const popularity = defineModel<Popularity | null>('popularity', { default: null })

const hasActiveFilters = computed(() => bookLength.value !== null
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
  emit('clearAll')
}
</script>

<template>
  <v-card
    class="filter-card mx-auto pa-6"
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
        {{ t('discover.bookLength') }}
      </div>

      <v-chip-group
        v-model="bookLength"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in bookLengthOptions"
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
        {{ t('discover.quality') }}
      </div>

      <v-chip-group
        v-model="quality"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in qualityOptions"
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
        {{ t('discover.mood') }}
        <span class="text-caption text-medium-emphasis font-weight-regular ml-2">{{ t('discover.selectMultiple') }}</span>
      </div>

      <v-chip-group
        v-model="moods"
        multiple
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in moodOptions"
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
        {{ t('discover.era') }}
      </div>

      <v-chip-group
        v-model="era"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in eraOptions"
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
        {{ t('discover.series') }}
      </div>

      <v-chip-group
        v-model="seriesFilter"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in seriesOptions"
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
        {{ t('discover.popularity') }}
      </div>

      <v-chip-group
        v-model="popularity"
        selected-class="text-primary"
        column
      >
        <v-chip
          v-for="opt in popularityOptions"
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
      class="mt-6 border-t pt-4 text-center"
    >
      <v-btn
        variant="text"
        prepend-icon="mdi-filter-remove"
        @click="clearAll"
      >
        {{ t('discover.clearAllFilters') }}
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
