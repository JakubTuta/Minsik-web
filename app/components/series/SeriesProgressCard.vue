<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { coverColor } from '~/utils/coverColor'
import { formatSeriesPosition } from '~/utils/format'
import { formatReadingTime } from '~/utils/readingTime'

interface Props {
  books: BookSummary[]
  totalPages: number
}

const props = defineProps<Props>()

const { t, n } = useI18n()
const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
const statusesStore = useBookStatusesStore()

const RING_SIZE = 84
const RING_CENTER = RING_SIZE / 2
const RING_RADIUS = 36
const RING_STROKE = 8
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const readBooks = computed(() => props.books.filter(
  book => statusesStore.getStatus(book.book_id)?.status === 'read',
))

const pagesRead = computed(() => readBooks.value.reduce(
  (sum, book) => sum + (book.number_of_pages ?? 0),
  0,
))

const readingTime = computed(() => formatReadingTime(pagesRead.value))

const progressFraction = computed(() => (props.books.length > 0
  ? readBooks.value.length / props.books.length
  : 0))

const dashOffset = computed(() => RING_CIRCUMFERENCE * (1 - progressFraction.value))

// "Next" is positional — a series is meant to be read in order.
const upNext = computed(() => {
  const ordered = [...props.books].sort((a, b) => (a.series_position ?? 0) - (b.series_position ?? 0))
  const reading = ordered.find(book => statusesStore.getStatus(book.book_id)?.status === 'reading')
  if (reading)
    return { book: reading, reading: true }

  const unread = ordered.find(book => statusesStore.getStatus(book.book_id)?.status !== 'read')

  return unread
    ? { book: unread, reading: false }
    : null
})
</script>

<template>
  <v-card v-if="authStore.isAuthenticated">
    <v-card-text>
      <div class="text-overline text-medium-emphasis mb-5">
        {{ t('seriesPage.yourProgress') }}
      </div>

      <div class="d-flex align-center flex-wrap gap-5">
        <svg
          :width="RING_SIZE"
          :height="RING_SIZE"
          :viewBox="`0 0 ${RING_SIZE} ${RING_SIZE}`"
          class="flex-shrink-0"
          aria-hidden="true"
        >
          <circle
            :cx="RING_CENTER"
            :cy="RING_CENTER"
            :r="RING_RADIUS"
            fill="none"
            stroke="rgba(var(--v-theme-on-surface), 0.12)"
            :stroke-width="RING_STROKE"
          />

          <circle
            :cx="RING_CENTER"
            :cy="RING_CENTER"
            :r="RING_RADIUS"
            fill="none"
            stroke="rgb(var(--v-theme-primary))"
            :stroke-width="RING_STROKE"
            stroke-linecap="round"
            :stroke-dasharray="RING_CIRCUMFERENCE"
            :stroke-dashoffset="dashOffset"
            :transform="`rotate(-90 ${RING_CENTER} ${RING_CENTER})`"
          />

          <text
            :x="RING_CENTER"
            y="41"
            text-anchor="middle"
            class="font-display"
            font-size="20"
            font-weight="700"
            fill="currentColor"
          >{{ readBooks.length }}/{{ books.length }}</text>

          <text
            :x="RING_CENTER"
            y="55"
            text-anchor="middle"
            font-size="8"
            font-weight="800"
            letter-spacing="1.2"
            fill="rgba(var(--v-theme-on-surface), 0.6)"
          >{{ t('bookshelf.read').toUpperCase() }}</text>
        </svg>

        <div v-if="totalPages > 0">
          <div class="text-overline text-medium-emphasis">
            {{ t('seriesPage.pagesRead') }}
          </div>

          <div class="tabular text-h6 font-weight-bold">
            {{ n(pagesRead) }}

            <span class="text-body-2 text-medium-emphasis font-weight-regular">
              {{ t('seriesPage.pagesReadOf', {'total': n(totalPages)}) }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="readingTime"
        class="mt-5"
      >
        <div class="text-overline text-medium-emphasis">
          {{ t('seriesPage.timeInvested') }}
        </div>

        <div class="tabular text-h6 font-weight-bold">
          ~{{ readingTime }}
        </div>
      </div>

      <template v-if="upNext">
        <v-divider class="my-5" />

        <div class="text-overline text-medium-emphasis mb-3">
          {{ t('seriesPage.upNext') }}
        </div>

        <NuxtLinkLocale
          :to="`/books/${upNext.book.slug}`"
          class="d-flex align-center text-decoration-none text-onSurface gap-4"
        >
          <div class="up-next-cover">
            <BookCover
              :title="upNext.book.title"
              :src="upNext.book.primary_cover_url"
              :width="44"
              :height="66"
              fit="cover"
              :fallback-color="coverColor(upNext.book)"
            />
          </div>

          <div>
            <div class="text-body-2 font-weight-bold">
              {{ upNext.book.title }}
            </div>

            <div class="text-caption text-medium-emphasis">
              {{ formatSeriesPosition(upNext.book.series_position) }}
              {{ upNext.reading
                ? `· ${t('seriesPage.upNextReading')}`
                : `· ${t('seriesPage.upNextWaiting')}` }}
            </div>
          </div>
        </NuxtLinkLocale>
      </template>
    </v-card-text>
  </v-card>

  <v-card v-else>
    <v-card-text>
      <div class="text-overline text-medium-emphasis mb-3">
        {{ t('seriesPage.yourProgress') }}
      </div>

      <h3 class="text-h6 font-weight-bold mb-3">
        {{ t('seriesPage.guestProgressTitle', {'count': books.length}) }}
      </h3>

      <div class="text-medium-emphasis text-body-2 mb-5">
        {{ t('seriesPage.guestProgressBody') }}
      </div>

      <div class="d-flex flex-wrap gap-3">
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          @click="authDialogStore.openLogin()"
        >
          {{ t('auth.signIn') }}
        </v-btn>

        <v-btn
          variant="outlined"
          rounded="pill"
          @click="authDialogStore.openRegister()"
        >
          {{ t('auth.createAccount') }}
        </v-btn>
      </div>

      <v-divider class="my-5" />

      <div class="text-caption text-medium-emphasis">
        {{ t('seriesPage.guestProgressFootnote') }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* AppImage fills its parent, so every cover slot needs an explicit box. */
.up-next-cover {
  position: relative;
  width: 44px;
  aspect-ratio: 0.67;
  overflow: hidden;
  border-radius: 5px;
  flex-shrink: 0;
}
</style>
