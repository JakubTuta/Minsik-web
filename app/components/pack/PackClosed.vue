<script setup lang="ts">
import gsap from 'gsap'

interface Props {
  opening?: boolean
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  open: []
}>()

const { t } = useI18n()

const packRef = ref<HTMLElement | null>(null)
let tween: gsap.core.Tween | null = null

watch(() => props.opening, (val) => {
  if (val && packRef.value) {
    tween = gsap.to(packRef.value, {
      keyframes: [
        { rotate: -4, scale: 1.06, duration: 0.1 },
        { rotate: 4, scale: 1.1, duration: 0.1 },
        { rotate: -3, scale: 1.12, duration: 0.1 },
        { rotate: 0, scale: 1.15, duration: 0.1 },
        { scale: 1.6, opacity: 0, duration: 0.45, ease: 'power2.in' },
      ],
    })
  }
})

onUnmounted(() => {
  tween?.kill()
  tween = null
})
</script>

<template>
  <div class="pack-wrapper d-flex flex-column align-center justify-center">
    <div
      ref="packRef"
      class="pack-container"
      :class="{
        'pack-idle': !opening && !disabled,
        'pack-opening': opening,
      }"
      @click="!disabled && !opening && emit('open')"
    >
      <!-- Outer ambient glow (whole pack) -->
      <div class="pack-ambient-glow" />

      <!-- Card pack SVG shape -->
      <svg
        class="pack-shape"
        viewBox="0 0 160 240"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="packGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stop-color="#1e3a5f"
            />

            <stop
              offset="50%"
              stop-color="#0d2240"
            />

            <stop
              offset="100%"
              stop-color="#1a2e4a"
            />
          </linearGradient>

          <linearGradient
            id="packShine"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stop-color="rgba(255,255,255,0.12)"
            />

            <stop
              offset="40%"
              stop-color="rgba(255,255,255,0.04)"
            />

            <stop
              offset="100%"
              stop-color="rgba(255,255,255,0)"
            />
          </linearGradient>

          <filter id="packGlow">
            <feGaussianBlur
              stdDeviation="3"
              result="blur"
            />

            <feComposite
              in="SourceGraphic"
              in2="blur"
              operator="over"
            />
          </filter>
        </defs>

        <!-- Main body -->
        <path
          d="
            M 10 0
            Q 20 4 30 1 Q 40 -2 50 2 Q 60 5 70 1 Q 80 -3 90 1 Q 100 4 110 0 Q 120 -2 130 1 Q 140 4 150 0
            L 150 240
            Q 140 236 130 239 Q 120 242 110 238 Q 100 235 90 239 Q 80 243 70 239 Q 60 236 50 240 Q 40 243 30 239 Q 20 236 10 240
            Z
          "
          fill="url(#packGrad)"
          stroke="rgba(100,180,255,0.3)"
          stroke-width="1"
        />

        <!-- Shine overlay -->
        <path
          d="
            M 10 0
            Q 20 4 30 1 Q 40 -2 50 2 Q 60 5 70 1 Q 80 -3 90 1 Q 100 4 110 0 Q 120 -2 130 1 Q 140 4 150 0
            L 150 240
            Q 140 236 130 239 Q 120 242 110 238 Q 100 235 90 239 Q 80 243 70 239 Q 60 236 50 240 Q 40 243 30 239 Q 20 236 10 240
            Z
          "
          fill="url(#packShine)"
        />

        <!-- Horizontal accent line -->
        <line
          x1="16"
          y1="60"
          x2="144"
          y2="60"
          stroke="rgba(100,180,255,0.2)"
          stroke-width="1"
        />

        <line
          x1="16"
          y1="180"
          x2="144"
          y2="180"
          stroke="rgba(100,180,255,0.2)"
          stroke-width="1"
        />

        <!-- Corner decorations -->
        <circle
          cx="24"
          cy="24"
          r="3"
          fill="rgba(100,180,255,0.3)"
        />

        <circle
          cx="136"
          cy="24"
          r="3"
          fill="rgba(100,180,255,0.3)"
        />

        <circle
          cx="24"
          cy="216"
          r="3"
          fill="rgba(100,180,255,0.3)"
        />

        <circle
          cx="136"
          cy="216"
          r="3"
          fill="rgba(100,180,255,0.3)"
        />
      </svg>

      <!-- Minsik logo centered on the pack -->
      <div class="pack-logo-wrap">
        <img
          src="/favicon.svg"
          :alt="t('app.name')"
          class="pack-logo"
          width="56"
          height="56"
          draggable="false"
        >

        <span class="pack-logo-text">{{ t('app.name') }}</span>
      </div>
    </div>

    <div
      class="mt-6 text-center"
      :class="{'opacity-0': opening}"
    >
      <div class="text-h6 font-weight-bold text-medium-emphasis">
        {{ t('pack.openABookPack') }}
      </div>

      <div class="text-body-2 text-medium-emphasis mt-1">
        {{ t('pack.clickToReveal') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.pack-wrapper {
  user-select: none;
}

.pack-container {
  position: relative;
  cursor: pointer;
  width: 160px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 960px) {
  .pack-container {
    width: 220px;
    height: 330px;
  }

  .pack-ambient-glow {
    inset: -60px;
  }

  .pack-logo {
    width: 72px;
    height: 72px;
  }

  .pack-logo-text {
    font-size: 1rem;
  }
}

.pack-ambient-glow {
  position: absolute;
  inset: -40px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(100, 180, 255, 0.18) 0%, transparent 65%);
  pointer-events: none;
  z-index: 0;
}

.pack-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  transition: filter 0.3s;
  filter: drop-shadow(0 0 12px rgba(100, 180, 255, 0.4));
}

.pack-logo-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pack-logo {
  filter: drop-shadow(0 0 8px rgba(100, 180, 255, 0.6));
}

.pack-logo-text {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: rgba(180, 220, 255, 0.85);
  text-transform: uppercase;
  text-shadow: 0 0 8px rgba(100, 180, 255, 0.7);
}

/* Idle floating animation */
@media (prefers-reduced-motion: no-preference) {
  .pack-idle {
    animation: pack-float 3s ease-in-out infinite;
  }

  .pack-idle .pack-shape {
    animation: pack-shape-glow 2.5s ease-in-out infinite;
  }

  .pack-idle .pack-ambient-glow {
    animation: pack-ambient-pulse 2.5s ease-in-out infinite;
  }
}

/* Hover */
.pack-idle:hover {
  transform: scale(1.05);
}

.pack-idle:hover .pack-shape {
  filter: drop-shadow(0 0 22px rgba(100, 180, 255, 0.75));
}

.pack-idle:hover .pack-ambient-glow {
  background: radial-gradient(ellipse at center, rgba(100, 180, 255, 0.3) 0%, transparent 65%);
}

.pack-opening {
  pointer-events: none;
}

.opacity-0 {
  opacity: 0;
  transition: opacity 0.3s;
}

@keyframes pack-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes pack-shape-glow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(100, 180, 255, 0.4)); }
  50% { filter: drop-shadow(0 0 28px rgba(100, 180, 255, 0.75)); }
}

@keyframes pack-ambient-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
</style>
