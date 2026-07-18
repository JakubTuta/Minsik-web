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

const booksRef = ref<HTMLElement | null>(null)
const pagesRef = ref<HTMLElement | null>(null)
const hoursRef = ref<HTMLElement | null>(null)
const ratingsRef = ref<HTMLElement | null>(null)
const readingRef = ref<HTMLElement | null>(null)
const addedRef = ref<HTMLElement | null>(null)

const booksValue = useCountAnimation(booksRef, computed(() => props.totalBooksFinished))
const pagesValue = useCountAnimation(pagesRef, computed(() => props.totalPagesRead))
const hoursValue = useCountAnimation(hoursRef, computed(() => props.totalHoursRead))
const ratingsValue = useCountAnimation(ratingsRef, computed(() => props.ratingsGiven))
const readingValue = useCountAnimation(readingRef, computed(() => props.currentlyReadingCount))
const addedValue = useCountAnimation(addedRef, computed(() => props.addedToShelfCount))

const tiles = computed(() => [
  { ref: booksRef, value: booksValue?.value ?? props.totalBooksFinished, icon: 'mdi-check-circle', color: 'success', label: 'Books finished' },
  { ref: pagesRef, value: pagesValue?.value ?? props.totalPagesRead, icon: 'mdi-file-document', color: 'info', label: 'Pages read', format: true },
  { ref: hoursRef, value: hoursValue?.value ?? props.totalHoursRead, icon: 'mdi-clock-outline', color: 'warning', label: 'Hours read' },
  { ref: ratingsRef, value: ratingsValue?.value ?? props.ratingsGiven, icon: 'mdi-star', color: 'amber', label: 'Ratings given' },
  { ref: readingRef, value: readingValue?.value ?? props.currentlyReadingCount, icon: 'mdi-book-open-page-variant', color: 'primary', label: 'Currently reading' },
  { ref: addedRef, value: addedValue?.value ?? props.addedToShelfCount, icon: 'mdi-bookshelf', color: 'secondary', label: 'Added to shelves' },
])
</script>

<template>
  <v-row>
    <v-col
      v-for="tile in tiles"
      :key="tile.label"
      cols="6"
      sm="4"
      md="2"
    >
      <div :ref="tile.ref as any">
        <v-card
          variant="tonal"
          :color="tile.color"
          class="h-100 pa-4 text-center"
        >
          <v-icon
            :icon="tile.icon"
            size="28"
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
    </v-col>
  </v-row>
</template>
