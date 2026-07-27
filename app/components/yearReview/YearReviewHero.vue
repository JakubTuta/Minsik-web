<script setup lang="ts">
import gsap from 'gsap'

interface Props {
  year: number
  monthsElapsed: number
  totalBooksFinished: number
  coverUrls: string[]
}

const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const { monthName: monthNameOf } = useMonthName()

const chipRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const deckRef = ref<HTMLElement | null>(null)

const currentMonthName = computed(() => monthNameOf(Math.max(props.monthsElapsed, 1)))
const firstMonthName = computed(() => monthNameOf(1))

const deckCovers = computed(() => props.coverUrls.slice(0, 5))

function cardStyle(index: number, total: number) {
  const mid = (total - 1) / 2
  const offset = index - mid
  const rotate = offset * 7
  const translateX = offset * 46
  const translateY = Math.abs(offset) * 14

  return {
    transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`,
    zIndex: String(total - Math.abs(offset)),
  }
}

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const tl = gsap.timeline()

  tl.from([chipRef.value, titleRef.value, subtitleRef.value], {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power3.out',
  })

  if (deckRef.value && !prefersReducedMotion) {
    const cards = Array.from(deckRef.value.querySelectorAll('.deck-card'))
    tl.from(cards, {
      opacity: 0,
      y: 60,
      scale: 0.8,
      rotate: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'back.out(1.4)',
    }, '-=0.3')
  }
})
</script>

<template>
  <div class="year-review-hero overflow-hidden">
    <div class="hero-bg-glow" />

    <v-container class="position-relative z-1 py-12">
      <v-row
        align="center"
        justify="space-between"
      >
        <v-col
          cols="12"
          md="6"
          class="text-md-left mb-md-0 mb-16 text-center"
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
              {{ firstMonthName }} – {{ currentMonthName }}
            </v-chip>
          </div>

          <h1
            ref="titleRef"
            class="hero-title font-weight-black mb-6"
          >
            {{ t('yearReview.heroTitlePrefix') }} <span class="year-number text-primary">{{ year }}</span>

            <span class="d-block">{{ t('yearReview.heroTitleSuffix') }}</span>
          </h1>

          <p
            ref="subtitleRef"
            class="text-h6 text-medium-emphasis hero-subtitle mx-md-0 mx-auto"
          >
            <template v-if="totalBooksFinished > 0">
              {{ t('yearReview.finishedSoFar', {"count": totalBooksFinished}) }}
            </template>

            <template v-else>
              {{ t('yearReview.justGettingStarted', {year}) }}
            </template>
          </p>
        </v-col>

        <v-col
          v-if="deckCovers.length > 0"
          cols="12"
          md="5"
          class="d-flex justify-center"
        >
          <div
            ref="deckRef"
            class="cover-deck"
          >
            <div
              v-for="(cover, index) in deckCovers"
              :key="index"
              class="deck-card"
              :style="cardStyle(index, deckCovers.length)"
            >
              <v-img
                :src="cover"
                lazy-src="/placeholder-book-lazy.jpg"
                :alt="t('yearReview.bookCoverAlt')"
                width="150"
                height="225"
                cover
                class="deck-img rounded-lg"
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
    rgba(var(--v-theme-surface-variant), 0.35) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.hero-bg-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 25%, rgba(var(--v-theme-primary), 0.14) 0%, transparent 45%),
    radial-gradient(circle at 85% 70%, rgba(var(--v-theme-secondary), 0.1) 0%, transparent 45%);
  pointer-events: none;
  z-index: 0;
}

.z-1 {
  z-index: 1;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -2px;
}

.year-number {
  text-shadow: 0 0 40px rgba(var(--v-theme-primary), 0.45);
}

.hero-subtitle {
  max-width: 460px;
  line-height: 1.6;
}

.cover-deck {
  position: relative;
  width: 150px;
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deck-card {
  position: absolute;
  transform-origin: bottom center;
}

.deck-img {
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(var(--v-theme-surface), 1);
}
</style>
