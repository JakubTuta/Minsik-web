<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { bookRarity, compactNumberFormat, totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  books: BookSummary[]
  loading?: boolean
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

useShelfStatuses(() => props.books)

const compactFmt = computed(() => compactNumberFormat(locale.value))

function bookWeightedRating(book: BookSummary): number {
  return weightedRating(book.avg_rating, book.rating_count, book.ol_avg_rating, book.ol_rating_count)
}

function bookReaders(book: BookSummary): number {
  return totalReaders(
    book.app_want_to_read_count,
    book.app_reading_count,
    book.app_read_count,
    book.ol_want_to_read_count,
    book.ol_currently_reading_count,
    book.ol_already_read_count,
  )
}

/*
 * Emitted in rank order so the mobile stack reads 1-2-3; `order` only applies
 * from Vuetify's md (960px). UnoCSS's own `md:` is 768px, where the cards are
 * still stacked — reordering there scrambled the ranking on tablets. Columns
 * are equal: uneven ones wrapped the third card onto its own line.
 */
const podium = computed(() => props.books.slice(0, 3).map((book, index) => {
  const rank = index + 1

  return {
    book,
    rank,
    orderClass: `podium-order-${rank}`,
    coverWidth: rank === 1
      ? 96
      : rank === 2
        ? 88
        : 84,
    rankSize: rank === 1
      ? 'text-h4 text-primary'
      : 'text-h5 text-medium-emphasis',
    featured: rank === 1,
  }
}))
</script>

<template>
  <div v-if="loading || books.length > 0">
    <SectionHeading
      :eyebrow="t('authorPage.mostReadEyebrow')"
      :title="t('author.mostAcclaimed')"
      :subtitle="t('authorPage.mostReadSubtitle')"
    />

    <v-row v-if="loading">
      <v-col
        v-for="i in 3"
        :key="i"
        cols="12"
        md="4"
      >
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <v-row
      v-else
      align="end"
    >
      <v-col
        v-for="entry in podium"
        :key="entry.rank"
        cols="12"
        md="4"
        :class="entry.orderClass"
      >
        <v-card
          class="h-100"
          :class="{'podium-winner': entry.featured}"
        >
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between mb-4 gap-2 align-start">
              <span
                class="font-display tabular font-weight-bold"
                :class="entry.rankSize"
                style="line-height: 1;"
              >{{ entry.rank }}</span>

              <RarityBadge
                :rarity="bookRarity(entry.book)"
                size="small"
              />
            </div>

            <div class="d-flex gap-4 align-start">
              <div
                class="podium-cover flex-shrink-0"
                :style="{'width': `${entry.coverWidth}px`}"
              >
                <BookCover
                  :title="entry.book.title"
                  :src="entry.book.primary_cover_url"
                  :author-names="(entry.book.authors ?? []).map(a => a.name)"
                  :width="entry.coverWidth"
                  :height="Math.round(entry.coverWidth * 1.5)"
                  fit="cover"
                />

                <BookShelfBadge :book-id="entry.book.book_id" />
              </div>

              <div class="podium-info flex-grow-1">
                <NuxtLinkLocale
                  :to="`/books/${entry.book.slug}`"
                  class="text-decoration-none book-title-link"
                >
                  <p
                    class="text-body-1 font-weight-bold book-title mb-1"
                  >
                    {{ entry.book.title }}
                  </p>
                </NuxtLinkLocale>

                <p
                  v-if="entry.book.original_publication_year"
                  class="text-caption text-medium-emphasis mb-3"
                >
                  {{ entry.book.original_publication_year }}
                </p>

                <RatingDisplay
                  :rating="bookWeightedRating(entry.book)"
                  :rating-count="totalRatingCount(entry.book.rating_count, entry.book.ol_rating_count)"
                  size="small"
                  class="mb-2"
                />

                <div class="tabular text-body-2 font-weight-bold text-info">
                  {{ t('authorPage.readersCount', {'count': compactFmt.format(bookReaders(entry.book))}) }}
                </div>
              </div>
            </div>

            <p
              v-if="entry.featured && entry.book.description"
              class="text-body-2 text-medium-emphasis line-clamp-2 mt-4"
            >
              {{ entry.book.description }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
@media (min-width: 960px) {
  .podium-order-1 {
    order: 2;
  }

  .podium-order-2 {
    order: 1;
  }

  .podium-order-3 {
    order: 3;
  }
}

/* Releases the automatic minimum so a long title cannot widen the card. */
.podium-info {
  min-width: 0;
  overflow-wrap: anywhere;
}

.book-title {
  color: rgb(var(--v-theme-on-surface));
  transition: color 0.15s ease;
}

.book-title-link:hover .book-title {
  color: rgb(var(--v-theme-primary));
}

/* AppImage fills its parent, so every cover slot needs an explicit box. */
.podium-cover {
  position: relative;
  aspect-ratio: 0.67;
  overflow: hidden;
  border-radius: 8px;
}

.podium-winner {
  border: 1px solid rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 18px 40px -26px rgba(0, 0, 0, 0.5);
}
</style>
