<script setup lang="ts">
interface Props {
  title: string
  slug: string
  coverUrl?: string | null
  authorNames?: string[]
  authorSlugs?: string[]
  rating?: number
  ratingCount?: number
  readers?: number
  eager?: boolean
  compact?: boolean
  badge?: string
  badgeColor?: string
  linkTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  coverUrl: null,
  authorNames: () => [],
  authorSlugs: () => [],
  rating: 0,
  ratingCount: 0,
  readers: 0,
  badge: undefined,
  badgeColor: 'primary',
  linkTo: undefined,
})

const cardLink = computed(() => props.linkTo ?? `/books/${props.slug}`)

const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

const formattedRating = computed(() => (props.rating
  ? props.rating.toFixed(1)
  : '0.0'))
const formattedRatingCount = computed(() => (props.ratingCount
  ? `(${compactFmt.format(props.ratingCount)})`
  : '(0)'))
const formattedReaders = computed(() => (props.readers
  ? compactFmt.format(props.readers)
  : '0'))
const visibleAuthors = computed(() => props.authorNames.slice(0, 2))
</script>

<template>
  <div
    class="book-preview-card-link"
    :class="compact
      ? 'compact'
      : 'full'"
  >
    <v-card class="book-preview-card d-flex flex-column h-100">
      <!-- Badge -->
      <v-chip
        v-if="badge"
        :color="badgeColor"
        size="x-small"
        class="card-badge position-absolute"
        variant="elevated"
        style="z-index: 2; top: 8px; right: 8px;"
      >
        {{ badge }}
      </v-chip>

      <!-- Cover zone -->
      <div class="cover-zone bg-surface-variant d-flex align-center justify-center">
        <v-img
          :src="coverUrl || '/placeholder-book-lazy.jpg'"
          :alt="title"
          :eager="eager"
          contain
          class="cover-img"
        />
      </div>

      <!-- Info zone -->
      <div class="info-zone d-flex flex-column px-3 pb-2 pt-2">
        <!-- Title -->
        <NuxtLink
          :to="cardLink"
          class="card-title font-weight-bold text-body-2 title-link"
          :class="compact
            ? 'line-clamp-1'
            : 'line-clamp-2'"
        >
          {{ title }}
        </NuxtLink>

        <!-- Authors -->
        <div
          v-if="visibleAuthors.length > 0"
          class="authors-row text-caption text-medium-emphasis line-clamp-1 mt-1"
        >
          <template
            v-for="(name, i) in visibleAuthors"
            :key="authorSlugs[i] ?? name"
          >
            <NuxtLink
              :to="`/authors/${authorSlugs[i] ?? ''}`"
              class="author-link text-medium-emphasis text-decoration-none"
            >
              {{ name }}
            </NuxtLink>

            <span v-if="i < visibleAuthors.length - 1">, </span>
          </template>
        </div>

        <!-- Spacer -->
        <div class="flex-grow-1" />

        <!-- Stats -->
        <div class="stats-row d-flex align-center text-caption text-medium-emphasis mt-1 gap-2">
          <span class="d-flex align-center gap-1">
            <v-icon
              icon="mdi-star"
              size="x-small"
              color="warning"
            />
            {{ formattedRating }} {{ formattedRatingCount }}
          </span>

          <span class="d-flex align-center gap-1">
            <v-icon
              icon="mdi-account-multiple"
              size="x-small"
              color="info"
            />
            {{ formattedReaders }}
          </span>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.book-preview-card-link {
  display: block;
  position: relative;
}

.book-preview-card-link.full {
  height: 360px;
}

.book-preview-card-link.compact {
  height: 100%;
}

.book-preview-card {
  position: relative;
}

/* Full mode: fixed cover + info split */
.full .cover-zone {
  height: 65%;
  overflow: hidden;
}

.full .info-zone {
  height: 35%;
  overflow: hidden;
}

/* Compact mode: cover grows, thin info strip */
.compact .cover-zone {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.compact .info-zone {
  flex-shrink: 0;
  overflow: hidden;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.compact .card-title {
  font-size: 0.72rem;
}

.compact .authors-row,
.compact .stats-row {
  font-size: 0.65rem;
}

.compact .stats-row .v-icon {
  font-size: 10px !important;
}

/* Cover image fills zone */
.cover-img {
  width: 100%;
  height: 100%;
}

/* Title hover (card hover drives it) */
.title-link {
  color: inherit;
  transition: color 0.15s;
}

.book-preview-card-link:hover .title-link {
  color: rgb(var(--v-theme-primary));
}

/* Authors sit above the overlay link */
.authors-row {
  position: relative;
  z-index: 2;
}

.author-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

/* Clamp helpers */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats-row {
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
}
</style>
