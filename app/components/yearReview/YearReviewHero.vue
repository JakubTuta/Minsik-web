<script setup lang="ts">
import gsap from 'gsap'

interface Props {
  year: number
  monthsElapsed: number
  totalBooksFinished: number
  coverUrls: string[]
}

const props = defineProps<Props>()

const themeStore = useThemeStore()

const chipRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const visualRef = ref<HTMLElement | null>(null)

const monthName = computed(() => {
  const date = new Date(props.year, Math.max(props.monthsElapsed - 1, 0), 1)

  return date.toLocaleString('en-US', { month: 'long' })
})

const collageCovers = computed(() => props.coverUrls.slice(0, 4))

onMounted(() => {
  const tl = gsap.timeline()

  tl.from([chipRef.value, titleRef.value, subtitleRef.value], {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power3.out',
  })

  if (visualRef.value) {
    tl.from(visualRef.value, {
      opacity: 0,
      scale: 0.95,
      x: 30,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.6')
  }
})
</script>

<template>
  <div class="year-review-hero overflow-hidden py-8">
    <div class="hero-bg-glow" />

    <v-container class="position-relative z-1">
      <v-row
        align="center"
        justify="space-between"
      >
        <v-col
          cols="12"
          md="6"
          class="text-md-left mb-md-0 mb-10 text-center"
        >
          <div
            ref="chipRef"
            class="d-inline-block mb-6"
          >
            <v-chip
              color="primary"
              :variant="themeStore.isDark
                ? `tonal`
                : `elevated`"
              size="large"
              class="font-weight-bold"
            >
              <v-icon
                icon="mdi-calendar-star"
                class="mr-2"
              />
              January – {{ monthName }}
            </v-chip>
          </div>

          <h1
            ref="titleRef"
            class="text-h2 text-md-h1 font-weight-black hero-title mb-6"
          >
            Your <span class="text-primary glow-text">{{ year }}</span>

            <br>
            in books — so far
          </h1>

          <p
            ref="subtitleRef"
            class="text-h6 text-medium-emphasis hero-subtitle mx-md-0 mx-auto"
          >
            <template v-if="totalBooksFinished > 0">
              {{ totalBooksFinished }} {{ totalBooksFinished === 1
                ? 'book'
                : 'books' }} finished and counting.
            </template>

            <template v-else>
              Your reading story for {{ year }} is just getting started.
            </template>
          </p>
        </v-col>

        <v-col
          v-if="collageCovers.length > 0"
          cols="12"
          md="5"
          offset-md="1"
          class="position-relative"
        >
          <div
            ref="visualRef"
            class="hero-visual-container"
          >
            <div class="hero-visual-glow" />

            <div class="position-relative z-1 w-100">
              <CoversCollage
                :covers="collageCovers"
                height="360px"
              />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.year-review-hero {
  position: relative;
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface-variant), 0.3) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.hero-bg-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: radial-gradient(circle at 20% 30%, rgba(var(--v-theme-primary), 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.z-1 {
  z-index: 1;
}

.hero-title {
  line-height: 1.1;
  letter-spacing: -1px;
}

.glow-text {
  text-shadow: 0 0 30px rgba(var(--v-theme-primary), 0.4);
}

.hero-subtitle {
  max-width: 480px;
  line-height: 1.6;
}

.hero-visual-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-visual-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.15) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}
</style>
