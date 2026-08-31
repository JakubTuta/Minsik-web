<script setup lang="ts">
import type { Author, AuthorStats } from '~/types/api'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  author: Author
  stats?: AuthorStats | null
}

const props = withDefaults(defineProps<Props>(), {
  stats: null,
})

const { t, locale, n } = useI18n()
const localePath = useLocalePath()

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(locale.value, { year: 'numeric', month: 'short', day: 'numeric' })
}

const age = computed(() => {
  if (!props.author.birth_date)
    return null

  const birthDate = new Date(props.author.birth_date)
  const endDate = props.author.death_date
    ? new Date(props.author.death_date)
    : new Date()

  let years = endDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = endDate.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate()))
    years--

  return years
})

const birthDateFormatted = computed(() => (props.author.birth_date
  ? formatShortDate(props.author.birth_date)
  : null),
)

const deathDateFormatted = computed(() => (props.author.death_date
  ? formatShortDate(props.author.death_date)
  : null),
)

const birthPlace = computed(() => {
  const parts = [props.author.birth_place, props.author.nationality].filter(Boolean)

  return parts.length
    ? parts.join(', ')
    : null
})

const authorWeightedRating = computed(() => weightedRating(
  props.author.books_avg_rating,
  props.author.books_total_ratings,
  props.author.books_ol_avg_rating,
  props.author.books_ol_total_ratings,
),
)

const authorTotalRatings = computed(() => totalRatingCount(props.author.books_total_ratings, props.author.books_ol_total_ratings),
)

const authorTotalReaders = computed(() => totalReaders(
  props.author.app_want_to_read_count,
  props.author.app_reading_count,
  props.author.app_read_count,
  props.author.ol_want_to_read_count,
  props.author.ol_currently_reading_count,
  props.author.ol_already_read_count,
),
)

const authorStats = computed(() => [
  {
    icon: 'mdi-book-multiple',
    value: props.author.books_count,
    label: t('stats.books'),
  },
  {
    icon: 'mdi-star',
    iconColor: 'warning',
    value: `${authorWeightedRating.value.toFixed(1)}`,
    label: t('stats.avgRating', { count: n(authorTotalRatings.value) }),
    tooltipLines: [
      t('stats.minsikRatings', { rating: props.author.books_avg_rating?.toFixed(1) ?? '0.0', count: n(props.author.books_total_ratings ?? 0) }),
      t('stats.olRatings', { rating: props.author.books_ol_avg_rating?.toFixed(1) ?? '0.0', count: n(props.author.books_ol_total_ratings ?? 0) }),
    ],
  },
  {
    icon: 'mdi-account-multiple',
    value: n(authorTotalReaders.value),
    label: t('stats.readers'),
    tooltipLines: [
      t('stats.minsikWantToRead', { count: n(props.author.app_want_to_read_count ?? 0) }),
      t('stats.minsikReading', { count: n(props.author.app_reading_count ?? 0) }),
      t('stats.minsikRead', { count: n(props.author.app_read_count ?? 0) }),
      t('stats.olWantToRead', { count: n(props.author.ol_want_to_read_count ?? 0) }),
      t('stats.olReading', { count: n(props.author.ol_currently_reading_count ?? 0) }),
      t('stats.olRead', { count: n(props.author.ol_already_read_count ?? 0) }),
    ],
  },
])

const lifeSpan = computed(() => {
  const birth = props.author.birth_date
    ? new Date(props.author.birth_date).getFullYear()
    : null
  const death = props.author.death_date
    ? new Date(props.author.death_date).getFullYear()
    : null

  if (!birth && !death)
    return null

  return `${birth ?? '?'}–${death ?? ''}`
})

const preTitleLine = computed(() => {
  const parts: string[] = []
  if (props.author.nationality)
    parts.push(t('author.nationalityAuthor', { nationality: props.author.nationality }).toUpperCase())
  if (lifeSpan.value)
    parts.push(lifeSpan.value)

  return parts.join(' · ')
})

// `book_categories` has names but no slug, so these search by name.
const categoryChips = computed(() => (props.author.book_categories ?? []).slice(0, 6))
</script>

<template>
  <v-row
    align="start"
  >
    <!-- Left: Avatar + dates -->
    <v-col
      cols="12"
      md="4"
      class="d-flex flex-column align-center"
    >
      <v-avatar
        size="220"
        class="mb-4"
      >
        <AuthorPhoto
          :name="author.name"
          :src="author.photo_url"
          :size="220"
          priority
        />
      </v-avatar>

      <div
        v-if="birthDateFormatted || deathDateFormatted"
        class="d-flex align-center text-medium-emphasis text-body-2 gap-2 text-center"
      >
        <v-icon
          icon="mdi-calendar"
          size="small"
        />

        <span>{{ birthDateFormatted ?? '?' }} — {{ deathDateFormatted ?? '—' }}</span>

        <span
          v-if="age !== null"
          class="ml-1"
        >· {{ t('author.ageYears', {age}) }}</span>
      </div>

      <ClientOnly>
        <AuthorProgressCard
          :author-name="author.name"
          :stats="stats"
          class="mt-6 w-100"
        />
      </ClientOnly>
    </v-col>

    <!-- Right: Name, stats, bio, info -->
    <v-col
      cols="12"
      md="8"
    >
      <p
        v-if="preTitleLine"
        class="text-caption text-medium-emphasis font-weight-medium mb-2 tracking-widest"
      >
        {{ preTitleLine }}
      </p>

      <h1 class="font-display text-h3 font-weight-bold mb-2">
        {{ author.name }}
      </h1>

      <p
        v-if="author.alternate_names && author.alternate_names.length > 0"
        class="text-body-2 text-medium-emphasis mb-4"
      >
        {{ t('author.alsoKnownAs', {"names": author.alternate_names.slice(0, 2).join(', ')}) }}
      </p>

      <StatsRow
        :stats="authorStats"
        class="mb-6"
      />

      <div
        v-if="categoryChips.length > 0"
        class="d-flex mb-6 flex-wrap gap-2"
      >
        <v-chip
          v-for="category in categoryChips"
          :key="category"
          size="small"
          variant="tonal"
          :to="localePath(`/search?q=${encodeURIComponent(category)}&type=categories`)"
        >
          {{ category }}
        </v-chip>
      </div>

      <DescriptionCard
        :description="author.bio"
        hide-card
        hide-heading
        empty-message=""
        class="mb-6"
      />

      <!-- Info row -->
      <div class="d-flex align-center text-body-2 mb-4 flex-wrap gap-4">
        <div
          v-if="birthPlace"
          class="d-flex align-center text-medium-emphasis gap-1"
        >
          <v-icon
            icon="mdi-map-marker"
            size="small"
          />
          {{ birthPlace }}
        </div>

        <a
          v-if="author.wikipedia_url"
          :href="author.wikipedia_url"
          target="_blank"
          rel="noopener noreferrer"
          class="d-flex align-center text-primary text-decoration-none gap-1"
        >
          <v-icon
            icon="mdi-wikipedia"
            size="small"
          />
          {{ t('author.wikipedia') }}
          <v-icon
            icon="mdi-open-in-new"
            size="x-small"
          />
        </a>
      </div>
    </v-col>
  </v-row>
</template>
