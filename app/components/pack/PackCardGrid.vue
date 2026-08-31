<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import type { Rarity } from '~/types/case'
import gsap from 'gsap'
import { RARITY_COLORS } from '~/types/case'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

const props = defineProps<Props>()
const emit = defineEmits<{
  reveal: [index: number]
  openAnother: []
}>()
const { t } = useI18n()
const { rarityLabels } = useRarityLabels()
const { preloadImages } = useImagePreloader()

interface Props {
  items: BookSummary[]
  revealedCards: Set<number>
}

const cardRefs = ref<(HTMLElement | null)[]>([])
const cardInnerRefs = ref<(HTMLElement | null)[]>([])
const flippingCards = ref(new Set<number>())
const activeTweens = new Set<gsap.core.Tween>()

function getRarityColor(rarity: string | null | undefined) {
  return RARITY_COLORS[(rarity as Rarity) ?? 'common'] ?? '#95A5A6'
}

function getRarityLabel(rarity: string | null | undefined) {
  return rarityLabels.value[(rarity as Rarity) ?? 'common'] ?? ''
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

  const tween = gsap.to(innerEl, {
    rotateY: 180,
    duration: 0.55,
    ease: 'power2.inOut',
    onComplete: () => {
      activeTweens.delete(tween)
      flippingCards.value.delete(index)
      emit('reveal', index)
    },
  })
  activeTweens.add(tween)
}

onMounted(async () => {
  await nextTick()
  preloadImages(props.items.map(i => i.primary_cover_url))

  const els = cardRefs.value.filter(Boolean)
  if (!els.length)
    return

  const tween = gsap.fromTo(
    els,
    { y: 50, opacity: 0, scale: 0.85 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.45,
      stagger: 0.07,
      ease: 'back.out(1.4)',
      onComplete: () => activeTweens.delete(tween),
    },
  )
  activeTweens.add(tween)
})

onUnmounted(() => {
  activeTweens.forEach(tween => tween.kill())
  activeTweens.clear()
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
            <BookPreviewCard
              :badge="getRarityLabel(item.rarity)"
              :badge-color="getRarityColor(item.rarity)"
              :title="item.title"
              :slug="item.slug"
              :cover-url="item.primary_cover_url"
              :author-names="item.authors.map(a => a.name)"
              :author-slugs="item.authors.map(a => a.slug)"
              :rating="weightedRating(item.avg_rating, item.rating_count, item.ol_avg_rating, item.ol_rating_count)"
              :rating-count="totalRatingCount(item.rating_count, item.ol_rating_count)"
              :readers="totalReaders(item.app_want_to_read_count, item.app_reading_count, item.app_read_count, item.ol_want_to_read_count, item.ol_currently_reading_count, item.ol_already_read_count)"
            />
          </div>
        </div>
      </div>
    </div>

    <v-btn
      class="mt-16"
      variant="outlined"
      prepend-icon="mdi-refresh"
      @click="emit('openAnother')"
    >
      {{ t('pack.openAnother') }}
    </v-btn>
  </div>
</template>

<style scoped>
.pack-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 920px;
}

@media (max-width: 599px) {
  .pack-card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    max-width: 440px;
  }
}

.pack-card-slot {
  position: relative;
  height: 360px;
  border-radius: 16px;
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
  border-radius: 16px;
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
  border-radius: 16px;
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
  box-shadow: 0 0 0 1px var(--rarity-color, #3498DB), 0 10px 28px -12px var(--rarity-color, #3498DB);
  cursor: default;
}
</style>
