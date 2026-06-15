<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import type { BookSummary } from '~/types/api'
import {
  CategoryScale,

  Chart as ChartJS,

  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useTheme } from 'vuetify'
import { weightedRating } from '~/utils/format'

const props = defineProps<Props>()

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

interface Props {
  books: BookSummary[]
}

const theme = useTheme()

const sortedBooks = computed(() => [...props.books].sort((a, b) => {
  const ap = a.series_position ?? Infinity
  const bp = b.series_position ?? Infinity

  return ap - bp
}),
)

function bookWeightedRating(b: BookSummary): number {
  return weightedRating(
    Number(b.avg_rating) || 0,
    b.rating_count || 0,
    Number(b.ol_avg_rating) || 0,
    b.ol_rating_count || 0,
  )
}

const ratings = computed(() => sortedBooks.value.map(b => bookWeightedRating(b)))

const minRating = computed(() => Math.floor((Math.min(...ratings.value) - 0.4) * 10) / 10)
const maxRating = computed(() => Math.ceil((Math.max(...ratings.value) + 0.4) * 10) / 10)

const primaryColor = computed(() => theme.current.value.colors.primary)

const positionPlugin = {
  id: 'positionLabels',
  afterDatasetsDraw(chart: any) {
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)
    ctx.save()
    ctx.font = 'bold 11px sans-serif'
    ctx.fillStyle = theme.current.value.colors['on-surface'] ?? '#888'
    ctx.textAlign = 'center'
    meta.data.forEach((point: any, i: number) => {
      const book = sortedBooks.value[i]
      if (!book?.series_position)
        return
      const pos = Number(book.series_position)
      if (!Number.isFinite(pos))
        return
      const label = `#${Number.isInteger(pos)
        ? pos
        : pos.toFixed(1)}`
      ctx.fillText(label, point.x, point.y - 14)
    })
    ctx.restore()
  },
}

const chartData = computed<ChartData<'line'>>(() => ({
  labels: sortedBooks.value.map(b => b.original_publication_year?.toString() ?? b.title),
  datasets: [
    {
      data: ratings.value,
      borderColor: primaryColor.value,
      backgroundColor: primaryColor.value,
      pointBackgroundColor: primaryColor.value,
      pointBorderColor: primaryColor.value,
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2,
      tension: 0,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 20 } },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: ctx => sortedBooks.value[ctx[0].dataIndex]?.title ?? '',
        label: ctx => ` ${ctx.parsed.y.toFixed(2)} ★`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      min: minRating.value,
      max: maxRating.value,
      ticks: { stepSize: 0.2 },
    },
  },
}))

interface StatEntry {
  keyword: string
  position: string
  title: string
  rating: number
  comment: string
  icon?: string
}

const seriesStats = computed<StatEntry[]>(() => {
  const books = sortedBooks.value
  if (books.length === 0)
    return []

  const entries: StatEntry[] = []

  const fmtPos = (b: BookSummary) => {
    const pos = b.series_position
    if (!pos)
      return ''
    const n = Number(pos)

    return `#${Number.isInteger(n)
      ? n
      : n.toFixed(1)}`
  }

  const ratingOf = (b: BookSummary) => bookWeightedRating(b)

  const first = books[0]
  const last = books.at(-1)

  entries.push({
    keyword: 'beginning',
    position: fmtPos(first),
    title: first.title,
    rating: ratingOf(first),
    comment: ratingOf(first) >= 3
      ? 'strong start'
      : 'tough start',
  })

  if (books.length > 2) {
    let peakIdx = 0
    for (let i = 1; i < books.length; i++) {
      if (ratingOf(books[i]) > ratingOf(books[peakIdx]))
        peakIdx = i
    }
    if (peakIdx !== 0 && peakIdx !== books.length - 1) {
      const peak = books[peakIdx]
      entries.push({
        keyword: 'peak',
        position: fmtPos(peak),
        title: peak.title,
        rating: ratingOf(peak),
        comment: 'best book in series',
      })
    }
  }

  if (books.length > 2) {
    let dipIdx = 0
    for (let i = 1; i < books.length; i++) {
      if (ratingOf(books[i]) < ratingOf(books[dipIdx]))
        dipIdx = i
    }
    if (dipIdx !== 0 && dipIdx !== books.length - 1) {
      const dip = books[dipIdx]
      const rating = ratingOf(dip)
      entries.push({
        keyword: rating >= 3
          ? 'dip'
          : 'the pit',
        position: fmtPos(dip),
        title: dip.title,
        rating,
        comment: '',
      })
    }
  }

  entries.push({
    keyword: 'finale',
    position: fmtPos(last),
    title: last.title,
    rating: ratingOf(last),
    comment: ratingOf(last) >= 3
      ? 'sticks the landing'
      : 'messes up the ending',
  })

  const mean = ratings.value.reduce((s, r) => s + r, 0) / ratings.value.length
  const deltas = ratings.value.slice(1).map((r, i) => r - ratings.value[i])
  const signChanges = deltas.slice(1).filter((d, i) => Math.sign(d) !== Math.sign(deltas[i]) && d !== 0 && deltas[i] !== 0).length

  let trendIcon: string
  let trendComment: string

  const allUp = deltas.every(d => d >= 0) && ratingOf(last) > ratingOf(first)
  const allDown = deltas.every(d => d <= 0) && ratingOf(first) > ratingOf(last)

  if (allUp) {
    trendIcon = 'mdi-trending-up'
    trendComment = 'getting stronger with each book'
  }
  else if (allDown) {
    trendIcon = 'mdi-trending-down'
    trendComment = 'better in the beginning'
  }
  else if (mean >= 4.3) {
    trendIcon = 'mdi-star'
    trendComment = 'it\'s peak'
  }
  else if (mean <= 2) {
    trendIcon = 'mdi-emoticon-sad-outline'
    trendComment = 'maybe series needed more care'
  }
  else if (signChanges >= 2) {
    trendIcon = 'mdi-chart-bell-curve-cumulative'
    trendComment = 'it\'s a rollercoaster'
  }
  else {
    trendIcon = 'mdi-chart-line'
    trendComment = 'steady throughout'
  }

  entries.push({
    keyword: 'overall',
    position: '',
    title: '',
    rating: mean,
    comment: trendComment,
    icon: trendIcon,
  })

  return entries
})
</script>

<template>
  <v-card v-if="books.length >= 2">
    <v-card-text>
      <h2 class="text-h5 font-weight-bold mb-4">
        How the series evolves
      </h2>

      <ClientOnly>
        <div class="chart-container">
          <Line
            :data="chartData"
            :options="chartOptions"
            :plugins="[positionPlugin]"
          />
        </div>
      </ClientOnly>

      <v-divider class="my-4" />

      <!-- Summary stats row -->
      <div class="d-flex justify-space-between flex-wrap gap-4">
        <div
          v-for="entry in seriesStats"
          :key="entry.keyword"
          class="d-flex flex-column stat-entry flex-1"
        >
          <div class="text-overline font-weight-bold text-primary text-uppercase">
            {{ entry.keyword }}
          </div>

          <div
            v-if="entry.position || entry.title"
            class="text-body-1 font-weight-bold mt-1"
          >
            {{ entry.position }}<span v-if="entry.position && entry.title">&nbsp;</span>{{ entry.title }}
          </div>

          <div class="d-flex align-center text-body-2 text-medium-emphasis mt-1 gap-1">
            <v-icon
              v-if="entry.icon"
              :icon="entry.icon"
              size="small"
            />

            <span class="font-weight-medium">{{ entry.rating.toFixed(1) }}</span>

            <v-icon
              icon="mdi-star"
              size="x-small"
              color="warning"
            />

            <span
              v-if="entry.comment"
              class="ml-1"
            >· {{ entry.comment }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 220px;
  width: 100%;
}

.stat-entry {
  min-width: 140px;
}
</style>
