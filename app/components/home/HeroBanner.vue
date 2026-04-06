<script setup lang="ts">
import gsap from 'gsap'

const themeStore = useThemeStore()

const iconRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const btnsRef = ref<HTMLElement | null>(null)
const visualRef = ref<HTMLElement | null>(null)

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
      scale: 0.9,
      x: 30,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.6')

    // Entrance animation for action cards
    gsap.from('.action-card', {
      opacity: 1,
      x: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.2,
    })
  }
})
</script>

<template>
  <div class="hero-banner overflow-hidden py-16">
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

        <!-- Visual Content -->
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

            <div class="d-flex flex-column ga-4 position-relative z-1 w-100">
              <v-hover v-slot="{isHovering, props}">
                <v-card
                  v-bind="props"
                  to="/open-case"
                  class="action-card bg-surface-variant d-flex align-center transition-swing text-decoration-none rounded-xl px-6 py-4"
                  :elevation="isHovering
                    ? 12
                    : 4"
                  :class="{'on-hover': isHovering}"
                >
                  <v-avatar
                    color="primary"
                    variant="tonal"
                    size="56"
                    class="mr-4"
                  >
                    <v-icon
                      icon="mdi-treasure-chest"
                      size="32"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-h6 font-weight-bold text-high-emphasis">
                      Mystery Cases
                    </div>

                    <div class="text-body-2 text-medium-emphasis">
                      Unlock a single rare book
                    </div>
                  </div>

                  <v-spacer />

                  <v-icon
                    icon="mdi-chevron-right"
                    color="primary"
                    class="transition-swing arrow-icon"
                  />
                </v-card>
              </v-hover>

              <v-hover v-slot="{isHovering, props}">
                <v-card
                  v-bind="props"
                  to="/discover"
                  class="action-card bg-surface-variant d-flex align-center transition-swing text-decoration-none rounded-xl px-6 py-4"
                  :elevation="isHovering
                    ? 12
                    : 4"
                  :class="{'on-hover': isHovering}"
                >
                  <v-avatar
                    color="success"
                    variant="tonal"
                    size="56"
                    class="mr-4"
                  >
                    <v-icon
                      icon="mdi-book-open-page-variant"
                      size="32"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-h6 font-weight-bold text-high-emphasis">
                      Deep Discovery
                    </div>

                    <div class="text-body-2 text-medium-emphasis">
                      Find your next favorite book
                    </div>
                  </div>

                  <v-spacer />

                  <v-icon
                    icon="mdi-chevron-right"
                    color="success"
                    class="transition-swing arrow-icon"
                  />
                </v-card>
              </v-hover>

              <v-hover v-slot="{isHovering, props}">
                <v-card
                  v-bind="props"
                  to="/open-pack"
                  class="action-card bg-surface-variant d-flex align-center transition-swing text-decoration-none rounded-xl px-6 py-4"
                  :elevation="isHovering
                    ? 12
                    : 4"
                  :class="{'on-hover': isHovering}"
                >
                  <v-avatar
                    color="info"
                    variant="tonal"
                    size="56"
                    class="mr-4"
                  >
                    <v-icon
                      icon="mdi-cards-outline"
                      size="32"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-h6 font-weight-bold text-high-emphasis">
                      Book Packs
                    </div>

                    <div class="text-body-2 text-medium-emphasis">
                      Unpack 8 random books
                    </div>
                  </div>

                  <v-spacer />

                  <v-icon
                    icon="mdi-chevron-right"
                    color="info"
                    class="transition-swing arrow-icon"
                  />
                </v-card>
              </v-hover>

              <v-hover v-slot="{isHovering, props}">
                <v-card
                  v-bind="props"
                  to="/play-slots"
                  class="action-card bg-surface-variant d-flex align-center transition-swing text-decoration-none rounded-xl px-6 py-4"
                  :elevation="isHovering
                    ? 12
                    : 4"
                  :class="{'on-hover': isHovering}"
                >
                  <v-avatar
                    color="warning"
                    variant="tonal"
                    size="56"
                    class="mr-4"
                  >
                    <v-icon
                      icon="mdi-slot-machine"
                      size="32"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-h6 font-weight-bold text-high-emphasis">
                      Book Slots
                    </div>

                    <div class="text-body-2 text-medium-emphasis">
                      Spin the reels for books
                    </div>
                  </div>

                  <v-spacer />

                  <v-icon
                    icon="mdi-chevron-right"
                    color="warning"
                    class="transition-swing arrow-icon"
                  />
                </v-card>
              </v-hover>
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

.action-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(10px);
}

.action-card.on-hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateX(-4px);
}

.action-card .arrow-icon {
  opacity: 0.5;
}

.action-card.on-hover .arrow-icon {
  opacity: 1;
  transform: translateX(4px);
}

@media (max-width: 960px) {
  .hero-banner {
    min-height: auto;
    padding-top: 4rem !important;
    padding-bottom: 4rem !important;
  }
}
</style>
