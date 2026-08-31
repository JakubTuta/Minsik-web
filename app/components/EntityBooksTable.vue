<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import { coverColor } from '~/utils/coverColor'
import { bookRarity, compactNumberFormat, formatSeriesPosition, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  books: BookSummary[]
  showPosition?: boolean
  groupSeries?: boolean
  loading?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: '',
})

const { t, locale } = useI18n()

const compactFmt = computed(() => compactNumberFormat(locale.value))

// Data-derived, not viewport-derived, so server and client agree.
const showYear = computed(() => props.books.some(book => !!book.original_publication_year))

interface Row {
  key: string
  book?: BookSummary
  seriesName?: string
  seriesSlug?: string
  members?: BookSummary[]
}

const expandedGroups = ref(new Set<string>())

function toggleGroup(key: string) {
  const next = new Set(expandedGroups.value)
  if (next.has(key))
    next.delete(key)
  else
    next.add(key)
  expandedGroups.value = next
}

// Standalone titles are dropped: the point of the filter is to see the series.
const rows = computed<Row[]>(() => {
  if (!props.groupSeries)
    return props.books.map(book => ({ key: `b${book.book_id}`, book }))

  const groups = new Map<string, Row>()

  for (const book of props.books) {
    if (!book.series)
      continue

    const key = `s${book.series.series_id}`
    const existing = groups.get(key)
    if (existing) {
      existing.members!.push(book)
      continue
    }

    groups.set(key, { key, seriesName: book.series.name, seriesSlug: book.series.slug, members: [book] })
  }

  for (const group of groups.values())
    group.members!.sort((a, b) => (a.series_position ?? 0) - (b.series_position ?? 0))

  return [...groups.values()]
})

const groupedNothing = computed(() => props.groupSeries
  && props.books.length > 0
  && rows.value.length === 0)

function rating(book: BookSummary): number {
  return weightedRating(book.avg_rating, book.rating_count, book.ol_avg_rating, book.ol_rating_count)
}

function readers(book: BookSummary): number {
  return totalReaders(
    book.app_want_to_read_count,
    book.app_reading_count,
    book.app_read_count,
    book.ol_want_to_read_count,
    book.ol_currently_reading_count,
    book.ol_already_read_count,
  )
}

function groupRating(members: BookSummary[]): number {
  const rated = members.filter(book => rating(book) > 0)
  if (rated.length === 0)
    return 0

  return rated.reduce((sum, book) => sum + rating(book), 0) / rated.length
}

function groupReaders(members: BookSummary[]): number {
  return members.reduce((sum, book) => sum + readers(book), 0)
}

useShelfStatuses(() => props.books)
</script>

<template>
  <!--
    One wrapper element for every state, never a `v-if` between them.
    Hydrating a production build reuses a matching element and does not repair
    its class attribute, so a wrapper that differed between the server's branch
    and the client's kept the server's classes forever — which is what laid the
    rows out sideways, and what tinted them with the alert's colours before
    that. A stable wrapper cannot mismatch; only its children change.
  -->
  <div class="entity-list">
    <div
      v-if="loading && books.length === 0"
      class="py-8"
    >
      <v-skeleton-loader type="list-item-avatar-three-line@6" />
    </div>

    <v-alert
      v-else-if="books.length === 0"
      type="info"
      variant="tonal"
    >
      {{ emptyMessage || t('common.noResults') }}
    </v-alert>

    <v-alert
      v-else-if="groupedNothing"
      type="info"
      variant="tonal"
    >
      {{ t('authorPage.noSeriesToGroup') }}
    </v-alert>

    <template v-else>
      <div class="entity-row entity-head px-5">
        <div
          v-if="showPosition"
          class="entity-pos"
        >
          #
        </div>

        <div class="entity-cover-col" />

        <div class="entity-main">
          {{ showPosition
            ? t('seriesPage.volumeColumn')
            : t('authorPage.workColumn') }}
        </div>

        <div class="entity-stats">
          <div
            v-if="showYear"
            class="entity-stat entity-stat--year"
          >
            {{ t('book.year') }}
          </div>

          <div class="entity-stat entity-stat--rating">
            {{ t('stats.rating') }}
          </div>

          <div class="entity-stat entity-stat--readers">
            {{ t('stats.readers') }}
          </div>

          <div class="entity-stat entity-stat--rarity">
            {{ t('bookPage.rarity') }}
          </div>
        </div>
      </div>

      <template
        v-for="row in rows"
        :key="row.key"
      >
        <!-- Single work -->
        <v-sheet
          v-if="row.book"
          border
          rounded="xl"
          class="entity-row pa-5"
        >
          <div
            v-if="showPosition"
            class="entity-pos"
          >
            <span class="font-display tabular entity-position">
              {{ row.book.series_position
                ? formatSeriesPosition(row.book.series_position).replace('#', '')
                : '–' }}
            </span>
          </div>

          <div class="entity-cover-col">
            <div class="entity-cover">
              <BookCover
                :title="row.book.title"
                :src="row.book.primary_cover_url"
                :width="72"
                :height="108"
                fit="cover"
                :fallback-color="coverColor(row.book)"
              />

              <BookShelfBadge
                :book-id="row.book.book_id"
                compact
                chip-size="small"
              />
            </div>
          </div>

          <div class="entity-main">
            <NuxtLinkLocale
              :to="`/books/${row.book.slug}`"
              class="entity-title"
            >
              {{ row.book.title }}
            </NuxtLinkLocale>

            <div
              v-if="!showPosition && row.book.series"
              class="text-caption text-medium-emphasis mt-1"
            >
              {{ row.book.series.name }}
              {{ row.book.series_position
                ? ` · ${formatSeriesPosition(row.book.series_position)}`
                : '' }}
            </div>

            <div
              v-if="row.book.description"
              class="text-body-2 text-medium-emphasis line-clamp-2 mt-1"
            >
              {{ row.book.description }}
            </div>
          </div>

          <div class="entity-stats">
            <div
              v-if="showYear"
              class="entity-stat entity-stat--year tabular text-body-2"
            >
              {{ row.book.original_publication_year || '–' }}
            </div>

            <div class="entity-stat entity-stat--rating">
              <v-rating
                :model-value="Math.floor(rating(row.book) * 2) / 2"
                readonly
                half-increments
                color="warning"
                active-color="warning"
                size="x-small"
                density="compact"
              />

              <b class="tabular text-body-2 mt-1">{{ rating(row.book).toFixed(2) }}</b>
            </div>

            <div class="entity-stat entity-stat--readers tabular text-body-2 font-weight-bold text-info">
              {{ compactFmt.format(readers(row.book)) }}
            </div>

            <div class="entity-stat entity-stat--rarity">
              <RarityBadge
                :rarity="bookRarity(row.book)"
                size="small"
              />
            </div>
          </div>
        </v-sheet>

        <!-- Collapsed series -->
        <v-sheet
          v-else
          border
          rounded="xl"
          class="entity-row entity-group pa-5"
          @click="toggleGroup(row.key)"
        >
          <div
            v-if="showPosition"
            class="entity-pos"
          />

          <div class="entity-cover-col">
            <div class="entity-cover">
              <BookCover
                :title="row.members![0]!.title"
                :src="row.members![0]!.primary_cover_url"
                :width="72"
                :height="108"
                fit="cover"
                :fallback-color="coverColor(row.members![0]!)"
              />
            </div>
          </div>

          <div class="entity-main">
            <div class="d-flex align-center gap-2">
              <NuxtLinkLocale
                v-if="row.seriesSlug"
                :to="`/series/${row.seriesSlug}`"
                class="entity-title"
                @click.stop
              >
                {{ row.seriesName }}
              </NuxtLinkLocale>

              <span
                v-else
                class="entity-title"
              >{{ row.seriesName }}</span>

              <v-icon
                size="small"
                :icon="expandedGroups.has(row.key)
                  ? 'mdi-chevron-up'
                  : 'mdi-chevron-down'"
              />
            </div>

            <div class="text-body-2 text-medium-emphasis mt-1">
              {{ expandedGroups.has(row.key)
                ? t('common.hide')
                : t('authorPage.seriesGroupHint', {'count': row.members!.length}) }}
            </div>
          </div>

          <div class="entity-stats">
            <div
              v-if="showYear"
              class="entity-stat entity-stat--year"
            />

            <div class="entity-stat entity-stat--rating">
              <v-rating
                :model-value="Math.floor(groupRating(row.members!) * 2) / 2"
                readonly
                half-increments
                color="warning"
                active-color="warning"
                size="x-small"
                density="compact"
              />

              <b class="tabular text-body-2 mt-1">{{ groupRating(row.members!).toFixed(2) }}</b>
            </div>

            <div class="entity-stat entity-stat--readers tabular text-body-2 font-weight-bold text-info">
              {{ compactFmt.format(groupReaders(row.members!)) }}
            </div>

            <div class="entity-stat entity-stat--rarity" />
          </div>
        </v-sheet>

        <!-- Volumes of an opened series -->
        <v-sheet
          v-for="member in (expandedGroups.has(row.key)
            ? row.members ?? []
            : [])"
          :key="`${row.key}-${member.book_id}`"
          color="surface-variant"
          border
          rounded="xl"
          class="entity-row entity-member pa-5"
        >
          <div
            v-if="showPosition"
            class="entity-pos"
          />

          <div class="entity-cover-col">
            <div class="entity-cover">
              <BookCover
                :title="member.title"
                :src="member.primary_cover_url"
                :width="72"
                :height="108"
                fit="cover"
                :fallback-color="coverColor(member)"
              />

              <BookShelfBadge
                :book-id="member.book_id"
                compact
                chip-size="small"
              />
            </div>
          </div>

          <div class="entity-main">
            <NuxtLinkLocale
              :to="`/books/${member.slug}`"
              class="entity-title"
            >
              {{ formatSeriesPosition(member.series_position) }} {{ member.title }}
            </NuxtLinkLocale>
          </div>

          <div class="entity-stats">
            <div
              v-if="showYear"
              class="entity-stat entity-stat--year tabular text-body-2"
            >
              {{ member.original_publication_year || '–' }}
            </div>

            <div class="entity-stat entity-stat--rating">
              <b class="tabular text-body-2">{{ rating(member).toFixed(2) }}</b>
            </div>

            <div class="entity-stat entity-stat--readers tabular text-body-2 font-weight-bold text-info">
              {{ compactFmt.format(readers(member)) }}
            </div>

            <div class="entity-stat entity-stat--rarity">
              <RarityBadge
                :rarity="bookRarity(member)"
                size="small"
              />
            </div>
          </div>
        </v-sheet>
      </template>
    </template>

    <div
      v-if="loading && books.length > 0"
      class="d-flex justify-center py-4"
    >
      <v-progress-circular indeterminate />
    </div>
  </div>
</template>

<style scoped>
.entity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/*
 * Columns hide in CSS, not from `useDisplay()`: a viewport-derived value differs
 * between server and client, and Vue does not patch that when hydrating.
 */
.entity-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.entity-head {
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.75;
}

.entity-pos {
  flex: 0 0 48px;
  text-align: center;
}

.entity-position {
  font-size: 1.75rem;
  opacity: 0.6;
}

.entity-cover-col {
  flex: 0 0 72px;
}

/* `flex: 1 1 0` plus `min-width: 0` is what stops a long description widening the row. */
.entity-main {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
}

.entity-main :deep(*) {
  overflow-wrap: anywhere;
}

.entity-stats {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 16px;
}

.entity-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.entity-stat--year {
  flex: 0 0 64px;
}

.entity-stat--rating {
  flex: 0 0 104px;
}

.entity-stat--readers {
  flex: 0 0 80px;
}

.entity-stat--rarity {
  flex: 0 0 128px;
}

@media (max-width: 1279px) {
  .entity-stat--rarity {
    display: none;
  }
}

@media (max-width: 959px) {
  .entity-stat--year,
  .entity-stat--readers {
    display: none;
  }

  .entity-head {
    display: none;
  }
}

/* AppImage fills its parent, so every cover slot needs an explicit box. */
.entity-cover {
  position: relative;
  width: 72px;
  aspect-ratio: 0.67;
  overflow: hidden;
  border-radius: 8px;
}

.entity-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

a.entity-title:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}

.entity-group {
  cursor: pointer;
}

.entity-member {
  margin-left: 40px;
}
</style>
