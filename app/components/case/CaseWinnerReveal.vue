<script setup lang="ts">
import type { Book, BookSummary } from '~/types/api'
import type { Rarity } from '~/types/case'
import { RARITY_COLORS } from '~/types/case'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  winner: BookSummary
  winnerDetail?: Book | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'play-again': [] }>()

const { t, n } = useI18n()
const { rarityLabels } = useRarityLabels()

const rarityColor = computed(() => RARITY_COLORS[props.winner.rarity as Rarity] ?? '#95A5A6')
const rarityLabel = computed(() => rarityLabels.value[props.winner.rarity as Rarity] ?? props.winner.rarity)

const descriptionSnippet = computed(() => {
  const desc = props.winner.description
  if (!desc)
    return null

  return desc.length > 220
    ? `${desc.slice(0, 220)}…`
    : desc
})

const authorsList = computed(() => props.winner.authors)
</script>

<template>
  <div class="reveal-outer">
    <!-- Background glow -->
    <div
      class="reveal-bg-glow"
      :style="{'background': `radial-gradient(ellipse at center, ${rarityColor}22 0%, transparent 70%)`}"
    />

    <v-card class="reveal-card mx-auto">
      <!-- Rarity top border -->
      <div
        class="reveal-top-border"
        :style="{'background': `linear-gradient(to right, transparent, ${rarityColor}, transparent)`}"
      />

      <v-card-text class="pa-6">
        <div class="d-flex flex-column align-center text-center">
          <!-- Rarity badge -->
          <v-chip
            :style="{'backgroundColor': rarityColor,
                     'color': '#fff',
                     'fontWeight': 700}"
            size="small"
            class="text-uppercase letter-spacing-wide mb-4"
          >
            {{ rarityLabel }}
          </v-chip>

          <!-- Book cover with glow -->
          <div
            class="cover-wrapper mb-4"
            :style="{'boxShadow': `0 8px 40px ${rarityColor}55`}"
          >
            <BookCover
              :title="winner.title"
              :src="winner.primary_cover_url"
              :width="160"
              :height="234"
              fit="cover"
              :fallback-color="coverColor(winner)"
              priority
              rounded
            />
          </div>

          <h2 class="text-h5 font-weight-bold mb-2">
            {{ winner.title }}
          </h2>

          <div class="mb-4">
            <NuxtLinkLocale
              v-for="author in authorsList"
              :key="author.author_id"
              :to="`/authors/${author.slug}`"
              class="text-body-1 text-primary text-decoration-none font-weight-medium mr-1"
            >
              {{ author.name }}
            </NuxtLinkLocale>
          </div>

          <!-- Stats row -->
          <div class="d-flex align-center mb-4 flex-wrap justify-center gap-6">
            <div class="d-flex align-center gap-1">
              <RatingDisplay
                :rating="weightedRating(winner.avg_rating, winner.rating_count, winner.ol_avg_rating, winner.ol_rating_count)"
                :rating-count="totalRatingCount(winner.rating_count, winner.ol_rating_count)"
                size="small"
              />
            </div>

            <div class="d-flex align-center text-body-2 text-medium-emphasis gap-1">
              <v-icon
                icon="mdi-account-multiple"
                size="small"
              />

              <span>{{ t('stats.readersCount', {"count": n(totalReaders(winner.app_want_to_read_count, winner.app_reading_count, winner.app_read_count, winner.ol_want_to_read_count, winner.ol_currently_reading_count, winner.ol_already_read_count))}) }}</span>
            </div>
          </div>

          <p
            v-if="descriptionSnippet"
            class="text-body-2 text-medium-emphasis mb-5 text-left"
            style="max-width: 480px;"
          >
            {{ descriptionSnippet }}
          </p>

          <div class="d-flex flex-wrap justify-center gap-3">
            <NuxtLinkLocale
              :to="`/books/${winner.slug}`"
              class="text-decoration-none"
            >
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-book-open"
              >
                {{ t('caseGame.viewBook') }}
              </v-btn>
            </NuxtLinkLocale>

            <v-btn
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="emit('play-again')"
            >
              {{ t('caseGame.openAnother') }}
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
  overflow: hidden;
  animation: reveal-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.reveal-bg-glow {
  position: absolute;
  inset: 0;
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
  position: relative;
  width: 160px;
  height: 234px;
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
