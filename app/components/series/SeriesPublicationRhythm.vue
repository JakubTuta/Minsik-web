<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { formatSeriesPosition } from '~/utils/format'

interface Props {
  books: BookSummary[]
}

const props = defineProps<Props>()

const { t } = useI18n()

const VIEW_WIDTH = 1104
const VIEW_HEIGHT = 150
const PADDING = 46
const AXIS_Y = 86

const dated = computed(() => props.books
  .filter(book => !!book.original_publication_year)
  .sort((a, b) => (a.original_publication_year ?? 0) - (b.original_publication_year ?? 0)))

const hasEnough = computed(() => dated.value.length >= 3)

const span = computed(() => {
  const years = dated.value.map(book => book.original_publication_year!)

  return { first: Math.min(...years), last: Math.max(...years) }
})

// A real year axis, not an index one: the uneven gaps are the point.
const points = computed(() => {
  const { first, last } = span.value
  const range = Math.max(1, last - first)

  return dated.value.map(book => ({
    book,
    year: book.original_publication_year!,
    x: PADDING + ((book.original_publication_year! - first) / range) * (VIEW_WIDTH - PADDING * 2),
  }))
})

interface Gap {
  from: number
  to: number
  years: number
  midX: number
  major: boolean
}

const gaps = computed<Gap[]>(() => {
  const list = points.value
  const raw: Gap[] = []

  for (let i = 1; i < list.length; i++) {
    const previous = list[i - 1]!
    const current = list[i]!
    const years = current.year - previous.year
    if (years <= 0)
      continue

    raw.push({
      from: previous.x,
      to: current.x,
      years,
      midX: (previous.x + current.x) / 2,
      major: false,
    })
  }

  const longest = Math.max(0, ...raw.map(gap => gap.years))

  return raw.map(gap => ({ ...gap, major: gap.years >= longest * 0.7 }))
})

const longestGap = computed(() => Math.max(0, ...gaps.value.map(gap => gap.years)))

const spanYears = computed(() => span.value.last - span.value.first)
</script>

<template>
  <div v-if="hasEnough">
    <SectionHeading
      :eyebrow="t('seriesPage.rhythmEyebrow')"
      :title="t('seriesPage.rhythmTitle')"
      :subtitle="t('seriesPage.rhythmSubtitle', {'years': spanYears})"
    >
      <template #actions>
        <v-chip variant="tonal">
          {{ t('seriesPage.rhythmLongestGap', {'years': longestGap}) }}
        </v-chip>
      </template>
    </SectionHeading>

    <v-card>
      <v-card-text>
        <div class="rhythm-scroll">
          <svg
            :viewBox="`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`"
            width="100%"
            :height="VIEW_HEIGHT"
            role="img"
            :aria-label="t('seriesPage.rhythmTitle')"
          >
            <path
              :d="`M${PADDING} ${AXIS_Y}H${VIEW_WIDTH - PADDING}`"
              stroke="currentColor"
              stroke-width="2"
              opacity="0.16"
            />

            <g
              v-for="gap in gaps"
              :key="`${gap.from}-${gap.to}`"
            >
              <path
                :d="`M${gap.from} 60H${gap.to}`"
                stroke="rgb(var(--v-theme-primary))"
                stroke-width="1.5"
                stroke-dasharray="4 4"
                :opacity="gap.major
                  ? 0.85
                  : 0.45"
              />

              <text
                :x="gap.midX"
                y="50"
                text-anchor="middle"
                font-size="10.5"
                font-weight="800"
                fill="rgb(var(--v-theme-primary))"
                :opacity="gap.major
                  ? 1
                  : 0.55"
              >{{ t('seriesPage.rhythmGapLabel', {'years': gap.years}) }}</text>
            </g>

            <g
              v-for="point in points"
              :key="point.book.book_id"
            >
              <circle
                :cx="point.x"
                :cy="AXIS_Y"
                r="7"
                fill="rgb(var(--v-theme-primary))"
              />

              <text
                :x="point.x"
                y="115"
                text-anchor="middle"
                font-size="11.5"
                font-weight="800"
                fill="rgb(var(--v-theme-primary))"
              >{{ formatSeriesPosition(point.book.series_position) }}</text>

              <text
                :x="point.x"
                y="134"
                text-anchor="middle"
                font-size="10.5"
                fill="rgba(var(--v-theme-on-surface), 0.6)"
              >{{ point.year }}</text>
            </g>
          </svg>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.rhythm-scroll {
  overflow-x: auto;
}

.rhythm-scroll svg {
  min-width: 640px;
}
</style>
