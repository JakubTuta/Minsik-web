<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { totalReaders, weightedRating } from '~/utils/format'

interface Props {
  books: BookSummary[]
  loading: boolean
  hasMore: boolean
  loadMore: () => void | Promise<void>
}

const props = defineProps<Props>()

const { t, n } = useI18n()

const booksWithYearMarkers = computed(() => {
  return props.books.map((book, index) => {
    const year = book.original_publication_year ?? null
    const prevYear = index > 0
      ? (props.books[index - 1]?.original_publication_year ?? null)
      : undefined

    return { book, showYearMarker: year !== prevYear, year }
  })
})

const scrollEnabled = computed(() => props.hasMore && !props.loading)
const { sentinel } = useInfiniteScroll(() => props.loadMore(), { enabled: scrollEnabled })

useShelfStatuses(() => props.books)
</script>

<template>
  <div class="author-timeline">
    <div
      v-if="!loading && books.length === 0"
      class="text-medium-emphasis text-center"
      style="padding: 32px 0;"
    >
      {{ t('books.emptyList') }}
    </div>

    <div
      v-else
      class="timeline-track"
    >
      <template
        v-for="(entry, index) in booksWithYearMarkers"
        :key="entry.book.book_id"
      >
        <!-- Year marker -->
        <div
          v-if="entry.showYearMarker"
          class="year-marker"
        >
          <span class="year-badge">{{ entry.year ?? 'Unknown' }}</span>
        </div>

        <!-- Entry row -->
        <div
          class="timeline-entry"
          :class="index % 2 === 1
            ? 'is-right'
            : 'is-left'"
        >
          <div class="entry-filler" />

          <div class="entry-dot-col">
            <div class="entry-dot" />
          </div>

          <NuxtLinkLocale
            :to="`/books/${entry.book.slug}`"
            class="entry-card text-decoration-none"
          >
            <v-card
              hover
              class="d-flex flex-row overflow-hidden"
            >
              <div
                class="d-flex align-center position-relative flex-shrink-0 justify-center"
                :style="{'width': '80px',
                         'minWidth': '80px',
                         'height': '120px'}"
              >
                <BookCover
                  :title="entry.book.title"
                  :src="entry.book.primary_cover_url"
                  :width="80"
                  :height="120"
                  :fallback-color="coverColor(entry.book)"
                />

                <BookShelfBadge
                  :book-id="entry.book.book_id"
                  compact
                />
              </div>

              <div
                class="d-flex flex-column justify-center pa-2"
                style="min-width: 0;"
              >
                <div
                  class="text-body-2 font-weight-bold timeline-title"
                  style="margin-bottom: 4px;"
                >
                  {{ entry.book.title }}
                </div>

                <div class="d-flex align-center gap-1">
                  <v-icon
                    size="x-small"
                    color="warning"
                    icon="mdi-star"
                  />

                  <span class="text-caption">
                    {{ weightedRating(
                      entry.book.avg_rating, entry.book.rating_count,
                      entry.book.ol_avg_rating, entry.book.ol_rating_count,
                    ).toFixed(1) }} ({{ entry.book.rating_count + entry.book.ol_rating_count }})
                  </span>
                </div>

                <div
                  class="d-flex align-center gap-1"
                  style="margin-top: 4px;"
                >
                  <v-icon
                    size="x-small"
                    color="info"
                    icon="mdi-account-multiple"
                  />

                  <span class="text-caption">
                    {{ n(totalReaders(
                      entry.book.app_want_to_read_count, entry.book.app_reading_count, entry.book.app_read_count,
                      entry.book.ol_want_to_read_count, entry.book.ol_currently_reading_count, entry.book.ol_already_read_count,
                    )) }}
                  </span>
                </div>
              </div>
            </v-card>
          </NuxtLinkLocale>
        </div>
      </template>
    </div>

    <div
      v-if="loading"
      class="d-flex justify-center py-4"
    >
      <v-progress-circular
        :size="books.length === 0
          ? 32
          : 24"
        indeterminate
        color="primary"
      />
    </div>

    <div ref="sentinel" />
  </div>
</template>

<style scoped>
/* ── Vertical timeline line ── */
.timeline-track {
  position: relative;
}

.timeline-track::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgb(var(--v-theme-primary));
  opacity: 0.35;
  z-index: 0;
}

@media (min-width: 960px) {
  .timeline-track::before {
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 959px) {
  .timeline-track::before {
    left: 12px;
  }
}

/* ── Year marker ── */
.year-marker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  margin: 20px 0 8px;
}

@media (min-width: 960px) {
  .year-marker {
    justify-content: center;
  }
}

@media (max-width: 959px) {
  .year-marker {
    padding-left: 36px;
  }
}

.year-badge {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-radius: 12px;
  padding: 2px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* ── Entry row ── */
.timeline-entry {
  position: relative;
  margin-bottom: 10px;
}

@media (min-width: 960px) {
  .timeline-entry {
    display: grid;
    grid-template-columns: 1fr 32px 1fr;
    align-items: center;
  }

  .is-left {
    grid-template-areas: 'card dot filler';
  }

  .is-right {
    grid-template-areas: 'filler dot card';
  }

  .is-left .entry-card {
    padding-right: 10px;
  }

  .is-right .entry-card {
    padding-left: 10px;
  }
}

@media (max-width: 959px) {
  .timeline-entry {
    padding-left: 40px;
  }
}

/* ── Grid area assignments ── */
.entry-filler {
  grid-area: filler;
}

.entry-dot-col {
  grid-area: dot;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.entry-card {
  grid-area: card;
}

@media (max-width: 959px) {
  .entry-filler {
    display: none;
  }

  .entry-dot-col {
    position: absolute;
    left: 7px;
    top: 50%;
    transform: translateY(-50%);
    grid-area: unset;
  }
}

/* ── Dot ── */
.entry-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  border: 2px solid rgb(var(--v-theme-surface));
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* ── Card text ── */
.timeline-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}
</style>
