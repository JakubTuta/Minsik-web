<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

const localePath = useLocalePath()

const { t } = useI18n()
const ctaRef = ref<HTMLElement | null>(null)
useScrollReveal(ctaRef, { stagger: 0.1, y: 40 })
</script>

<template>
  <div class="landing-cta position-relative mt-16 overflow-hidden py-16">
    <div class="cta-bg-glow" />

    <v-container>
      <v-row justify="center">
        <v-col
          ref="ctaRef"
          cols="12"
          md="10"
          lg="8"
          class="position-relative z-1 text-center"
        >
          <v-icon
            icon="mdi-rocket-launch"
            size="64"
            color="primary"
            class="cta-icon mb-6"
          />

          <h2 class="text-h3 font-weight-black mb-6">
            {{ t('home.ctaTitle') }}
          </h2>

          <p
            class="text-h6 text-medium-emphasis mx-auto mb-10"
            style="max-width: 600px;"
          >
            {{ t('home.ctaSubtitle') }}
          </p>

          <div class="d-flex ga-4 flex-wrap justify-center">
            <v-btn
              :to="localePath('/dashboard')"
              color="primary"
              size="x-large"
              variant="elevated"
              class="font-weight-bold px-10"
              elevation="8"
            >
              {{ t('home.signUpFree') }}
            </v-btn>

            <v-btn
              :to="localePath('/discover')"
              size="x-large"
              variant="tonal"
              class="font-weight-bold px-8"
            >
              {{ t('home.exploreFirst') }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.landing-cta {
  background: linear-gradient(
    0deg,
    rgba(var(--v-theme-surface-variant), 0.5) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cta-bg-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.1) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.cta-icon {
  filter: drop-shadow(0 0 20px rgba(var(--v-theme-primary), 0.4));
}

@media (prefers-reduced-motion: no-preference) {
  .cta-icon {
    animation: float 3s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.z-1 {
  z-index: 1;
}
</style>
