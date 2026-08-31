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
const { t, n } = useI18n()
const theme = useTheme()
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

interface AxisConfig {
  key: string
  label: string
  rgbColor: string
  descriptions: Record<1 | 3 | 5, string>
  poles?: { low: string, high: string }
}

interface Props {
  stats: Record<string, SubRatingStat>
  ratingCount: number
  slug: string
}

/**
 * Four axes say how well the book is done, four say what kind of book it is.
 * A high score on a quality axis is unambiguously good; a high score on a
 * character axis just means the book sits at that end of the spectrum, so the
 * two groups are read differently and are presented differently.
 */
const qualityAxes = computed<AxisConfig[]>(() => [
  {
    key: 'emotional_impact',
    label: t('rating.dimensions.emotionalImpact'),
    rgbColor: '244, 67, 54',
    descriptions: { 1: t('rating.descriptions.emotionalImpact.1'), 3: t('rating.descriptions.emotionalImpact.3'), 5: t('rating.descriptions.emotionalImpact.5') },
  },
  {
    key: 'intellectual_depth',
    label: t('rating.dimensions.intellectualDepth'),
    rgbColor: '156, 39, 176',
    descriptions: { 1: t('rating.descriptions.intellectualDepth.1'), 3: t('rating.descriptions.intellectualDepth.3'), 5: t('rating.descriptions.intellectualDepth.5') },
  },
  {
    key: 'writing_quality',
    label: t('rating.dimensions.writingQuality'),
    rgbColor: '0, 150, 136',
    descriptions: { 1: t('rating.descriptions.writingQuality.1'), 3: t('rating.descriptions.writingQuality.3'), 5: t('rating.descriptions.writingQuality.5') },
  },
  {
    key: 'rereadability',
    label: t('rating.dimensions.rereadability'),
    rgbColor: '255, 193, 7',
    descriptions: { 1: t('rating.descriptions.rereadability.1'), 3: t('rating.descriptions.rereadability.3'), 5: t('rating.descriptions.rereadability.5') },
  },
])

const characterAxes = computed<AxisConfig[]>(() => [
  {
    key: 'pacing',
    label: t('rating.dimensions.pacing'),
    rgbColor: '33, 150, 243',
    descriptions: { 1: t('rating.descriptions.pacing.1'), 3: t('rating.descriptions.pacing.3'), 5: t('rating.descriptions.pacing.5') },
    poles: { low: t('rating.hints.pacing.low'), high: t('rating.hints.pacing.high') },
  },
  {
    key: 'readability',
    label: t('rating.dimensions.readability'),
    rgbColor: '76, 175, 80',
    descriptions: { 1: t('rating.descriptions.readability.1'), 3: t('rating.descriptions.readability.3'), 5: t('rating.descriptions.readability.5') },
    poles: { low: t('rating.hints.readability.low'), high: t('rating.hints.readability.high') },
  },
  {
    key: 'plot_complexity',
    label: t('rating.dimensions.plotComplexity'),
    rgbColor: '255, 152, 0',
    descriptions: { 1: t('rating.descriptions.plotComplexity.1'), 3: t('rating.descriptions.plotComplexity.3'), 5: t('rating.descriptions.plotComplexity.5') },
    poles: { low: t('rating.hints.plotComplexity.low'), high: t('rating.hints.plotComplexity.high') },
  },
  {
    key: 'humor',
    label: t('rating.dimensions.humor'),
    rgbColor: '233, 30, 99',
    descriptions: { 1: t('rating.descriptions.humor.1'), 3: t('rating.descriptions.humor.3'), 5: t('rating.descriptions.humor.5') },
    poles: { low: t('rating.hints.humor.low'), high: t('rating.hints.humor.high') },
  },
])

const allAxes = computed(() => [...qualityAxes.value, ...characterAxes.value])

function getAvg(key: string): number {
  return Number(props.stats[key]?.avg) || 0
}

function getCount(key: string): number {
  return props.stats[key]?.count ?? 0
}

function getDescription(axis: AxisConfig): string {
  const avg = getAvg(axis.key)
  if (avg === 0)
    return t('rating.noRatingsYet')
  if (avg <= 2)
    return axis.descriptions[1]
  if (avg <= 3.5)
    return axis.descriptions[3]

  return axis.descriptions[5]
}

const scoredAxes = computed(() => allAxes.value.filter(axis => getAvg(axis.key) > 0))

const hasAnyScores = computed(() => scoredAxes.value.length > 0)

const countRange = computed(() => {
  const counts = scoredAxes.value.map(axis => getCount(axis.key)).filter(count => count > 0)
  if (counts.length === 0)
    return null

  const low = Math.min(...counts)
  const high = Math.max(...counts)

  return low === high
    ? t('rating.axisCountSingle', { count: n(low) })
    : t('rating.axisCountRange', { low: n(low), high: n(high) })
})

/**
 * One sentence built from the four character axes, which between them describe
 * what reading the book is like. Only axes with ratings contribute, so an
 * unrated book gets a shorter sentence rather than an invented one.
 */
const oneLineSummary = computed(() => {
  const fragments = characterAxes.value
    .filter(axis => getAvg(axis.key) > 0)
    .map((axis) => {
      const avg = getAvg(axis.key)
      const band = avg <= 2.5
        ? 'low'
        : avg <= 3.5
          ? 'mid'
          : 'high'

      return t(`rating.summaries.${axis.key}.${band}`)
    })

  if (fragments.length === 0)
    return null

  const sentence = fragments.join(t('rating.summaryJoin'))

  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`
})

const CHART_FONT_FAMILY = `Figtree, 'Segoe UI', system-ui, sans-serif`

/**
 * Chart.js measures the axis labels once, with whatever font the canvas has at
 * first draw. Drawing before Figtree arrives measures them in the fallback face
 * and the real, wider labels then overflow the canvas — which is why the labels
 * were clipped on a cold load and fine once the font was cached. Waiting for the
 * font makes that first measurement the correct one.
 */
const fontReady = ref(false)

onMounted(async () => {
  try {
    // `fonts.ready` alone can settle before a face nothing has painted yet is
    // even requested, so ask for this exact face and then wait for the set.
    await Promise.all([
      document.fonts.load(`500 12px ${CHART_FONT_FAMILY}`),
      document.fonts.ready,
    ])
  }
  catch {
    // No Font Loading API: draw with whatever is available.
  }
  fontReady.value = true
})

const isDark = computed(() => theme.global.current.value.dark)

const chartColors = computed(() => (isDark.value
  ? { fill: 'rgba(100, 181, 246, 0.5)', border: 'rgba(144, 202, 249, 0.8)', gridText: 'rgba(255, 255, 255, 0.3)' }
  : { fill: 'rgba(33, 150, 243, 0.5)', border: 'rgba(63, 81, 181, 0.8)', gridText: 'rgba(0, 0, 0, 0.3)' }))

const dimensionLabelColors = computed(() => allAxes.value.map(axis => `rgb(${axis.rgbColor})`))

const chartData = computed(() => ({
  labels: allAxes.value.map(axis => axis.label),
  datasets: [{
    label: t('rating.averageRating'),
    data: allAxes.value.map(axis => getAvg(axis.key)),
    backgroundColor: chartColors.value.fill,
    borderColor: chartColors.value.border,
    borderWidth: 2,
    borderJoinStyle: 'round',
    tension: 0.25,
    pointBackgroundColor: dimensionLabelColors.value,
    pointBorderColor: dimensionLabelColors.value,
    pointRadius: 5,
    pointHoverRadius: 7,
    fill: true,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1,
  // The radar shrinks its own radius to fit the axis labels, so the canvas needs
  // only enough slack for the descenders — anything more is wasted as a ring of
  // empty space around the web.
  layout: { padding: 2 },
  scales: {
    r: {
      beginAtZero: true,
      min: 0,
      max: 5,
      ticks: { stepSize: 1, display: false },
      grid: { color: chartColors.value.gridText, circular: true },
      angleLines: { color: chartColors.value.gridText },
      pointLabels: {
        padding: 4,
        font: { size: 12, weight: 500, family: CHART_FONT_FAMILY },
        color: (ctx: any) => dimensionLabelColors.value[ctx.index] || 'rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: {
    tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw.toFixed(1)}` } },
    legend: { display: false },
  },
}))
</script>

<template>
  <div>
    <SectionHeading
      :eyebrow="t('rating.eightAxesEyebrow')"
      :title="t('rating.eightAxesTitle')"
      :subtitle="t('rating.eightAxesSubtitle')"
    >
      <template
        v-if="countRange"
        #actions
      >
        <v-chip variant="tonal">
          {{ countRange }}
        </v-chip>
      </template>
    </SectionHeading>

    <v-card>
      <v-card-text>
        <v-alert
          v-if="!hasAnyScores"
          type="info"
          variant="tonal"
          class="mb-6"
        >
          {{ t('rating.noAxesYet') }}
        </v-alert>

        <v-row align="center">
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center justify-center"
          >
            <div class="radar-box">
              <ClientOnly>
                <Radar
                  v-if="fontReady"
                  :data="chartData"
                  :options="chartOptions"
                />
              </ClientOnly>
            </div>
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <template v-if="oneLineSummary">
              <div class="text-overline text-medium-emphasis mb-2">
                {{ t('rating.inOneLine') }}
              </div>

              <p class="font-reading text-h6 mb-8">
                {{ oneLineSummary }}
              </p>
            </template>

            <div class="text-overline text-medium-emphasis mb-4">
              {{ t('rating.qualityAxesHeading') }}
            </div>

            <v-row dense>
              <v-col
                v-for="axis in qualityAxes"
                :key="axis.key"
                cols="12"
                class="mb-3"
              >
                <div class="d-flex justify-space-between align-baseline">
                  <span class="text-body-2 font-weight-bold">{{ axis.label }}</span>

                  <span
                    class="tabular text-body-1 font-weight-bold"
                    :style="{'color': `rgb(${axis.rgbColor})`}"
                  >{{ getAvg(axis.key).toFixed(1) }}</span>
                </div>

                <div class="axis-track my-2">
                  <div
                    class="axis-fill"
                    :style="{'width': `${getAvg(axis.key) / 5 * 100}%`,
                             'background': `rgb(${axis.rgbColor})`}"
                  />
                </div>

                <div class="d-flex justify-space-between text-caption text-medium-emphasis gap-2">
                  <i>{{ getDescription(axis) }}</i>

                  <span
                    v-if="getCount(axis.key) > 0"
                    class="tabular flex-shrink-0"
                  >{{ n(getCount(axis.key)) }}</span>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <div class="text-overline text-medium-emphasis mb-5">
          {{ t('rating.characterAxesHeading') }}
        </div>

        <v-row>
          <v-col
            v-for="axis in characterAxes"
            :key="axis.key"
            cols="12"
            md="6"
            class="mb-3"
          >
            <div class="d-flex justify-space-between mb-3 align-baseline">
              <span class="text-body-2 font-weight-bold">{{ axis.label }}</span>

              <span
                v-if="getCount(axis.key) > 0"
                class="tabular text-caption text-medium-emphasis"
              >{{ t('rating.axisRatings', {'count': n(getCount(axis.key))}) }}</span>
            </div>

            <div class="spectrum-track">
              <div
                v-if="getAvg(axis.key) > 0"
                class="spectrum-knob"
                :style="{'left': `${getAvg(axis.key) / 5 * 100}%`,
                         'background': `rgb(${axis.rgbColor})`}"
              />
            </div>

            <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis mt-3 gap-3">
              <span>{{ axis.poles!.low }}</span>

              <b
                class="tabular"
                :style="{'color': `rgb(${axis.rgbColor})`}"
              >{{ getAvg(axis.key) > 0
                ? getAvg(axis.key).toFixed(1)
                : '–' }}</b>

              <span>{{ axis.poles!.high }}</span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.radar-box {
  width: 100%;
  max-width: 440px;
}

.axis-track {
  height: 8px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.1);
  overflow: hidden;
}

.axis-fill {
  height: 100%;
  border-radius: 999px;
}

.spectrum-track {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-on-surface), 0.1),
    rgba(var(--v-theme-primary), 0.6)
  );
}

.spectrum-knob {
  position: absolute;
  top: -6px;
  width: 17px;
  height: 17px;
  margin-left: -8px;
  border-radius: 999px;
  border: 3px solid rgb(var(--v-theme-surface));
  box-shadow: 0 3px 8px -3px rgba(0, 0, 0, 0.5);
}
</style>
