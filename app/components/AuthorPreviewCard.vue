<script setup lang="ts">
import { hashColor } from '~/utils/coverColor'
import { compactNumberFormat } from '~/utils/format'

interface Props {
  name: string
  slug: string
  photoUrl?: string | null
  bookCount?: number
  rating?: number
  ratingCount?: number
  readers?: number
  badge?: string
  badgeColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  photoUrl: null,
  bookCount: 0,
  rating: 0,
  ratingCount: 0,
  readers: 0,
  badge: undefined,
  badgeColor: 'success',
})

const { t, n, locale } = useI18n()
const { optimized } = useOptimizedImage()
const optimizedPhotoUrl = computed(() => optimized(props.photoUrl, 280))

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

const photoBg = computed(() => hashColor(props.name))
</script>

<template>
  <article class="author-preview-card">
    <span
      v-if="badge"
      class="card-badge"
      :class="`bg-${badgeColor}`"
    >
      {{ badge }}
    </span>

    <NuxtLinkLocale
      :to="`/authors/${slug}`"
      class="card-link"
      :aria-label="name"
    />

    <div class="avatar-zone">
      <div
        class="author-avatar"
        :style="{'backgroundColor': photoBg}"
      >
        <img
          v-if="photoUrl"
          :src="optimizedPhotoUrl"
          :alt="name"
          width="140"
          height="140"
          loading="lazy"
          decoding="async"
          class="avatar-img"
        >
      </div>
    </div>

    <div class="info-zone">
      <div class="card-name name-link line-clamp-2">
        {{ name }}
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

      <div class="book-count">
        {{ t('common.bookCount', {"count": n(bookCount)}, bookCount) }}
      </div>
    </div>
  </article>
</template>

<style scoped>
.author-preview-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 360px;
  border-radius: 16px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: border-color 0.15s, box-shadow 0.15s;
}

.author-preview-card:hover {
  border-color: rgba(var(--v-border-color), 0.3);
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.18);
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

.avatar-zone {
  height: 60%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-avatar {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.info-zone {
  height: 40%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 12px 8px 12px;
}

.card-name {
  font-weight: 700;
  font-size: 0.875rem;
}

.name-link {
  position: relative;
  z-index: 2;
  pointer-events: none;
  transition: color 0.15s;
}

.author-preview-card:hover .name-link {
  color: rgb(var(--v-theme-primary));
}

.flex-grow {
  flex-grow: 1;
}

/*
 * `text-secondary`, not `on-surface-variant` — see the note in
 * BookPreviewCard.vue. The kebab-case name resolves to Vuetify's default
 * theme, which is invisible against our surface in both light and dark.
 */
.stats-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
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

.book-count {
  position: relative;
  z-index: 2;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-text-secondary));
  margin-top: 4px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
