<script setup lang="ts">
import type { AuthorStats } from '~/types/api'

interface Props {
  stats: AuthorStats
}

const props = defineProps<Props>()

const { t, n } = useI18n()
const genreLabel = useGenreLabel()

const firstYear = computed(() => props.stats.first_publication_year ?? 0)
const lastYear = computed(() => props.stats.last_publication_year ?? 0)
const spanYears = computed(() => Math.max(0, lastYear.value - firstYear.value))

// Two decades read as two fat bars and say nothing, so a short career is
// bucketed by year instead.
const useYearBuckets = computed(() => props.stats.decades.length > 0 && props.stats.decades.length < 3)

interface Bucket {
  label: string
  count: number
}

const buckets = computed<Bucket[]>(() => {
  if (!useYearBuckets.value) {
    return props.stats.decades.map(entry => ({
      label: `${entry.decade}s`,
      count: entry.count,
    }))
  }

  // Only the decade rollup comes back from the server, so a per-year view has
  // to spread that decade's works evenly across the years it actually covers.
  const years: Bucket[] = []
  for (let year = firstYear.value; year <= lastYear.value; year++) {
    const decade = Math.floor(year / 10) * 10
    const entry = props.stats.decades.find(item => item.decade === decade)
    if (!entry)
      continue

    const decadeStart = Math.max(firstYear.value, decade)
    const decadeEnd = Math.min(lastYear.value, decade + 9)
    const yearsInDecade = decadeEnd - decadeStart + 1
    years.push({
      label: String(year),
      count: Math.round(entry.count / Math.max(1, yearsInDecade)),
    })
  }

  return years
})

const peakCount = computed(() => Math.max(1, ...buckets.value.map(bucket => bucket.count)))

const busiest = computed(() => buckets.value.reduce(
  (best, bucket) => (bucket.count > best.count
    ? bucket
    : best),
  buckets.value[0] ?? { label: '', count: 0 },
))

// The tail is a long list of one-book genres that says nothing about the shape.
const TOP_GENRES = 5
const topGenres = computed(() => [...props.stats.genres]
  .sort((a, b) => b.count - a.count)
  .slice(0, TOP_GENRES))

const genrePeak = computed(() => Math.max(1, ...topGenres.value.map(genre => genre.count)))

const worksPerYear = computed(() => (spanYears.value > 0
  ? (props.stats.works_count / (spanYears.value + 1)).toFixed(1)
  : null))

// Works with no publication year produce no decade rollup, which silently
// deleted the whole chart.
const hasDatedWorks = computed(() => buckets.value.length > 0)

const hasShape = computed(() => hasDatedWorks.value || props.stats.genres.length > 0)
</script>

<template>
  <div v-if="hasShape">
    <SectionHeading
      :eyebrow="t('authorPage.shapeEyebrow')"
      :title="t('authorPage.shapeTitle', {'period': busiest.label})"
      :subtitle="t('authorPage.shapeSubtitle', {
        'works': n(stats.works_count),
        'genres': stats.genres.length,
      })"
    />

    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <v-card class="h-100">
          <v-card-text>
            <div class="text-overline text-medium-emphasis mb-6">
              {{ useYearBuckets
                ? t('authorPage.worksPerYear')
                : t('authorPage.worksPerDecade') }}
            </div>

            <v-alert
              v-if="!hasDatedWorks"
              type="info"
              variant="tonal"
              density="compact"
            >
              {{ t('authorPage.noPublicationYears') }}
            </v-alert>

            <div
              v-else
              class="shape-scroll"
            >
              <div
                class="shape-grid"
                :style="{'gridTemplateColumns': `repeat(${buckets.length}, minmax(44px, 1fr))`}"
              >
                <div
                  v-for="bucket in buckets"
                  :key="bucket.label"
                  class="text-center"
                >
                  <div class="tabular text-body-2 font-weight-bold mb-2">
                    {{ bucket.count }}
                  </div>

                  <div class="shape-bar-track">
                    <div
                      class="shape-bar"
                      :class="{'shape-bar--peak': bucket.count === peakCount}"
                      :style="{'height': `${bucket.count / peakCount * 100}%`}"
                    />
                  </div>

                  <div
                    class="shape-label mt-2"
                    :class="{'text-primary': bucket.count === peakCount}"
                  >
                    {{ bucket.label }}
                  </div>
                </div>
              </div>
            </div>

            <v-divider
              v-if="hasDatedWorks"
              class="my-6"
            />

            <v-row v-if="hasDatedWorks">
              <v-col
                cols="6"
                sm="4"
              >
                <div class="text-overline text-medium-emphasis">
                  {{ t('authorPage.firstPublished') }}
                </div>

                <div class="tabular text-h6 font-weight-bold">
                  {{ firstYear || '–' }}
                </div>
              </v-col>

              <v-col
                cols="6"
                sm="4"
              >
                <div class="text-overline text-medium-emphasis">
                  {{ t('authorPage.lastPublished') }}
                </div>

                <div class="tabular text-h6 font-weight-bold">
                  {{ lastYear || '–' }}
                </div>
              </v-col>

              <v-col
                v-if="worksPerYear"
                cols="12"
                sm="4"
              >
                <div class="text-overline text-medium-emphasis">
                  {{ t('authorPage.averagePerYear') }}
                </div>

                <div class="tabular text-h6 font-weight-bold">
                  {{ worksPerYear }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        v-if="stats.genres.length > 0"
        cols="12"
        md="4"
      >
        <v-card class="h-100">
          <v-card-text>
            <div class="text-overline text-medium-emphasis mb-5">
              {{ t('authorPage.genreSpread') }}
            </div>

            <div class="d-flex flex-column gap-4">
              <div
                v-for="genre in topGenres"
                :key="genre.slug"
              >
                <div class="d-flex justify-space-between mb-2 align-baseline">
                  <NuxtLinkLocale
                    :to="`/search?q=${encodeURIComponent(genre.name)}&type=categories`"
                    class="text-body-2 font-weight-medium text-decoration-none text-primary"
                  >
                    {{ genreLabel(genre.slug) }}
                  </NuxtLinkLocale>

                  <span class="tabular text-body-2 font-weight-bold">{{ genre.count }}</span>
                </div>

                <div class="genre-track">
                  <div
                    class="genre-fill"
                    :style="{'width': `${genre.count / genrePeak * 100}%`}"
                  />
                </div>
              </div>
            </div>

            <v-divider class="my-5" />

            <div class="text-caption text-medium-emphasis">
              {{ t('authorPage.genreSpreadFootnote', {'count': n(stats.works_count)}) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.shape-scroll {
  overflow-x: auto;
}

.shape-grid {
  display: grid;
  gap: 14px;
  min-width: 320px;
}

.shape-bar-track {
  height: 160px;
  display: flex;
  align-items: flex-end;
}

.shape-bar {
  width: 100%;
  min-height: 4px;
  border-radius: 10px 10px 4px 4px;
  background: rgb(var(--v-theme-primary));
  opacity: 0.75;
}

.shape-bar--peak {
  opacity: 1;
}

.shape-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.genre-track {
  height: 7px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.1);
  overflow: hidden;
}

.genre-fill {
  height: 100%;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
}
</style>
