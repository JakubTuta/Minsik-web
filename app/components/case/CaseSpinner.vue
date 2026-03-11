<script setup lang="ts">
import type { OpenCaseData } from '~/types/case'
import gsap from 'gsap'
import { useDisplay } from 'vuetify'
import { RARITY_COLORS } from '~/types/case'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  data: OpenCaseData
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'spin-complete': [] }>()

const { mobile } = useDisplay()

const containerRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

const ITEM_WIDTH = computed(() => (mobile.value
  ? 120
  : 160))
const ITEM_GAP = 12
const SLOT_SIZE = computed(() => ITEM_WIDTH.value + ITEM_GAP)

onMounted(async () => {
  await nextTick()
  if (!containerRef.value || !trackRef.value)
    return

  const viewportWidth = containerRef.value.offsetWidth
  const winIdx = props.data.winning_index

  const targetX = -(winIdx * SLOT_SIZE.value + ITEM_WIDTH.value / 2 - viewportWidth / 2)
  const randomOffset = (Math.random() - 0.5) * (ITEM_WIDTH.value * 0.4)
  const startX = SLOT_SIZE.value * 3

  gsap.fromTo(
    trackRef.value,
    { x: startX },
    {
      x: targetX + randomOffset,
      duration: 6.5,
      ease: 'power4.out',
      onComplete: () => emit('spin-complete'),
    },
  )
})

function getItemStyle(rarity: string | null | undefined) {
  const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] ?? '#95A5A6'

  return {
    borderTop: `4px solid ${color}`,
    boxShadow: `0 0 12px ${color}33`,
  }
}

function getGlowStyle(rarity: string | null | undefined) {
  const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] ?? '#95A5A6'

  return { background: `linear-gradient(to bottom, ${color}44, transparent 50%)` }
}
</script>

<template>
  <div class="spinner-outer">
    <!-- Pointer indicator -->
    <div class="spinner-pointer">
      <div class="pointer-arrow" />

      <div class="pointer-line" />
    </div>

    <!-- Scroll viewport -->
    <div
      ref="containerRef"
      class="spinner-viewport"
    >
      <!-- Gradient overlays for fade effect -->
      <div class="fade-left" />

      <div class="fade-right" />

      <!-- Scrolling track -->
      <div
        ref="trackRef"
        class="spinner-track"
      >
        <div
          v-for="(item, index) in data.display_list"
          :key="`${item.book_id}-${index}`"
          class="spinner-item"
          :style="{'width': `${ITEM_WIDTH}px`}"
        >
          <div
            class="item-card h-100"
            :style="getItemStyle(item.rarity)"
          >
            <!-- Rarity glow overlay -->
            <div
              class="rarity-glow"
              :style="getGlowStyle(item.rarity)"
            />

            <!-- Book card -->
            <BookPreviewCard
              compact
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
  </div>
</template>

<style scoped>
.spinner-outer {
  position: relative;
  width: 100%;
}

.spinner-pointer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.pointer-arrow {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 14px solid rgb(var(--v-theme-primary));
  filter: drop-shadow(0 0 6px rgba(var(--v-theme-primary), 0.8));
}

.pointer-line {
  width: 2px;
  height: 285px;
  background: linear-gradient(
    to bottom,
    rgb(var(--v-theme-primary)),
    rgba(var(--v-theme-primary), 0.2)
  );
}

.spinner-viewport {
  overflow: hidden;
  height: 290px;
  position: relative;
  border-radius: 8px;
}

.fade-left,
.fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120px;
  z-index: 10;
  pointer-events: none;
}

.fade-left {
  left: 0;
  background: linear-gradient(to right, rgb(var(--v-theme-surface)), transparent);
}

.fade-right {
  right: 0;
  background: linear-gradient(to left, rgb(var(--v-theme-surface)), transparent);
}

.spinner-track {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  will-change: transform;
  align-items: stretch;
  height: 100%;
}

.spinner-item {
  flex-shrink: 0;
  height: 100%;
}

.item-card {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.rarity-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  pointer-events: none;
  z-index: 1;
}
</style>
