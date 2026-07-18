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

interface Award {
  key: string
  icon: string
  label: string
  tooltip: string
  accent: string
  book: YearBook
  caption: string
}

const awards = computed<Award[]>(() => {
  const out: Award[] = []
  if (props.longestBook) {
    out.push({ key: 'longest', icon: 'mdi-book-open-page-variant', label: 'Chunkiest read', tooltip: 'Your longest book this year', accent: 'deep-purple', book: props.longestBook, caption: `${props.longestBook.number_of_pages.toLocaleString()} pages` })
  }
  if (props.shortestBook && props.shortestBook.book_slug !== props.longestBook?.book_slug) {
    out.push({ key: 'shortest', icon: 'mdi-flash', label: 'Quick escape', tooltip: 'Your shortest book this year', accent: 'teal', book: props.shortestBook, caption: `${props.shortestBook.number_of_pages.toLocaleString()} pages` })
  }
  if (props.firstFinished) {
    out.push({ key: 'first', icon: 'mdi-flag-checkered', label: 'First finish', tooltip: 'First book you finished this year', accent: 'blue', book: props.firstFinished, caption: 'Kicked off the year' })
  }
  if (props.highestRated && props.highestRated.my_rating !== null) {
    out.push({ key: 'highest', icon: 'mdi-trophy', label: 'Top rated', tooltip: 'Your highest-rated book this year', accent: 'amber', book: props.highestRated, caption: `You gave it ${props.highestRated.my_rating.toFixed(1)} stars` })
  }

  return out
})

interface Stat {
  key: string
  icon: string
  label: string
  value: string
  accent: string
}

const stats = computed<Stat[]>(() => {
  const out: Stat[] = []
  if (props.averagePagesPerBook > 0) {
    out.push({ key: 'avg-pages', icon: 'mdi-file-document-outline', label: 'Average length', value: `${Math.round(props.averagePagesPerBook).toLocaleString()} pages`, accent: 'indigo' })
  }
  if (props.busiestMonthCount > 0) {
    out.push({ key: 'busiest', icon: 'mdi-fire', label: 'Busiest month', value: `${monthNames[props.busiestMonth - 1]}`, accent: 'deep-orange' })
  }
  if (props.averageDaysToFinish > 0) {
    out.push({ key: 'pace', icon: 'mdi-clock-fast', label: 'Reading pace', value: `${Math.round(props.averageDaysToFinish)} days / book`, accent: 'cyan' })
  }

  return out
})

const gridRef = ref<HTMLElement | null>(null)

useScrollReveal(gridRef, { stagger: 0.1 })
</script>

<template>
  <div v-if="awards.length > 0 || stats.length > 0">
    <h2 class="text-h5 font-weight-bold mb-6">
      Highlights
    </h2>

    <div
      ref="gridRef"
      class="highlights-grid"
    >
      <NuxtLink
        v-for="award in awards"
        :key="award.key"
        :to="`/books/${award.book.book_slug}`"
        class="text-decoration-none"
      >
        <div class="tile award-tile">
          <v-img
            :src="award.book.book_cover_url"
            lazy-src="/placeholder-book-lazy.jpg"
            :alt="award.book.book_title"
            cover
            class="tile-img"
          />

          <div class="award-overlay" />

          <v-tooltip
            :text="award.tooltip"
            location="top"
          >
            <template #activator="{'props': tip}">
              <v-chip
                v-bind="tip"
                :color="award.accent"
                size="small"
                variant="flat"
                class="tile-ribbon font-weight-bold"
              >
                <v-icon
                  :icon="award.icon"
                  size="14"
                  start
                />
                {{ award.label }}
              </v-chip>
            </template>
          </v-tooltip>

          <div class="award-info">
            <div class="text-body-2 font-weight-bold text-truncate">
              {{ award.book.book_title }}
            </div>

            <div class="text-caption text-truncate opacity-80">
              {{ award.caption }}
            </div>
          </div>
        </div>
      </NuxtLink>

      <div
        v-for="stat in stats"
        :key="stat.key"
        class="tile stat-tile d-flex flex-column align-center justify-center pa-4 text-center"
      >
        <v-avatar
          :color="stat.accent"
          variant="flat"
          size="52"
          class="mb-3"
        >
          <v-icon
            :icon="stat.icon"
            size="26"
          />
        </v-avatar>

        <div class="text-h6 font-weight-bold">
          {{ stat.value }}
        </div>

        <div class="text-caption text-uppercase text-medium-emphasis font-weight-medium mt-1">
          {{ stat.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}

.tile {
  position: relative;
  aspect-ratio: 0.72;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
  transition: transform 0.25s ease;
}

.tile:hover {
  transform: translateY(-6px);
}

.tile-img {
  width: 100%;
  height: 100%;
}

.award-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, transparent 35%, rgba(0, 0, 0, 0.85) 100%);
}

.tile-ribbon {
  position: absolute;
  top: 12px;
  left: 12px;
}

.award-info {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  color: #fff;
}

.stat-tile {
  background: linear-gradient(
    160deg,
    rgba(var(--v-theme-surface-variant), 0.55) 0%,
    rgba(var(--v-theme-surface-variant), 0.2) 100%
  );
}
</style>
