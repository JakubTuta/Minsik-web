<script setup lang="ts">
import type { MonthlyBucket } from '~/types/yearInReview'

interface Props {
  monthly: MonthlyBucket[]
}

const props = defineProps<Props>()

const gridRef = ref<HTMLElement | null>(null)

useScrollReveal(gridRef, { stagger: 0.12 })

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const cards = computed(() => props.monthly.map(m => ({
  ...m,
  name: monthNames[m.month - 1],
  isQuiet: m.books_finished === 0,
})))
</script>

<template>
  <v-card>
    <v-card-text>
      <h2 class="text-h6 font-weight-bold mb-4">
        Monthly breakdown
      </h2>

      <div
        ref="gridRef"
        class="month-grid"
      >
        <v-card
          v-for="card in cards"
          :key="card.month"
          variant="tonal"
          :color="card.isQuiet
            ? undefined
            : 'primary'"
          class="pa-3"
        >
          <div class="text-overline font-weight-bold">
            {{ card.name }}
          </div>

          <template v-if="card.isQuiet">
            <div class="text-body-2 text-medium-emphasis mt-2">
              A quiet month
            </div>
          </template>

          <template v-else>
            <div class="text-h5 font-weight-bold mt-1">
              {{ card.books_finished }} {{ card.books_finished === 1
                ? 'book'
                : 'books' }}
            </div>

            <div class="text-body-2 text-medium-emphasis mt-1">
              {{ card.pages_read.toLocaleString() }} pages
              <template v-if="card.ratings_given > 0">
                · {{ card.ratings_given }} {{ card.ratings_given === 1
                  ? 'rating'
                  : 'ratings' }}
              </template>
            </div>
          </template>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.month-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
</style>
