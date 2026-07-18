<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import type { MonthlyBucket } from '~/types/yearInReview'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { useTheme } from 'vuetify'

interface Props {
  monthly: MonthlyBucket[]
}

const props = defineProps<Props>()

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const theme = useTheme()

type Metric = 'books_finished' | 'pages_read' | 'ratings_given'

const metric = ref<Metric>('books_finished')

const metricOptions: { value: Metric, label: string, icon: string }[] = [
  { value: 'books_finished', label: 'Books', icon: 'mdi-book' },
  { value: 'pages_read', label: 'Pages', icon: 'mdi-file-document' },
  { value: 'ratings_given', label: 'Ratings', icon: 'mdi-star' },
]

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const primaryColor = computed(() => theme.current.value.colors.primary)

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.monthly.map(m => monthLabels[m.month - 1]),
  datasets: [
    {
      data: props.monthly.map(m => m[metric.value]),
      backgroundColor: primaryColor.value,
      borderRadius: 6,
      maxBarThickness: 48,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
    },
  },
}))
</script>

<template>
  <v-card>
    <v-card-text>
      <div class="d-flex align-center justify-space-between ga-2 mb-4 flex-wrap">
        <h2 class="text-h6 font-weight-bold">
          Month by month
        </h2>

        <v-btn-toggle
          v-model="metric"
          density="compact"
          color="primary"
          variant="outlined"
          mandatory
        >
          <v-btn
            v-for="opt in metricOptions"
            :key="opt.value"
            :value="opt.value"
            :prepend-icon="opt.icon"
            size="small"
          >
            {{ opt.label }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <ClientOnly>
        <div class="chart-container">
          <Bar
            :data="chartData"
            :options="chartOptions"
          />
        </div>
      </ClientOnly>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 280px;
  width: 100%;
}
</style>
