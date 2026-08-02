<script setup lang="ts">
import type { BookOfTheWeek } from '~/types/recommendations'

const localePath = useLocalePath()

const { t } = useI18n()
const themeStore = useThemeStore()
const recommendationsStore = useRecommendationsStore()
const { language } = useUserLanguage()

// `server: false` keeps book-of-the-week off the SSR critical path — `lazy` alone does not, it only
// stops the fetch blocking client-side navigation, while SSR still waits for every async data call.
// The card is decoration, not indexable content, so the hero (LCP) is worth more than having it in
// the server HTML.
// `watch: [language]` re-runs the fetch on locale switch — without it the static key means the UI
// locale switches instantly but the card keeps showing whichever language it first loaded in.
const { data: botw, status } = useCachedAsyncData<BookOfTheWeek | null>(
  'hero-book-of-the-week',
  () => recommendationsStore.fetchBookOfTheWeek(),
  { lazy: true, default: () => null, server: false, watch: [language] },
)

// The store answers null when the API has no book to give. Without this the skeleton below would
// stand in for a card that is never coming and the hero would look permanently stuck loading.
const hasNoBook = computed(() => status.value === 'error' || (status.value === 'success' && !botw.value))
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
          <div class="d-inline-block hero-anim-icon mb-6">
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
              {{ t('home.welcomeToMinsik') }}
            </v-chip>
          </div>

          <h1 class="text-h3 text-md-h2 font-weight-black hero-title hero-anim-title mb-6">
            {{ t('home.heroLine1') }}<br>

            {{ t('home.heroLine2') }}<br>

            <span class="text-primary glow-text">{{ t('home.heroLine3') }}</span>
          </h1>

          <p class="text-h6 text-medium-emphasis hero-subtitle hero-anim-subtitle mx-md-0 mx-auto mb-8">
            {{ t('home.heroSubtitle') }}
          </p>

          <div class="d-flex ga-4 justify-md-start hero-anim-btns flex-wrap justify-center">
            <v-btn
              :to="localePath('/search')"
              color="primary"
              size="x-large"
              variant="elevated"
              prepend-icon="mdi-magnify"
              class="font-weight-bold px-8"
              elevation="8"
            >
              {{ t('home.startExploring') }}
            </v-btn>

            <v-btn
              :to="localePath('/play-slots')"
              size="x-large"
              variant="tonal"
              color="warning"
              prepend-icon="mdi-slot-machine"
              class="font-weight-bold px-8"
            >
              {{ t('home.testYourLuck') }}
            </v-btn>
          </div>
        </v-col>

        <!-- Book of the Week -->
        <v-col
          v-if="!hasNoBook"
          cols="12"
          md="6"
          offset-md="1"
          class="position-relative"
        >
          <div class="hero-visual-container hero-anim-visual">
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
  min-height: 100vh;
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

/* Entrance animation — CSS keyframes instead of a JS timeline so the hero
   (the LCP element) is never hidden waiting for gsap to parse and run at
   hydration; it starts animating on first paint instead. */
@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
}

@keyframes hero-fade-scale {
  from {
    opacity: 0;
    transform: scale(0.95) translateX(30px);
  }
}

.hero-anim-icon,
.hero-anim-title,
.hero-anim-subtitle,
.hero-anim-btns {
  animation: hero-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-anim-icon {
  animation-delay: 0s;
}

.hero-anim-title {
  animation-delay: 0.15s;
}

.hero-anim-subtitle {
  animation-delay: 0.3s;
}

.hero-anim-btns {
  animation-delay: 0.45s;
}

.hero-anim-visual {
  animation: hero-fade-scale 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.45s;
}

@media (prefers-reduced-motion: reduce) {
  .hero-anim-icon,
  .hero-anim-title,
  .hero-anim-subtitle,
  .hero-anim-btns,
  .hero-anim-visual {
    animation: none;
  }
}
</style>
