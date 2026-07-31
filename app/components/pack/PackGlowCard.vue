<script setup lang="ts">
import gsap from 'gsap'

interface Props {
  rarityColor: string
}

const { rarityColor } = defineProps<Props>()
const emit = defineEmits<{ glowComplete: [] }>()

const cardRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)
let tl: gsap.core.Timeline | null = null

onMounted(() => {
  if (!cardRef.value || !glowRef.value)
    return

  tl = gsap.timeline({
    onComplete: () => emit('glowComplete'),
  })

  tl.fromTo(
    cardRef.value,
    { scale: 0.5, opacity: 0, y: 40 },
    { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)' },
  )
  tl.fromTo(
    glowRef.value,
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: 'power2.out' },
    '-=0.3',
  )
  tl.to({}, { duration: 2 })
})

onUnmounted(() => {
  tl?.kill()
  tl = null
})
</script>

<template>
  <div class="glow-stage d-flex align-center justify-center">
    <!-- Floor glow beam -->
    <div
      ref="glowRef"
      class="floor-beam"
      :style="{'background': `radial-gradient(ellipse 500px 580px at 50% 50%, ${rarityColor}88 0%, ${rarityColor}33 40%, transparent 70%)`}"
    />

    <!-- Mystery card -->
    <div
      ref="cardRef"
      class="mystery-card"
    >
      <div
        class="card-glow-ring"
        :style="{'box-shadow': `0 0 40px 8px ${rarityColor}44, 0 0 80px 20px ${rarityColor}22`}"
      />

      <div class="card-inner">
        <span
          class="question-mark"
          :style="{'color': rarityColor}"
        >?</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glow-stage {
  position: relative;
  width: 100%;
  min-height: calc(100dvh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.floor-beam {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.mystery-card {
  position: relative;
  z-index: 1;
  width: 180px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-glow-ring {
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  pointer-events: none;
}

.card-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.question-mark {
  font-size: 7rem;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 0 30px currentColor;
}

@media (prefers-reduced-motion: no-preference) {
  .question-mark {
    animation: question-pulse 1.5s ease-in-out infinite;
  }
}

@keyframes question-pulse {
  0%, 100% { opacity: 0.8; text-shadow: 0 0 20px currentColor; }
  50% { opacity: 1; text-shadow: 0 0 50px currentColor; }
}
</style>
