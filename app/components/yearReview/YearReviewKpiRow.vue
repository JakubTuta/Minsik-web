<script setup lang="ts">
interface Props {
  totalBooksFinished: number
  totalPagesRead: number
  totalHoursRead: number
  ratingsGiven: number
  currentlyReadingCount: number
  addedToShelfCount: number
}

const props = defineProps<Props>()

const gridRef = ref<HTMLElement | null>(null)

useScrollReveal(gridRef, { stagger: 0.08 })

const tiles = computed(() => [
  { key: 'books', value: props.totalBooksFinished, icon: 'mdi-check-circle', color: 'success', label: 'Books finished' },
  { key: 'pages', value: props.totalPagesRead, icon: 'mdi-file-document', color: 'info', label: 'Pages read', format: true },
  { key: 'hours', value: props.totalHoursRead, icon: 'mdi-clock-outline', color: 'warning', label: 'Hours read' },
  { key: 'ratings', value: props.ratingsGiven, icon: 'mdi-star', color: 'amber', label: 'Ratings given' },
  { key: 'reading', value: props.currentlyReadingCount, icon: 'mdi-book-open-page-variant', color: 'primary', label: 'Reading now' },
  { key: 'added', value: props.addedToShelfCount, icon: 'mdi-bookshelf', color: 'secondary', label: 'Added to shelves' },
])
</script>

<template>
  <div
    ref="gridRef"
    class="stats-grid"
  >
    <v-card
      v-for="tile in tiles"
      :key="tile.key"
      variant="tonal"
      :color="tile.color"
      class="pa-4 text-center"
    >
      <v-icon
        :icon="tile.icon"
        size="26"
        class="mb-2"
      />

      <div class="text-h4 font-weight-bold">
        {{ tile.format
          ? tile.value.toLocaleString()
          : tile.value }}
      </div>

      <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium">
        {{ tile.label }}
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
</style>
