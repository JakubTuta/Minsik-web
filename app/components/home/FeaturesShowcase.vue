<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

const { t } = useI18n()
const containerRef = ref<HTMLElement | null>(null)

useScrollReveal(containerRef, { stagger: 0.15, y: 40 })
</script>

<template>
  <section>
    <div class="mb-10 text-center">
      <h2 class="text-h3 font-weight-bold mb-4">
        {{ t('home.gamifiedDiscovery') }}
      </h2>

      <p
        class="text-h6 text-medium-emphasis mx-auto"
        style="max-width: 600px;"
      >
        {{ t('home.gamifiedDiscoverySubtitle') }}
      </p>
    </div>

    <v-row
      ref="containerRef"
      dense
      justify="center"
    >
      <!-- Slot Machine (Large) -->
      <v-col
        cols="12"
        md="8"
      >
        <NuxtLinkLocale
          to="/play-slots"
          class="text-decoration-none"
        >
          <v-card
            class="bento-card bento-large bg-surface-variant h-100 overflow-hidden"
            elevation="0"
          >
            <div class="bento-bg bg-slots" />

            <v-card-text class="d-flex flex-column position-relative z-1 h-100 pa-8">
              <v-chip
                color="warning"
                variant="flat"
                size="small"
                class="align-self-start font-weight-bold text-uppercase mb-6"
              >
                {{ t('home.tryYourLuck') }}
              </v-chip>

              <div class="d-flex justify-space-between flex-grow-1 align-start">
                <div>
                  <h3 class="text-h4 font-weight-black text-high-emphasis mb-3">
                    {{ t('home.bookSlots') }}
                  </h3>

                  <p class="text-body-1 text-medium-emphasis max-w-sm">
                    {{ t('home.bookSlotsDescription') }}
                  </p>
                </div>

                <v-icon
                  icon="mdi-slot-machine"
                  size="120"
                  color="warning"
                  class="bento-icon slots-icon opacity-80"
                />
              </div>

              <div class="d-flex align-center text-warning font-weight-bold mt-auto pt-6">
                {{ t('home.playNow') }} <v-icon
                  icon="mdi-arrow-right"
                  class="arrow-icon ml-2 transition-transform"
                />
              </div>
            </v-card-text>
          </v-card>
        </NuxtLinkLocale>
      </v-col>

      <!-- Mystery Cases (Medium) -->
      <v-col
        cols="12"
        md="4"
      >
        <NuxtLinkLocale
          to="/open-case"
          class="text-decoration-none"
        >
          <v-card
            class="bento-card bg-surface-variant h-100 overflow-hidden"
            elevation="0"
          >
            <div class="bento-bg bg-cases" />

            <v-card-text class="d-flex flex-column position-relative z-1 h-100 pa-8">
              <v-icon
                icon="mdi-treasure-chest"
                size="80"
                color="primary"
                class="bento-icon chest-icon align-self-end absolute-icon mb-6 opacity-80"
              />

              <div class="mt-auto">
                <v-chip
                  color="primary"
                  variant="flat"
                  size="small"
                  class="font-weight-bold text-uppercase mb-4"
                >
                  {{ t('home.unlock') }}
                </v-chip>

                <h3 class="text-h5 font-weight-black text-high-emphasis mb-2">
                  {{ t('home.mysteryCases') }}
                </h3>

                <p class="text-body-2 text-medium-emphasis mb-6">
                  {{ t('home.mysteryCasesDescription') }}
                </p>

                <div class="d-flex align-center text-primary font-weight-bold">
                  {{ t('home.openCaseCta') }} <v-icon
                    icon="mdi-arrow-right"
                    class="arrow-icon ml-2 transition-transform"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </NuxtLinkLocale>
      </v-col>

      <!-- Book Packs (Medium) -->
      <v-col
        cols="12"
        md="4"
      >
        <NuxtLinkLocale
          to="/open-pack"
          class="text-decoration-none"
        >
          <v-card
            class="bento-card bg-surface-variant h-100 overflow-hidden"
            elevation="0"
          >
            <div class="bento-bg bg-packs" />

            <v-card-text class="d-flex flex-column position-relative z-1 h-100 pa-8">
              <v-icon
                icon="mdi-cards-outline"
                size="80"
                color="info"
                class="bento-icon packs-icon align-self-end absolute-icon mb-6 opacity-80"
              />

              <div class="mt-auto">
                <v-chip
                  color="info"
                  variant="flat"
                  size="small"
                  class="font-weight-bold text-uppercase mb-4"
                >
                  {{ t('home.collection') }}
                </v-chip>

                <h3 class="text-h5 font-weight-black text-high-emphasis mb-2">
                  {{ t('home.bookPacks') }}
                </h3>

                <p class="text-body-2 text-medium-emphasis mb-6">
                  {{ t('home.bookPacksDescription') }}
                </p>

                <div class="d-flex align-center text-info font-weight-bold">
                  {{ t('home.crackAPack') }} <v-icon
                    icon="mdi-arrow-right"
                    class="arrow-icon ml-2 transition-transform"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </NuxtLinkLocale>
      </v-col>

      <!-- Deep Discovery (Large) -->
      <v-col
        cols="12"
        md="8"
      >
        <NuxtLinkLocale
          to="/discover"
          class="text-decoration-none"
        >
          <v-card
            class="bento-card bento-large bg-surface-variant h-100 overflow-hidden"
            elevation="0"
          >
            <div class="bento-bg bg-discover" />

            <v-card-text class="d-flex flex-column position-relative z-1 h-100 pa-8">
              <v-chip
                color="success"
                variant="flat"
                size="small"
                class="align-self-start font-weight-bold text-uppercase mb-6"
              >
                {{ t('home.smartRatingAlgorithm') }}
              </v-chip>

              <div class="d-flex justify-space-between flex-grow-1 align-end">
                <div class="pr-8">
                  <h3 class="text-h4 font-weight-black text-high-emphasis mb-3">
                    {{ t('home.deepDiscovery') }}
                  </h3>

                  <p class="text-body-1 text-medium-emphasis max-w-sm">
                    {{ t('home.deepDiscoveryDescription') }}
                  </p>

                  <div class="d-flex align-center text-success font-weight-bold mt-6">
                    {{ t('home.exploreNow') }} <v-icon
                      icon="mdi-arrow-right"
                      class="arrow-icon ml-2 transition-transform"
                    />
                  </div>
                </div>

                <div class="d-flex ga-4 bento-icon-group">
                  <v-icon
                    icon="mdi-compass-outline"
                    size="64"
                    color="success"
                    class="bento-icon compass-icon opacity-80"
                  />

                  <v-icon
                    icon="mdi-brain"
                    size="64"
                    color="success"
                    class="bento-icon brain-icon opacity-60"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </NuxtLinkLocale>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.max-w-sm {
  max-width: 400px;
}

.bento-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 24px !important;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  transform: translateY(0);
}

.bento-large {
  min-height: 320px;
}

.bento-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  transition: opacity 0.5s ease;
  z-index: 0;
}

.bg-slots {
  background: radial-gradient(circle at top right, rgb(var(--v-theme-warning)) 0%, transparent 60%);
}

.bg-cases {
  background: radial-gradient(circle at top right, rgb(var(--v-theme-primary)) 0%, transparent 70%);
}

.bg-packs {
  background: radial-gradient(circle at top right, rgb(var(--v-theme-info)) 0%, transparent 70%);
}

.bg-discover {
  background: radial-gradient(circle at bottom right, rgb(var(--v-theme-success)) 0%, transparent 60%);
}

.bento-icon {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), filter 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.absolute-icon {
  position: absolute;
  top: 32px;
  right: 32px;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

/* Hover Effects */
.bento-card:hover {
  transform: translateY(-6px);
  border-color: rgba(var(--v-border-color), 0.3);
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.2) !important;
}

.bento-card:hover .bento-bg {
  opacity: 0.15;
}

.bento-card:hover .arrow-icon {
  transform: translateX(6px);
}

.bento-card:hover .slots-icon {
  transform: scale(1.1) rotate(-5deg);
  filter: drop-shadow(0 0 20px rgba(var(--v-theme-warning), 0.4));
}

.bento-card:hover .chest-icon {
  transform: scale(1.1) translateY(-10px);
  filter: drop-shadow(0 0 20px rgba(var(--v-theme-primary), 0.4));
}

.bento-card:hover .packs-icon {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 0 20px rgba(var(--v-theme-info), 0.4));
}

.bento-card:hover .bento-icon-group {
  transform: scale(1.05) translateY(-5px);
}

.bento-card:hover .compass-icon {
  filter: drop-shadow(0 0 20px rgba(var(--v-theme-success), 0.4));
}

.z-1 {
  z-index: 1;
}

@media (max-width: 960px) {
  .bento-icon {
    display: none;
  }
}
</style>
