<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { compactNumberFormat, formatSeriesPosition, totalReaders } from '~/utils/format'

interface Props {
  books: BookSummary[]
}

const props = defineProps<Props>()

const { t, n, locale } = useI18n()

const compactFmt = computed(() => compactNumberFormat(locale.value))

const ordered = computed(() => [...props.books].sort(
  (a, b) => (a.series_position ?? 0) - (b.series_position ?? 0),
))

function readersOf(book: BookSummary): number {
  return totalReaders(
    book.app_want_to_read_count,
    book.app_reading_count,
    book.app_read_count,
    book.ol_want_to_read_count,
    book.ol_currently_reading_count,
    book.ol_already_read_count,
  )
}

const peak = computed(() => Math.max(1, ...ordered.value.map(readersOf)))

const firstVolumeReaders = computed(() => (ordered.value[0]
  ? readersOf(ordered.value[0])
  : 0))

const lastVolumeReaders = computed(() => {
  const last = ordered.value.at(-1)

  return last
    ? readersOf(last)
    : 0
})

// Half the opener's crowd is where the drop-off stops being noise.
const bars = computed(() => ordered.value.map(book => ({
  book,
  readers: readersOf(book),
  heightPercent: (readersOf(book) / peak.value) * 100,
  faded: firstVolumeReaders.value > 0 && readersOf(book) < firstVolumeReaders.value * 0.5,
})))

const mostRead = computed(() => bars.value.reduce(
  (best, bar) => (bar.readers > best.readers
    ? bar
    : best),
  bars.value[0]!,
))

const carryThrough = computed(() => (firstVolumeReaders.value > 0
  ? Math.round((lastVolumeReaders.value / firstVolumeReaders.value) * 100)
  : 0))

const hasEnough = computed(() => props.books.length >= 3 && peak.value > 1)
</script>

<template>
  <div v-if="hasEnough">
    <SectionHeading
      :eyebrow="t('seriesPage.readersEyebrow')"
      :title="t('seriesPage.readersTitle')"
      :subtitle="t('seriesPage.readersSubtitle')"
    >
      <template #actions>
        <v-chip variant="tonal">
          {{ t('seriesPage.readersCarryThrough', {'percent': carryThrough}) }}
        </v-chip>
      </template>
    </SectionHeading>

    <v-card>
      <v-card-text>
        <div class="readers-scroll">
          <div
            class="readers-grid"
            :style="{'gridTemplateColumns': `repeat(${bars.length}, minmax(52px, 1fr))`}"
          >
            <div
              v-for="bar in bars"
              :key="bar.book.book_id"
              class="text-center"
            >
              <div
                class="tabular text-caption font-weight-bold mb-2"
                :class="{'opacity-40': bar.faded}"
              >
                {{ compactFmt.format(bar.readers) }}
              </div>

              <div class="readers-bar-track">
                <NuxtLinkLocale
                  :to="`/books/${bar.book.slug}`"
                  class="readers-bar"
                  :class="{'opacity-40': bar.faded}"
                  :style="{'height': `${bar.heightPercent}%`}"
                  :title="bar.book.title"
                />
              </div>

              <div class="readers-label mt-2">
                {{ formatSeriesPosition(bar.book.series_position) || '–' }}
              </div>
            </div>
          </div>
        </div>

        <v-divider class="my-6" />

        <v-row>
          <v-col
            cols="12"
            sm="4"
          >
            <div class="text-overline text-medium-emphasis">
              {{ t('seriesPage.readersMostRead') }}
            </div>

            <div class="tabular text-h6 font-weight-bold">
              {{ n(mostRead.readers) }}

              <span class="text-body-2 text-medium-emphasis font-weight-regular">
                — {{ formatSeriesPosition(mostRead.book.series_position) }}
              </span>
            </div>
          </v-col>

          <v-col
            cols="12"
            sm="4"
          >
            <div class="text-overline text-medium-emphasis">
              {{ t('seriesPage.readersStarted') }}
            </div>

            <div class="tabular text-h6 font-weight-bold">
              {{ n(firstVolumeReaders) }}
            </div>
          </v-col>

          <v-col
            cols="12"
            sm="4"
          >
            <div class="text-overline text-medium-emphasis">
              {{ t('seriesPage.readersFinished') }}
            </div>

            <div class="tabular text-h6 font-weight-bold">
              {{ n(lastVolumeReaders) }}

              <span class="text-body-2 text-medium-emphasis font-weight-regular">— {{ carryThrough }}%</span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.readers-scroll {
  overflow-x: auto;
}

.readers-grid {
  display: grid;
  gap: 12px;
  min-width: 520px;
}

.readers-bar-track {
  height: 210px;
  display: flex;
  align-items: flex-end;
}

.readers-bar {
  display: block;
  width: 100%;
  min-height: 4px;
  border-radius: 10px 10px 4px 4px;
  background: rgb(var(--v-theme-primary));
  transition: opacity 0.15s ease;
}

.readers-bar:hover {
  opacity: 0.75;
}

.readers-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
