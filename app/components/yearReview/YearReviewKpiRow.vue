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

const { t, n } = useI18n()
const gridRef = ref<HTMLElement | null>(null)

useScrollReveal(gridRef, { stagger: 0.08 })

const tiles = computed(() => [
  { key: 'books', value: props.totalBooksFinished, icon: 'mdi-check-circle', color: 'success', label: t('yearReview.booksFinished') },
  { key: 'pages', value: props.totalPagesRead, icon: 'mdi-file-document', color: 'info', label: t('yearReview.pagesRead'), format: true },
  { key: 'hours', value: props.totalHoursRead, icon: 'mdi-clock-outline', color: 'warning', label: t('yearReview.hoursRead') },
  { key: 'ratings', value: props.ratingsGiven, icon: 'mdi-star', color: 'amber', label: t('yearReview.ratingsGiven') },
  { key: 'reading', value: props.currentlyReadingCount, icon: 'mdi-book-open-page-variant', color: 'primary', label: t('yearReview.readingNow') },
  { key: 'added', value: props.addedToShelfCount, icon: 'mdi-bookshelf', color: 'secondary', label: t('yearReview.addedToShelves') },
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
          ? n(tile.value)
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
