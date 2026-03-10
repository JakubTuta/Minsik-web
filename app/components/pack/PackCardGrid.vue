<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import type { Rarity } from '~/types/case'
import gsap from 'gsap'
import { RARITY_COLORS, RARITY_LABELS } from '~/types/case'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

const props = defineProps<Props>()
const emit = defineEmits<{
  reveal: [index: number]
  openAnother: []
}>()
const { preloadImages } = useImagePreloader()
const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

function cardRating(item: BookSummary): string {
  const r = weightedRating(item.avg_rating, item.rating_count, item.ol_avg_rating, item.ol_rating_count)
  const c = totalRatingCount(item.rating_count, item.ol_rating_count)
  if (!r || !c)
    return '—'

  return `${r.toFixed(2)} (${compactFmt.format(c)})`
}

function cardReaders(item: BookSummary): string {
  const n = totalReaders(item.app_want_to_read_count, item.app_reading_count, item.app_read_count, item.ol_want_to_read_count, item.ol_currently_reading_count, item.ol_already_read_count)

  return n
    ? compactFmt.format(n)
    : '—'
}

interface Props {
  items: BookSummary[]
  revealedCards: Set<number>
}

const cardRefs = ref<(HTMLElement | null)[]>([])
const cardInnerRefs = ref<(HTMLElement | null)[]>([])
const flippingCards = ref(new Set<number>())

function getRarityColor(rarity: string | null | undefined) {
  return RARITY_COLORS[(rarity as Rarity) ?? 'common'] ?? '#95A5A6'
}

function getRarityLabel(rarity: string | null | undefined) {
  return RARITY_LABELS[(rarity as Rarity) ?? 'common'] ?? rarity
}

function isRevealed(index: number) {
  return props.revealedCards.has(index)
}

function handleCardClick(index: number) {
  if (isRevealed(index) || flippingCards.value.has(index))
    return

  const innerEl = cardInnerRefs.value[index]
  if (!innerEl)
    return

  flippingCards.value.add(index)

  gsap.to(innerEl, {
    rotateY: 180,
    duration: 0.55,
    ease: 'power2.inOut',
    onComplete: () => {
      flippingCards.value.delete(index)
      emit('reveal', index)
    },
  })
}

onMounted(async () => {
  await nextTick()
  preloadImages(props.items.map(i => i.primary_cover_url))

  const els = cardRefs.value.filter(Boolean)
  if (!els.length)
    return

  gsap.fromTo(
    els,
    { y: 50, opacity: 0, scale: 0.85 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.45,
      stagger: 0.07,
      ease: 'back.out(1.4)',
    },
  )
})
</script>

<template>
  <div class="pack-grid-wrapper d-flex flex-column align-center w-100">
    <div class="pack-card-grid">
      <div
        v-for="(item, index) in items"
        :key="item.book_id"
        :ref="(el) => {
          cardRefs[index] = el as HTMLElement | null
        }"
        class="pack-card-slot"
        :class="{'is-revealed': isRevealed(index),
                 'is-flipping': flippingCards.has(index)}"
        :style="{'--rarity-color': getRarityColor(item.rarity)}"
        @click="handleCardClick(index)"
      >
        <div
          :ref="(el) => {
            cardInnerRefs[index] = el as HTMLElement | null
          }"
          class="card-inner"
        >
          <!-- Face-down -->
          <div class="card-face card-back">
            <div class="card-back-glow" />

            <div class="card-back-inner">
              <img
                src="/favicon.svg"
                alt="?"
                class="card-back-logo"
                width="48"
                height="48"
                draggable="false"
              >

              <span class="card-back-question">?</span>
            </div>
          </div>

          <!-- Face-up (revealed) -->
          <div class="card-face card-front">
            <div class="card-front-glow" />

            <!-- Rarity badge -->
            <div class="card-rarity-badge">
              <span
                class="rarity-chip text-caption font-weight-bold text-uppercase"
                :style="{'backgroundColor': getRarityColor(item.rarity),
                         'color': '#fff'}"
              >
                {{ getRarityLabel(item.rarity) }}
              </span>
            </div>

            <!-- Book cover -->
            <div class="card-cover-area">
              <v-img
                :src="item.primary_cover_url || '/placeholder-book-lazy.jpg'"
                :alt="item.title"
                lazy-src="/placeholder-book-lazy.jpg"
                width="100"
                height="148"
                contain
                class="card-cover-img"
              />
            </div>

            <!-- Book info -->
            <div class="card-info px-2 pb-2">
              <NuxtLink
                :to="`/books/${item.slug}`"
                class="card-title text-caption font-weight-bold text-decoration-none"
              >
                {{ item.title }}
              </NuxtLink>

              <NuxtLink
                v-if="item.authors[0]"
                :to="`/authors/${item.authors[0].slug}`"
                class="card-author text-caption text-medium-emphasis text-decoration-none"
              >
                {{ item.authors[0].name }}
              </NuxtLink>

              <div class="card-stats mt-1">
                <v-icon
                  size="9"
                  color="amber"
                >
                  mdi-star
                </v-icon>

                <span class="stat-text">{{ cardRating(item) }}</span>

                <span class="stat-sep">·</span>

                <v-icon
                  size="9"
                  class="text-medium-emphasis"
                >
                  mdi-account-multiple
                </v-icon>

                <span class="stat-text text-medium-emphasis">{{ cardReaders(item) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Open Another button -->
    <v-btn
      class="mt-16"
      variant="outlined"
      prepend-icon="mdi-refresh"
      @click="emit('openAnother')"
    >
      Open Another Pack
    </v-btn>
  </div>
</template>

<style scoped>
.pack-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  width: 100%;
  max-width: 800px;
}

@media (max-width: 599px) {
  .pack-card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    max-width: 380px;
  }
}

.pack-card-slot {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 10px;
  cursor: pointer;
  perspective: 900px;
  user-select: none;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.pack-card-slot.is-revealed {
  cursor: default;
}

.pack-card-slot:not(.is-revealed):not(.is-flipping):hover {
  transform: translateY(-6px) scale(1.04);
  filter: brightness(1.2);
}

.card-inner {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Face-Down */
.card-back {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.card-back-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 80%, var(--rarity-color, #3498DB) 0%, transparent 65%);
  opacity: 0.25;
  pointer-events: none;
  border-radius: 10px;
}

.card-back-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.card-back-logo {
  filter: drop-shadow(0 0 8px rgba(100, 180, 255, 0.6));
  opacity: 0.9;
}

.card-back-question {
  font-size: 2rem;
  font-weight: 900;
  color: var(--rarity-color, #3498DB);
  text-shadow: 0 0 12px var(--rarity-color, #3498DB);
  line-height: 1;
}

/* Face-Up */
.card-front {
  transform: rotateY(180deg);
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: default;
}

.card-front-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, var(--rarity-color, #3498DB) 0%, transparent 100%);
  opacity: 0.12;
  pointer-events: none;
  border-radius: 10px 10px 0 0;
}

.card-rarity-badge {
  position: absolute;
  top: 6px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 2;
}

.rarity-chip {
  padding: 1px 5px;
  border-radius: 70px;
  font-size: 0.4rem;
  letter-spacing: 0.04em;
}

.card-cover-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 28px;
  padding-bottom: 2px;
  position: relative;
  z-index: 1;
}

.card-cover-img {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.card-info {
  position: relative;
  z-index: 1;
}

.card-title {
  display: -webkit-box;
  font-size: 0.7rem;
  line-height: 1.3;
  overflow: hidden;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 2px;
}

.card-author {
  display: block;
  font-size: 0.6rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: rgb(var(--v-theme-on-surface-variant, var(--v-medium-emphasis-opacity)));
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.stat-text {
  font-size: 0.6rem;
  line-height: 1;
  white-space: nowrap;
}

.stat-sep {
  font-size: 0.6rem;
  opacity: 0.4;
  margin: 0 1px;
}
</style>
