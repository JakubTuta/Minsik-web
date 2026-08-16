<script setup lang="ts">
import type { OpenCaseData, Rarity } from '~/types/case'
import gsap from 'gsap'
import { useDisplay } from 'vuetify'

interface Props {
  data: OpenCaseData
}

const props = defineProps<Props>()
const emit = defineEmits<{ spinComplete: [] }>()

const { mobile } = useDisplay()
const { RARITY_ICONS, getRandomRarity, getIconColor } = useRarity()

const containerRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

const ITEM_WIDTH = computed(() => (mobile.value
  ? 120
  : 160))
const ITEM_GAP = 12
const SLOT_SIZE = computed(() => ITEM_WIDTH.value + ITEM_GAP)

// Generate 40 items for a smooth long spin.
// We will land on index 35.
const generatedList = ref<Rarity[]>([])

function initializeTrack() {
  const list = Array.from({ length: 40 }, () => getRandomRarity())
  // The winner is placed at our landing index
  list[35] = props.data.winner.rarity as Rarity
  generatedList.value = list
}

let tween: gsap.core.Tween | null = null

onMounted(async () => {
  initializeTrack()
  await nextTick()
  if (!containerRef.value || !trackRef.value)
    return

  const viewportWidth = containerRef.value.offsetWidth
  const winIdx = 35 // Always land on index 35

  const targetX = -(winIdx * SLOT_SIZE.value + ITEM_WIDTH.value / 2 - viewportWidth / 2)
  const randomOffset = (Math.random() - 0.5) * (ITEM_WIDTH.value * 0.4)
  const startX = SLOT_SIZE.value * 3

  tween = gsap.fromTo(
    trackRef.value,
    { x: startX },
    {
      x: targetX + randomOffset,
      duration: 6.5,
      ease: 'power4.out',
      onComplete: () => emit('spinComplete'),
    },
  )
})

onUnmounted(() => {
  tween?.kill()
  tween = null
})

function getGlowStyle(rarity: string | null | undefined) {
  const color = getIconColor(rarity)

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
      :style="{'height': `${ITEM_WIDTH}px`}"
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
          v-for="(rarity, index) in generatedList"
          :key="index"
          class="spinner-item"
          :style="{
            'width': `${ITEM_WIDTH}px`,
            'borderColor': getIconColor(rarity),
            'backgroundColor': `${getIconColor(rarity)}15`,
          }"
        >
          <!-- Rarity glow overlay -->
          <div
            class="rarity-glow"
            :style="getGlowStyle(rarity)"
          />

          <!-- Rarity Icon -->
          <v-icon
            :icon="RARITY_ICONS[rarity as Rarity] || RARITY_ICONS.common"
            :color="getIconColor(rarity)"
            :size="ITEM_WIDTH * 0.5"
            class="slot-icon"
          />
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
  height: 140px;
  background: linear-gradient(
    to bottom,
    rgb(var(--v-theme-primary)),
    rgba(var(--v-theme-primary), 0.2)
  );
}

.spinner-viewport {
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  background: #111;
  border: 4px solid #333;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.8);
}

.fade-left,
.fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  z-index: 10;
  pointer-events: none;
}

.fade-left {
  left: 0;
  background: linear-gradient(to right, #111 0%, transparent 100%);
}

.fade-right {
  right: 0;
  background: linear-gradient(to left, #111 0%, transparent 100%);
}

.spinner-track {
  display: flex;
  gap: 12px;
  padding: 0 12px;
  will-change: transform;
  align-items: center;
  height: 100%;
}

.spinner-item {
  flex-shrink: 0;
  height: calc(100% - 24px);
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 2px solid;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
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

.slot-icon {
  filter: drop-shadow(0 0 8px currentColor);
  z-index: 2;
}
</style>
