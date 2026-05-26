<script setup lang="ts">
import type { BookOfTheWeek } from '~/types/recommendations'
import gsap from 'gsap'

const themeStore = useThemeStore()
const recommendationsStore = useRecommendationsStore()

const iconRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const btnsRef = ref<HTMLElement | null>(null)
const visualRef = ref<HTMLElement | null>(null)

const { data: botw } = await useAsyncData<BookOfTheWeek | null>(
  'hero-book-of-the-week',
  () => recommendationsStore.fetchBookOfTheWeek(),
)

onMounted(() => {
  const tl = gsap.timeline()

  tl.from([iconRef.value, titleRef.value, subtitleRef.value, btnsRef.value], {
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
  <div class="hero-banner overflow-hidden py-8">
    <div class="hero-bg-glow" />

    <v-container class="position-relative z-1">
      <v-row
        align="center"
        justify="space-between"
      >
        <!-- Text Content -->
        <v-col
          cols="12"
          md="5"
          lg="5"
          class="text-md-left mb-md-0 mb-10 text-center"
        >
          <div
            ref="iconRef"
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
                icon="mdi-star-shooting"
                class="mr-2"
              />
              Welcome to Minsik
            </v-chip>
          </div>

          <h1
            ref="titleRef"
            class="text-h3 text-md-h2 font-weight-black hero-title mb-6"
          >
            Read.<br>

            Discover.<br>

            <span class="text-primary glow-text">Have Fun.</span>
          </h1>

          <p
            ref="subtitleRef"
            class="text-h6 text-medium-emphasis hero-subtitle mx-md-0 mx-auto mb-8"
          >
            A gamified reading experience. Track your journey, unlock mystery chests, pull the slot lever, and explore curated recommendations.
          </p>

          <div
            ref="btnsRef"
            class="d-flex ga-4 justify-md-start flex-wrap justify-center"
          >
            <v-btn
              to="/search"
              color="primary"
              size="x-large"
              variant="elevated"
              prepend-icon="mdi-magnify"
              class="font-weight-bold px-8"
              elevation="8"
            >
              Start Exploring
            </v-btn>

            <v-btn
              to="/play-slots"
              size="x-large"
              variant="tonal"
              color="warning"
              prepend-icon="mdi-slot-machine"
              class="font-weight-bold px-8"
            >
              Test Your Luck
            </v-btn>
          </div>
        </v-col>

        <!-- Book of the Week -->
        <v-col
          cols="12"
          md="6"
          offset-md="1"
          class="position-relative"
        >
          <div
            ref="visualRef"
            class="hero-visual-container"
          >
            <div class="hero-visual-glow" />

            <div class="position-relative z-1 w-100">
              <BookOfTheWeekCard
                v-if="botw"
                :book="botw"
              />

              <v-card
                v-else
                class="bg-surface-variant overflow-hidden"
                elevation="4"
                style="border-radius: 20px;"
              >
                <v-card-text class="pa-6">
                  <v-skeleton-loader
                    type="chip"
                    class="mb-4"
                    width="160"
                  />

                  <div class="d-flex ga-5">
                    <v-skeleton-loader
                      type="image"
                      width="120"
                      height="180"
                      class="flex-shrink-0"
                      style="border-radius: 8px;"
                    />

                    <div class="flex-grow-1">
                      <v-skeleton-loader
                        type="heading"
                        class="mb-2"
                      />

                      <v-skeleton-loader
                        type="text"
                        class="mb-3"
                        width="60%"
                      />

                      <v-skeleton-loader
                        type="text"
                        class="mb-3"
                        width="80%"
                      />

                      <v-skeleton-loader
                        type="sentences"
                      />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.hero-banner {
  position: relative;
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface-variant), 0.3) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  min-height: 80vh;
  display: flex;
  align-items: center;
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
  max-width: 500px;
  line-height: 1.6;
}

/* Visual Section */
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

@media (max-width: 960px) {
  .hero-banner {
    min-height: auto;
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
  }
}
</style>
