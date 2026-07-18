<script setup lang="ts">
import type { MonthlyBucket } from '~/types/yearInReview'

interface Props {
  monthly: MonthlyBucket[]
}

const props = defineProps<Props>()

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

const railRef = ref<HTMLElement | null>(null)

useScrollReveal(railRef, { stagger: 0.14 })

const months = computed(() => props.monthly.map(m => ({
  ...m,
  name: monthNames[m.month - 1],
  isQuiet: m.books.length === 0,
})))
</script>

<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-6">
      Your reading timeline
    </h2>

    <div
      ref="railRef"
      class="timeline"
    >
      <div
        v-for="month in months"
        :key="month.month"
        class="timeline-row"
        :class="{'is-quiet': month.isQuiet}"
      >
        <div class="timeline-marker">
          <div class="timeline-dot" />
        </div>

        <div class="timeline-content">
          <div class="d-flex align-center ga-3 mb-3">
            <span class="text-h6 font-weight-bold">{{ month.name }}</span>

            <v-chip
              v-if="!month.isQuiet"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ month.books_finished }} {{ month.books_finished === 1
                ? 'book'
                : 'books' }}
            </v-chip>
          </div>

          <div
            v-if="month.isQuiet"
            class="text-body-2 text-medium-emphasis font-italic"
          >
            A quiet month
          </div>

          <div
            v-else
            class="covers-flow"
          >
            <YearReviewBookCover
              v-for="book in month.books"
              :key="book.book_slug"
              :book="book"
              :width="120"
              show-rating
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  position: relative;
}

.timeline-row {
  position: relative;
  display: flex;
  gap: 20px;
  padding-bottom: 32px;
}

.timeline-marker {
  position: relative;
  flex-shrink: 0;
  width: 16px;
  display: flex;
  justify-content: center;
}

.timeline-marker::before {
  content: '';
  position: absolute;
  top: 6px;
  bottom: -32px;
  width: 2px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
}

.timeline-row:last-child .timeline-marker::before {
  display: none;
}

.timeline-dot {
  position: relative;
  z-index: 1;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-top: 4px;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.18);
}

.timeline-row.is-quiet .timeline-dot {
  background: rgba(var(--v-border-color), 0.9);
  box-shadow: none;
}

.timeline-content {
  flex-grow: 1;
  min-width: 0;
  padding-bottom: 8px;
}

.covers-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>
