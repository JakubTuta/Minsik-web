<script setup lang="ts">
import type { SubRatingStat } from '~/types/api'
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'
import { Radar } from 'vue-chartjs'
import { useTheme } from 'vuetify'

const props = defineProps<Props>()
const theme = useTheme()
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

interface DimensionConfig {
  key: string
  label: string
  color: string
  rgbColor: string
  descriptions: Record<1 | 3 | 5, string>
}

interface Props {
  stats: Record<string, SubRatingStat>
  ratingCount: number
  slug: string
}

const dimensions: DimensionConfig[] = [
  {
    key: 'emotional_impact',
    label: 'Emotional Impact',
    color: 'red',
    rgbColor: '244, 67, 54',
    descriptions: { 1: 'Leaves little emotional impression', 3: 'Moderately engaging emotionally', 5: 'Deeply moving and unforgettable' },
  },
  {
    key: 'intellectual_depth',
    label: 'Intellectual Depth',
    color: 'purple',
    rgbColor: '156, 39, 176',
    descriptions: { 1: 'Light, surface-level content', 3: 'Some thought-provoking ideas', 5: 'Profoundly deep and philosophical' },
  },
  {
    key: 'writing_quality',
    label: 'Writing Quality',
    color: 'teal',
    rgbColor: '0, 150, 136',
    descriptions: { 1: 'Below average prose', 3: 'Competent and clear writing', 5: 'Masterfully crafted language' },
  },
  {
    key: 'rereadability',
    label: 'Rereadability',
    color: 'amber',
    rgbColor: '255, 193, 7',
    descriptions: { 1: 'A one-time read', 3: 'Might revisit someday', 5: 'Worth rereading many times' },
  },
  {
    key: 'pacing',
    label: 'Pacing',
    color: 'blue',
    rgbColor: '33, 150, 243',
    descriptions: { 1: 'Slow and deliberate', 3: 'Balanced pacing throughout', 5: 'Fast-paced and gripping' },
  },
  {
    key: 'readability',
    label: 'Readability',
    color: 'green',
    rgbColor: '76, 175, 80',
    descriptions: { 1: 'Dense and challenging to read', 3: 'Moderate difficulty level', 5: 'Light and easy to read' },
  },
  {
    key: 'plot_complexity',
    label: 'Plot Complexity',
    color: 'orange',
    rgbColor: '255, 152, 0',
    descriptions: { 1: 'Simple and straightforward story', 3: 'Moderately layered plot', 5: 'Complex and multi-layered narrative' },
  },
  {
    key: 'humor',
    label: 'Humor',
    color: 'pink',
    rgbColor: '233, 30, 99',
    descriptions: { 1: 'This book is serious', 3: 'Has some lighter moments', 5: 'Genuinely funny throughout' },
  },
]

function getAvg(key: string): number {
  const stat = props.stats[key]
  if (!stat?.avg)
    return 0

  return Number.parseFloat(stat.avg)
}

function getDescription(dim: DimensionConfig): string {
  const avg = getAvg(dim.key)
  if (avg === 0)
    return 'No ratings yet'
  if (avg <= 2)
    return dim.descriptions[1]
  if (avg <= 3.5)
    return dim.descriptions[3]

  return dim.descriptions[5]
}

const isDark = computed(() => theme.global.current.value.dark)

const chartColors = computed(() => {
  const colors = isDark.value
    ? {
        fill: 'rgba(100, 181, 246, 0.5)',
        border: 'rgba(144, 202, 249, 0.8)',
        gridText: 'rgba(255, 255, 255, 0.3)',
      }
    : {
        fill: 'rgba(33, 150, 243, 0.5)',
        border: 'rgba(63, 81, 181, 0.8)',
        gridText: 'rgba(0, 0, 0, 0.3)',
      }

  return colors
})

const dimensionLabelColors = computed(() => dimensions.map(d => `rgb(${d.rgbColor})`))

// Radar chart data
const chartData = computed(() => ({
  labels: dimensions.map(d => d.label),
  datasets: [{
    label: 'Average Rating',
    data: dimensions.map(d => getAvg(d.key)),
    backgroundColor: chartColors.value.fill,
    borderColor: chartColors.value.border,
    borderWidth: 2,
    borderJoinStyle: 'round',
    tension: 0.1,
    pointBackgroundColor: dimensions.map(d => `rgb(${d.rgbColor})`),
    pointBorderColor: dimensions.map(d => `rgb(${d.rgbColor})`),
    pointRadius: 5,
    pointHoverRadius: 7,
    fill: true,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    r: {
      beginAtZero: true,
      min: 0,
      max: 5,
      ticks: {
        stepSize: 1,
        display: false,
      },
      grid: {
        color: chartColors.value.gridText,
      },
      angleLines: {
        color: chartColors.value.gridText,
      },
      pointLabels: {
        font: { size: 12, weight: 500 },
        color: (ctx: any) => dimensionLabelColors.value[ctx.index] || 'rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.raw.toFixed(1)}`,
      },
    },
    legend: {
      display: false,
    },
  },
}))
</script>

<template>
  <h2 class="text-h6 font-weight-bold">
    Detailed Ratings
  </h2>

  <v-row no-gutters>
    <!-- Radar Chart -->
    <v-col
      cols="12"
      md="7"
      class="d-flex align-center justify-center py-0"
    >
      <div style="max-width: 480px; width: 100%;">
        <ClientOnly>
          <Radar
            :data="chartData"
            :options="chartOptions"
          />
        </ClientOnly>
      </div>
    </v-col>

    <!-- Dimensions List (2 columns) -->
    <v-col
      cols="12"
      md="5"
      class="d-flex align-center"
    >
      <v-row dense>
        <v-col
          v-for="dim in dimensions"
          :key="dim.key"
          cols="6"
        >
          <div class="mb-3">
            <div class="d-flex align-center gap-1">
              <span
                class="text-body-1 font-weight-bold"
                :class="`text-${dim.color}`"
              >
                {{ getAvg(dim.key).toFixed(1) }}
              </span>

              <span class="text-caption font-weight-medium">
                {{ dim.label }}
              </span>
            </div>

            <div class="text-caption text-medium-emphasis font-italic">
              {{ getDescription(dim) }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
