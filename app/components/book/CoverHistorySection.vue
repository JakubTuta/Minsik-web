<script setup lang="ts">
import type { CoverHistory } from '~/types/api'

const props = defineProps<{
  covers: CoverHistory[]
}>()

const sortedCovers = computed(() => [...props.covers].sort((a, b) => a.year - b.year))
</script>

<template>
  <div class="cover-history-wrapper">
    <div class="cover-history-scroll">
      <div class="cover-history-track">
        <!-- Timeline connector line -->
        <div class="cover-timeline-line" />

        <div
          v-for="(cover, index) in sortedCovers"
          :key="index"
          class="cover-entry"
        >
          <div class="cover-card-wrap">
            <!-- Current badge on last entry -->
            <div
              v-if="index === sortedCovers.length - 1"
              class="current-badge"
            >
              <v-chip
                color="primary"
                size="x-small"
                density="comfortable"
                label
                class="mb-1"
              >
                Current
              </v-chip>
            </div>

            <v-card
              :elevation="index === sortedCovers.length - 1
                ? 4
                : 1"
              :border="index === sortedCovers.length - 1
                ? 'primary thin'
                : false"
              rounded="lg"
              class="cover-card"
            >
              <v-img
                :src="cover.cover_url"
                lazy-src="/placeholder-book-lazy.jpg"
                :alt="`Cover from ${cover.year}`"
                :aspect-ratio="0.67"
                width="140"
                cover
                class="rounded-t-lg"
              />
            </v-card>

            <!-- Timeline dot -->
            <div class="timeline-dot" />

            <!-- Year and publisher info -->
            <div class="cover-meta mt-2 text-center">
              <div class="text-subtitle-2 font-weight-bold">
                {{ cover.year }}
              </div>

              <div
                v-if="cover.publisher"
                class="text-caption text-medium-emphasis"
                style="max-width: 140px; word-break: break-word;"
              >
                {{ cover.publisher }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cover-history-wrapper {
  width: 100%;
  overflow: hidden;
}

.cover-history-scroll {
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}

.cover-history-track {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 32px;
  padding: 8px 16px 16px;
  position: relative;
  width: max-content;
  min-width: 100%;
}

/* Horizontal timeline connector line */
.cover-timeline-line {
  position: absolute;
  bottom: 52px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  opacity: 0.25;
  pointer-events: none;
  z-index: 0;
}

.cover-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.cover-card-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.current-badge {
  display: flex;
  justify-content: center;
  min-height: 28px;
}

.cover-card {
  width: 140px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  margin-top: 6px;
  flex-shrink: 0;
}

.cover-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
