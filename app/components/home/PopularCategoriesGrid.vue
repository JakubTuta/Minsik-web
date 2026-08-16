<script setup lang="ts">
import type { PopularCategory } from '~/types/categories'
import { useScrollReveal } from '~/composables/useScrollReveal'

interface Props {
  categories: PopularCategory[] | null
}

defineProps<Props>()

const { t, n } = useI18n()
const genreLabel = useGenreLabel()

const containerRef = ref<HTMLElement | null>(null)
useScrollReveal(containerRef, { stagger: 0.06, y: 20 })

const CATEGORY_VISUALS: Record<string, { icon: string, color: string }> = {
  'fantasy': { icon: 'mdi-auto-fix', color: 'purple' },
  'science-fiction': { icon: 'mdi-rocket-launch', color: 'cyan' },
  'romance': { icon: 'mdi-heart', color: 'pink' },
  'mystery-thriller': { icon: 'mdi-magnify-scan', color: 'indigo' },
  'horror': { icon: 'mdi-ghost', color: 'deep-purple' },
  'historical-fiction': { icon: 'mdi-bank', color: 'amber' },
  'young-adult': { icon: 'mdi-school-outline', color: 'light-blue' },
  'classics': { icon: 'mdi-feather', color: 'deep-orange' },
  'adventure': { icon: 'mdi-compass-outline', color: 'teal' },
  'biography': { icon: 'mdi-account-circle', color: 'blue-grey' },
  'self-help': { icon: 'mdi-brain', color: 'success' },
  'business': { icon: 'mdi-briefcase', color: 'warning' },
  'science-nature': { icon: 'mdi-leaf', color: 'green' },
  'graphic-novels': { icon: 'mdi-image-frame', color: 'red' },
}

const DEFAULT_VISUAL = { icon: 'mdi-bookshelf', color: 'grey' }

function getVisual(slug: string) {
  return CATEGORY_VISUALS[slug] ?? DEFAULT_VISUAL
}
</script>

<template>
  <section v-if="categories && categories.length > 0">
    <div class="mb-10 text-center">
      <h2 class="text-h3 font-weight-bold mb-4">
        {{ t('home.browseByGenre') }}
      </h2>

      <p
        class="text-h6 text-medium-emphasis mx-auto"
        style="max-width: 600px;"
      >
        {{ t('home.browseByGenreSubtitle') }}
      </p>
    </div>

    <v-row
      ref="containerRef"
      dense
    >
      <v-col
        v-for="cat in categories"
        :key="cat.slug"
        cols="6"
        sm="4"
        md="3"
        lg="2"
      >
        <NuxtLinkLocale
          :to="`/categories?category=${cat.slug}`"
          class="text-decoration-none"
        >
          <v-card
            class="category-tile bg-surface-variant h-100 text-center"
            elevation="0"
          >
            <div
              class="category-tile-bg"
              :style="`background: radial-gradient(circle at top right, rgba(var(--v-theme-${getVisual(cat.slug).color}), 0.12) 0%, transparent 70%)`"
            />

            <v-card-text class="d-flex flex-column align-center position-relative z-1 h-100 justify-center pa-5">
              <v-avatar
                :color="getVisual(cat.slug).color"
                variant="tonal"
                size="52"
                class="mb-3"
              >
                <v-icon
                  :icon="getVisual(cat.slug).icon"
                  size="28"
                />
              </v-avatar>

              <div class="text-body-1 font-weight-bold text-high-emphasis mb-1">
                {{ genreLabel(cat.slug) }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ t('common.bookCount', {'count': n(cat.book_count)}, cat.book_count) }}
              </div>
            </v-card-text>
          </v-card>
        </NuxtLinkLocale>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.category-tile {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 16px !important;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-height: 140px;
  cursor: pointer;
}

.category-tile:hover {
  transform: translateY(-5px);
  border-color: rgba(var(--v-border-color), 0.3);
  box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.18) !important;
}

.category-tile-bg {
  position: absolute;
  inset: 0;
  opacity: 1;
  z-index: 0;
}

.z-1 {
  z-index: 1;
}
</style>
