<script setup lang="ts">
import { RARITY_COLORS, RARITY_LABELS } from '~/types/case'
import type { CaseBookItem } from '~/types/case'

interface Props {
  winner: CaseBookItem
  winnerDetail: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'play-again': [] }>()

const rarityColor = computed(() => RARITY_COLORS[props.winner.rarity] ?? '#95A5A6')
const rarityLabel = computed(() => RARITY_LABELS[props.winner.rarity] ?? props.winner.rarity)

const descriptionSnippet = computed(() => {
  const desc = props.winnerDetail?.description
  if (!desc)
    return null
  return desc.length > 220 ? `${desc.slice(0, 220)}…` : desc
})

const authorsList = computed(() => props.winner.authors)
</script>

<template>
  <div class="reveal-outer">
    <!-- Background glow -->
    <div
      class="reveal-bg-glow"
      :style="{ background: `radial-gradient(ellipse at center, ${rarityColor}22 0%, transparent 70%)` }"
    />

    <v-card class="reveal-card mx-auto">
      <!-- Rarity top border -->
      <div
        class="reveal-top-border"
        :style="{ background: `linear-gradient(to right, transparent, ${rarityColor}, transparent)` }"
      />

      <v-card-text class="pa-6">
        <div class="d-flex flex-column align-center text-center">
          <!-- Rarity badge -->
          <v-chip
            :style="{ backgroundColor: rarityColor, color: '#fff', fontWeight: 700 }"
            size="small"
            class="mb-4 text-uppercase letter-spacing-wide"
          >
            {{ rarityLabel }}
          </v-chip>

          <!-- Book cover with glow -->
          <div
            class="cover-wrapper mb-4"
            :style="{ boxShadow: `0 8px 40px ${rarityColor}55` }"
          >
            <v-img
              :src="winner.primary_cover_url || '/placeholder-book.jpg'"
              :alt="winner.title"
              width="160"
              height="234"
              cover
              class="rounded"
            />
          </div>

          <!-- Title -->
          <h2 class="text-h5 font-weight-bold mb-2">
            {{ winner.title }}
          </h2>

          <!-- Authors -->
          <div class="mb-4">
            <NuxtLink
              v-for="author in authorsList"
              :key="author.author_id"
              :to="`/authors/${author.slug}`"
              class="text-body-1 text-primary text-decoration-none font-weight-medium mr-1"
            >
              {{ author.name }}
            </NuxtLink>
          </div>

          <!-- Stats row -->
          <div class="d-flex align-center gap-6 mb-4 flex-wrap justify-center">
            <div class="d-flex align-center gap-1">
              <RatingDisplay
                :rating="Number(winner.avg_rating)"
                :rating-count="winner.rating_count"
                size="small"
              />
            </div>

            <div class="d-flex align-center gap-1 text-body-2 text-medium-emphasis">
              <v-icon
                icon="mdi-account-multiple"
                size="small"
              />
              <span>{{ winner.readers.toLocaleString() }} readers</span>
            </div>
          </div>

          <!-- Description snippet -->
          <p
            v-if="descriptionSnippet"
            class="text-body-2 text-medium-emphasis text-left mb-5"
            style="max-width: 480px;"
          >
            {{ descriptionSnippet }}
          </p>

          <!-- Action buttons -->
          <div class="d-flex gap-3 flex-wrap justify-center">
            <NuxtLink
              :to="`/books/${winner.slug}`"
              class="text-decoration-none"
            >
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-book-open"
              >
                View Book
              </v-btn>
            </NuxtLink>

            <v-btn
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="emit('play-again')"
            >
              Open Another
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.reveal-outer {
  position: relative;
  width: 100%;
  animation: reveal-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.reveal-bg-glow {
  position: absolute;
  inset: -100px;
  pointer-events: none;
  z-index: 0;
}

.reveal-card {
  position: relative;
  z-index: 1;
  max-width: 580px;
  overflow: visible;
}

.reveal-top-border {
  height: 3px;
  width: 100%;
}

.cover-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.letter-spacing-wide {
  letter-spacing: 0.08em;
}

@keyframes reveal-entrance {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
