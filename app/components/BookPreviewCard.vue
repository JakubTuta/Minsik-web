<script setup lang="ts">
import { hashColor } from '~/utils/coverColor'
import { compactNumberFormat } from '~/utils/format'

interface Props {
  title: string
  slug: string
  coverUrl?: string | null
  authorNames?: string[]
  authorSlugs?: string[]
  rating?: number
  ratingCount?: number
  readers?: number
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

const { optimized } = useOptimizedImage()
const optimizedCoverUrl = computed(() => optimized(props.coverUrl, 360))

const { locale } = useI18n()
const compactFmt = computed(() => compactNumberFormat(locale.value))

const formattedRating = computed(() => (props.rating
  ? props.rating.toFixed(1)
  : '0.0'))
const formattedRatingCount = computed(() => (props.ratingCount
  ? `(${compactFmt.value.format(props.ratingCount)})`
  : '(0)'))
const formattedReaders = computed(() => (props.readers
  ? compactFmt.value.format(props.readers)
  : '0'))
const visibleAuthors = computed(() => props.authorNames.slice(0, 2))
const coverBg = computed(() => hashColor(props.title, props.authorNames.join(',')))
</script>

<template>
  <article
    class="book-preview-card"
    :class="compact
      ? 'compact'
      : 'full'"
  >
    <span
      v-if="badge"
      class="card-badge"
      :class="`bg-${badgeColor}`"
    >
      {{ badge }}
    </span>

    <NuxtLinkLocale
      :to="linkTo ?? `/books/${slug}`"
      class="card-link"
      :aria-label="title"
    />

    <div
      class="cover-zone"
      :style="{'backgroundColor': coverBg}"
    >
      <img
        v-if="coverUrl"
        :src="optimizedCoverUrl"
        :alt="title"
        width="240"
        height="360"
        loading="lazy"
        decoding="async"
        class="cover-img"
      >
    </div>

    <div class="info-zone">
      <div
        class="card-title title-link"
        :class="compact
          ? 'line-clamp-1'
          : 'line-clamp-2'"
      >
        {{ title }}
      </div>

      <div
        v-if="visibleAuthors.length > 0"
        class="authors-row line-clamp-1"
      >
        <template
          v-for="(name, i) in visibleAuthors"
          :key="authorSlugs[i] ?? name"
        >
          <NuxtLinkLocale
            :to="`/authors/${authorSlugs[i] ?? ''}`"
            class="author-link"
          >
            {{ name }}
          </NuxtLinkLocale>

          <span v-if="i < visibleAuthors.length - 1">, </span>
        </template>
      </div>

      <div class="flex-grow" />

      <div class="stats-row">
        <span class="stat">
          <svg
            class="stat-icon"
            aria-hidden="true"
          ><use
            href="#icon-star"
            fill="rgb(var(--v-theme-warning))"
          /></svg>
          {{ formattedRating }} {{ formattedRatingCount }}
        </span>

        <span class="stat">
          <svg
            class="stat-icon"
            aria-hidden="true"
          ><use
            href="#icon-account-multiple"
            fill="rgb(var(--v-theme-info))"
          /></svg>
          {{ formattedReaders }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.book-preview-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: border-color 0.15s, box-shadow 0.15s;
}

.book-preview-card:hover {
  border-color: rgba(var(--v-border-color), 0.3);
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.18);
}

.book-preview-card.full {
  height: 360px;
}

.book-preview-card.compact {
  height: 100%;
}

.card-link {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.card-badge {
  position: absolute;
  z-index: 2;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-primary));
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

.compact .stat-icon {
  width: 10px;
  height: 10px;
}

.cover-zone {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info-zone {
  display: flex;
  flex-direction: column;
  padding: 8px 12px 8px 12px;
}

.card-title {
  font-weight: 700;
  font-size: 0.875rem;
}

.title-link {
  position: relative;
  z-index: 2;
  pointer-events: none;
  transition: color 0.15s;
}

.book-preview-card:hover .title-link {
  color: rgb(var(--v-theme-primary));
}

/*
 * `text-secondary`, not `on-surface-variant`. The theme in plugins/vuetify.ts
 * spells its key `onSurfaceVariant`, and Vuetify emits variable names verbatim
 * — so `--v-theme-on-surface-variant` is not ours at all, it survives from
 * Vuetify's default theme as near-white (#EEE) in light and black in dark.
 * Either way it is invisible against our card surface.
 */
.authors-row {
  position: relative;
  z-index: 2;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-text-secondary));
  margin-top: 4px;
}

.author-link {
  position: relative;
  z-index: 2;
  color: inherit;
  text-decoration: none;
}

.author-link:hover {
  color: rgb(var(--v-theme-primary));
}

.flex-grow {
  flex-grow: 1;
}

.stats-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-text-secondary));
  margin-top: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
}

.stat {
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

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
</style>
