<script setup lang="ts">
import type { YearBook } from '~/types/yearInReview'

interface Props {
  longestBook: YearBook | null
  shortestBook: YearBook | null
  firstFinished: YearBook | null
  highestRated: YearBook | null
  averagePagesPerBook: number
  busiestMonth: number
  busiestMonthCount: number
  averageDaysToFinish: number
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

interface BookFact {
  key: string
  icon: string
  label: string
  book: YearBook
}

const bookFacts = computed<BookFact[]>(() => {
  const facts: BookFact[] = []
  if (props.longestBook) {
    facts.push({ key: 'longest', icon: 'mdi-book-open-page-variant', label: 'Longest book', book: props.longestBook })
  }
  if (props.shortestBook && props.shortestBook.book_slug !== props.longestBook?.book_slug) {
    facts.push({ key: 'shortest', icon: 'mdi-book', label: 'Shortest book', book: props.shortestBook })
  }
  if (props.firstFinished) {
    facts.push({ key: 'first', icon: 'mdi-flag-checkered', label: 'First finished', book: props.firstFinished })
  }
  if (props.highestRated && props.highestRated.my_rating !== null) {
    facts.push({ key: 'highest', icon: 'mdi-trophy', label: 'Highest rated', book: props.highestRated })
  }

  return facts
})

interface NumberFact {
  key: string
  icon: string
  label: string
  value: string
}

const numberFacts = computed<NumberFact[]>(() => {
  const facts: NumberFact[] = []
  if (props.averagePagesPerBook > 0) {
    facts.push({ key: 'avg-pages', icon: 'mdi-file-document-outline', label: 'Average book length', value: `${Math.round(props.averagePagesPerBook)} pages` })
  }
  if (props.busiestMonthCount > 0) {
    facts.push({ key: 'busiest', icon: 'mdi-fire', label: 'Busiest month', value: `${monthNames[props.busiestMonth - 1]} (${props.busiestMonthCount} ${props.busiestMonthCount === 1
      ? 'book'
      : 'books'})` })
  }
  if (props.averageDaysToFinish > 0) {
    facts.push({ key: 'pace', icon: 'mdi-clock-fast', label: 'Average pace', value: `${Math.round(props.averageDaysToFinish)} days per book` })
  }

  return facts
})

const gridRef = ref<HTMLElement | null>(null)

useScrollReveal(gridRef, { stagger: 0.1 })
</script>

<template>
  <v-card v-if="bookFacts.length > 0 || numberFacts.length > 0">
    <v-card-text>
      <h2 class="text-h6 font-weight-bold mb-4">
        Fun facts
      </h2>

      <div
        ref="gridRef"
        class="fact-grid"
      >
        <NuxtLink
          v-for="fact in bookFacts"
          :key="fact.key"
          :to="`/books/${fact.book.book_slug}`"
          class="text-decoration-none"
        >
          <v-card
            variant="tonal"
            color="primary"
            class="d-flex ga-3 h-100 pa-3"
          >
            <v-img
              :src="fact.book.book_cover_url"
              lazy-src="/placeholder-book-lazy.jpg"
              :alt="fact.book.book_title"
              width="56"
              height="84"
              cover
              class="flex-shrink-0 rounded"
            />

            <div class="min-w-0">
              <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis d-flex align-center ga-1">
                <v-icon
                  :icon="fact.icon"
                  size="14"
                />
                {{ fact.label }}
              </div>

              <div class="text-body-2 font-weight-medium mt-1 text-truncate">
                {{ fact.book.book_title }}
              </div>

              <div
                v-if="fact.book.author_names.length"
                class="text-caption text-medium-emphasis text-truncate"
              >
                {{ fact.book.author_names.join(', ') }}
              </div>
            </div>
          </v-card>
        </NuxtLink>

        <v-card
          v-for="fact in numberFacts"
          :key="fact.key"
          variant="tonal"
          class="d-flex flex-column h-100 justify-center pa-3"
        >
          <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis d-flex align-center ga-1">
            <v-icon
              :icon="fact.icon"
              size="14"
            />
            {{ fact.label }}
          </div>

          <div class="text-body-1 font-weight-medium mt-1">
            {{ fact.value }}
          </div>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.fact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
</style>
