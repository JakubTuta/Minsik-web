<script setup lang="ts">
import type { Rarity, SpinSlotsData } from '~/types/case'
import gsap from 'gsap'
import { useDisplay } from 'vuetify'
import { RARITY_COLORS } from '~/types/case'

interface Props {
  data: SpinSlotsData | null
  spinning: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ spinComplete: [] }>()

const { mobile } = useDisplay()

const machineRef = ref<HTMLElement | null>(null)
const reelsRef = ref<HTMLElement[]>([])

const ICONS: Record<Rarity, string> = {
  legendary: 'mdi-snowflake',
  ultra_rare: 'mdi-diamond-stone',
  super_rare: 'mdi-star-shooting',
  rare: 'mdi-star',
  uncommon: 'mdi-shield-star',
  common: 'mdi-circle',
}

const ITEM_SIZE = computed(() => (mobile.value
  ? 80
  : 120))
const GAP = computed(() => (mobile.value
  ? 8
  : 16))
const TOTAL_ITEM_SIZE = computed(() => ITEM_SIZE.value + GAP.value)
const MACHINE_EXTRA_HEIGHT = 40 // 16px padding * 2 + 4px border * 2

// 3 columns
const reelsContent = ref<Rarity[][]>([[], [], []])

function getRandomRarity(): Rarity {
  const rand = Math.random()
  if (rand < 0.015)
    return 'legendary'
  if (rand < 0.05)
    return 'ultra_rare'
  if (rand < 0.15)
    return 'super_rare'
  if (rand < 0.35)
    return 'rare'
  if (rand < 0.65)
    return 'uncommon'

  return 'common'
}

function initializeReels() {
  const initial: Rarity[][] = [[], [], []]
  for (let c = 0; c < 3; c++) {
    // 30 items per reel for long spin
    const col = Array.from({ length: 30 }, () => getRandomRarity())

    // We will land on index 27 (so indices 26, 27, 28 are visible in 3x3)
    // 27 is the middle row.
    if (props.data && props.data.items[c]) {
      col[27] = props.data.items[c]
    }
    else {
      col[27] = getRandomRarity()
    }

    // We need the first item to match the current view to avoid jump
    col[1] = 'legendary' // changed from 'common' to 'legendary'

    initial[c] = col
  }
  reelsContent.value = initial
}

onMounted(async () => {
  initializeReels()
  await nextTick()
  gsap.set(reelsRef.value, { y: -TOTAL_ITEM_SIZE.value }) // Start with index 1 in the middle
})

watch(() => props.spinning, async (isSpinning) => {
  if (isSpinning) {
    if (props.data) {
      // Update target items
      for (let c = 0; c < 3; c++) {
        reelsContent.value[c][27] = props.data.items[c]
      }
    }

    // Animate machine to show 3 rows
    gsap.to(machineRef.value, {
      height: TOTAL_ITEM_SIZE.value * 3 - GAP.value + MACHINE_EXTRA_HEIGHT,
      duration: 0.5,
      ease: 'power2.inOut',
    })

    await nextTick()

    // Spin reels
    reelsRef.value.forEach((reel, i) => {
      // We want index 27 to end up in the middle.
      // Since height is 3 items, the middle item is offset by 1.
      // So y translation should be -(27 - 1) * TOTAL_ITEM_SIZE.value
      const targetY = -26 * TOTAL_ITEM_SIZE.value

      gsap.to(reel, {
        y: targetY,
        duration: 4 + i * 0.8,
        ease: 'power3.inOut',
        onComplete: () => {
          if (i === 2) {
            emit('spinComplete')
          }
        },
      })
    })
  }
  else {
    // reset to 1 row
    initializeReels() // reset contents for next spin
    gsap.set(reelsRef.value, { y: -TOTAL_ITEM_SIZE.value })
    gsap.to(machineRef.value, {
      height: ITEM_SIZE.value + MACHINE_EXTRA_HEIGHT,
      duration: 0.5,
      ease: 'power2.inOut',
    })
  }
})

function getIconColor(rarity: Rarity) {
  return RARITY_COLORS[rarity]
}
</script>

<template>
  <div class="slots-container">
    <div
      ref="machineRef"
      class="slots-machine"
      :style="{'height': `${ITEM_SIZE + 40}px`}"
    >
      <!-- Gradient overlays for top and bottom -->
      <div
        class="fade-top"
        :style="{'opacity': spinning
          ? 1
          : 0}"
      />

      <div
        class="fade-bottom"
        :style="{'opacity': spinning
          ? 1
          : 0}"
      />

      <div
        class="reels-wrapper"
        :style="{'gap': `${GAP}px`}"
      >
        <div
          v-for="(reel, i) in reelsContent"
          :key="i"
          ref="reelsRef"
          class="reel"
          :style="{'gap': `${GAP}px`}"
        >
          <div
            v-for="(item, j) in reel"
            :key="`${i}-${j}`"
            class="slot-item"
            :style="{
              'width': `${ITEM_SIZE}px`,
              'height': `${ITEM_SIZE}px`,
              'borderColor': getIconColor(item),
              'backgroundColor': `${getIconColor(item)}15`,
            }"
          >
            <v-icon
              :icon="ICONS[item]"
              :color="getIconColor(item)"
              :size="ITEM_SIZE * 0.5"
              class="slot-icon"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slots-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.slots-machine {
  position: relative;
  overflow: hidden;
  background: #111;
  border-radius: 16px;
  border: 4px solid #333;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.8);
  padding: 16px;
  display: flex;
  align-items: flex-start;
}

.fade-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, #111 0%, transparent 100%);
  z-index: 10;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.fade-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to top, #111 0%, transparent 100%);
  z-index: 10;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.reels-wrapper {
  display: flex;
  height: max-content;
}

.reel {
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.slot-item {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid;
  border-radius: 12px;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.slot-icon {
  filter: drop-shadow(0 0 8px currentColor);
}
</style>
