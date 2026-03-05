<script setup lang="ts">
import gsap from 'gsap'

const iconRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const btnsRef = ref<HTMLElement | null>(null)

onMounted(() => {
  gsap.from([iconRef.value, titleRef.value, subtitleRef.value, btnsRef.value], {
    opacity: 0,
    y: 24,
    duration: 0.55,
    stagger: 0.12,
    ease: 'power2.out',
  })
})
</script>

<template>
  <div class="hero-banner py-16">
    <v-container>
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          md="10"
          lg="8"
          class="text-center"
        >
          <div
            ref="iconRef"
            class="d-inline-block mb-6"
          >
            <v-icon
              icon="mdi-snowflake"
              size="72"
              color="primary"
              class="hero-icon"
            />
          </div>

          <h1
            ref="titleRef"
            class="text-h4 text-sm-h3 text-md-h2 font-weight-bold hero-title mb-4"
          >
            Discover Your Next<br>

            <span class="text-primary">Favorite Book</span>
          </h1>

          <p
            ref="subtitleRef"
            class="text-h6 text-medium-emphasis hero-subtitle mx-auto mb-8"
          >
            Explore curated recommendations, track your reading journey, and connect with a community of passionate readers.
          </p>

          <div
            ref="btnsRef"
            class="d-flex ga-3 flex-wrap justify-center"
          >
            <v-btn
              to="/search"
              color="primary"
              size="large"
              variant="elevated"
              prepend-icon="mdi-magnify"
              class="px-6"
            >
              Search Books
            </v-btn>

            <v-btn
              to="/bookshelf"
              size="large"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-bookshelf"
              class="px-6"
            >
              My Bookshelf
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.hero-banner {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-surface-variant), 0.6) 0%,
    rgba(var(--v-theme-surface), 1) 60%
  );
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.hero-icon {
  filter: drop-shadow(0 0 24px rgba(var(--v-theme-primary), 0.3));
}

.hero-title {
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  max-width: 560px;
  line-height: 1.6;
}
</style>
