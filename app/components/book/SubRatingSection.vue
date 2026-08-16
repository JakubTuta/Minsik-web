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
const { t } = useI18n()
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

const dimensions = computed<DimensionConfig[]>(() => [
  {
    key: 'emotional_impact',
    label: t('rating.dimensions.emotionalImpact'),
    color: 'red',
    rgbColor: '244, 67, 54',
    descriptions: { 1: t('rating.descriptions.emotionalImpact.1'), 3: t('rating.descriptions.emotionalImpact.3'), 5: t('rating.descriptions.emotionalImpact.5') },
  },
  {
    key: 'intellectual_depth',
    label: t('rating.dimensions.intellectualDepth'),
    color: 'purple',
    rgbColor: '156, 39, 176',
    descriptions: { 1: t('rating.descriptions.intellectualDepth.1'), 3: t('rating.descriptions.intellectualDepth.3'), 5: t('rating.descriptions.intellectualDepth.5') },
  },
  {
    key: 'writing_quality',
    label: t('rating.dimensions.writingQuality'),
    color: 'teal',
    rgbColor: '0, 150, 136',
    descriptions: { 1: t('rating.descriptions.writingQuality.1'), 3: t('rating.descriptions.writingQuality.3'), 5: t('rating.descriptions.writingQuality.5') },
  },
  {
    key: 'rereadability',
    label: t('rating.dimensions.rereadability'),
    color: 'amber',
    rgbColor: '255, 193, 7',
    descriptions: { 1: t('rating.descriptions.rereadability.1'), 3: t('rating.descriptions.rereadability.3'), 5: t('rating.descriptions.rereadability.5') },
  },
  {
    key: 'pacing',
    label: t('rating.dimensions.pacing'),
    color: 'blue',
    rgbColor: '33, 150, 243',
    descriptions: { 1: t('rating.descriptions.pacing.1'), 3: t('rating.descriptions.pacing.3'), 5: t('rating.descriptions.pacing.5') },
  },
  {
    key: 'readability',
    label: t('rating.dimensions.readability'),
    color: 'green',
    rgbColor: '76, 175, 80',
    descriptions: { 1: t('rating.descriptions.readability.1'), 3: t('rating.descriptions.readability.3'), 5: t('rating.descriptions.readability.5') },
  },
  {
    key: 'plot_complexity',
    label: t('rating.dimensions.plotComplexity'),
    color: 'orange',
    rgbColor: '255, 152, 0',
    descriptions: { 1: t('rating.descriptions.plotComplexity.1'), 3: t('rating.descriptions.plotComplexity.3'), 5: t('rating.descriptions.plotComplexity.5') },
  },
  {
    key: 'humor',
    label: t('rating.dimensions.humor'),
    color: 'pink',
    rgbColor: '233, 30, 99',
    descriptions: { 1: t('rating.descriptions.humor.1'), 3: t('rating.descriptions.humor.3'), 5: t('rating.descriptions.humor.5') },
  },
])

function getAvg(key: string): number {
  const stat = props.stats[key]
  if (!stat)
    return 0

  return Number(stat.avg) || 0
}

function getDescription(dim: DimensionConfig): string {
  const avg = getAvg(dim.key)
  if (avg === 0)
    return t('rating.noRatingsYet')
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

const dimensionLabelColors = computed(() => dimensions.value.map(d => `rgb(${d.rgbColor})`))

const chartData = computed(() => ({
  labels: dimensions.value.map(d => d.label),
  datasets: [{
    label: t('rating.averageRating'),
    data: dimensions.value.map(d => getAvg(d.key)),
    backgroundColor: chartColors.value.fill,
    borderColor: chartColors.value.border,
    borderWidth: 2,
    borderJoinStyle: 'round',
    tension: 0.25,
    pointBackgroundColor: dimensions.value.map(d => `rgb(${d.rgbColor})`),
    pointBorderColor: dimensions.value.map(d => `rgb(${d.rgbColor})`),
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
        circular: true,
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
    {{ t('rating.detailedRatings') }}
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

              <span class="font-weight-medium">
                {{ dim.label }}
              </span>
            </div>

            <div class="text-medium-emphasis font-italic">
              {{ getDescription(dim) }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
