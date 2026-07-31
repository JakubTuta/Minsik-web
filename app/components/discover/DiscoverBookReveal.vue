<script setup lang="ts">
import type { BookSummary } from '~/types/api'
import gsap from 'gsap'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  book: BookSummary
  matchingCount: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  discoverAnother: []
  backToFilters: []
}>()
const { t, n } = useI18n()
const themeStore = useThemeStore()

const cardInner = ref<HTMLElement | null>(null)
const flipped = ref(false)
let tween: gsap.core.Tween | null = null

const descriptionSnippet = computed(() => {
  const desc = props.book.description
  if (!desc)
    return null

  return desc.length > 220
    ? `${desc.slice(0, 220)}…`
    : desc
})

onMounted(async () => {
  await nextTick()
  if (!cardInner.value)
    return

  tween = gsap.fromTo(
    cardInner.value,
    { rotateY: 0 },
    {
      rotateY: 180,
      duration: 0.8,
      ease: 'power2.inOut',
      delay: 0.3,
      onComplete: () => { flipped.value = true },
    },
  )
})

onUnmounted(() => {
  tween?.kill()
  tween = null
})
</script>

<template>
  <div class="flip-card mx-auto">
    <div
      ref="cardInner"
      class="flip-card-inner"
      :class="{flipped}"
    >
      <!-- Front face (mystery) -->
      <div class="flip-card-front">
        <v-card
          class="d-flex flex-column align-center justify-center pa-8"
          max-width="580"
          style="min-height: 300px;"
        >
          <v-icon
            size="80"
            color="primary"
            class="mystery-icon mb-4"
          >
            mdi-help-circle-outline
          </v-icon>

          <div class="text-h6 text-medium-emphasis">
            {{ t('discover.yourDiscovery') }}
          </div>
        </v-card>
      </div>

      <!-- Back face (book details) -->
      <div class="flip-card-back">
        <v-card
          class="pa-6"
          max-width="580"
        >
          <div class="d-flex flex-column align-center text-center">
            <!-- Book cover -->
            <div class="cover-wrapper mb-4">
              <v-img
                :src="book.primary_cover_url || undefined"
                :alt="book.title"
                width="160"
                height="234"
                cover
                class="rounded"
              >
                <template #placeholder>
                  <HashedFill :color="coverColor(book)" />
                </template>
              </v-img>
            </div>

            <!-- Title -->
            <h2 class="text-h5 font-weight-bold mb-2">
              {{ book.title }}
            </h2>

            <!-- Authors -->
            <div class="mb-3">
              <NuxtLinkLocale
                v-for="author in book.authors"
                :key="author.author_id"
                :to="`/authors/${author.slug}`"
                class="text-body-1 text-primary text-decoration-none font-weight-medium mr-1"
              >
                {{ author.name }}
              </NuxtLinkLocale>
            </div>

            <!-- Stats -->
            <div class="d-flex align-center mb-3 flex-wrap justify-center gap-4">
              <RatingDisplay
                :rating="weightedRating(book.avg_rating, book.rating_count, book.ol_avg_rating, book.ol_rating_count)"
                :rating-count="totalRatingCount(book.rating_count, book.ol_rating_count)"
                size="small"
              />

              <div class="d-flex align-center text-body-2 text-medium-emphasis gap-1">
                <v-icon
                  size="small"
                  icon="mdi-account-multiple"
                />

                <span>{{ t('stats.readersCount', {"count": n(totalReaders(book.app_want_to_read_count, book.app_reading_count, book.app_read_count, book.ol_want_to_read_count, book.ol_currently_reading_count, book.ol_already_read_count))}) }}</span>
              </div>
            </div>

            <!-- Description -->
            <p
              v-if="descriptionSnippet"
              class="text-body-2 text-medium-emphasis mb-4 text-left"
              style="max-width: 480px;"
            >
              {{ descriptionSnippet }}
            </p>

            <!-- Matching count -->
            <v-chip
              v-if="matchingCount !== null && matchingCount > 0"
              :variant="themeStore.isDark
                ? 'tonal'
                : 'text'"
              color="primary"
              size="small"
              prepend-icon="mdi-book-search"
              class="mb-5"
            >
              {{ t('discover.matchingCount', {"count": matchingCount}, matchingCount ?? 0) }}
            </v-chip>

            <!-- Action buttons -->
            <div class="d-flex flex-wrap justify-center gap-3">
              <NuxtLinkLocale
                :to="`/books/${book.slug}`"
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
                prepend-icon="mdi-compass"
                @click="emit('discoverAnother')"
              >
                {{ t('discover.discoverAnother') }}
              </v-btn>

              <v-btn
                variant="text"
                prepend-icon="mdi-filter"
                @click="emit('backToFilters')"
              >
                {{ t('discover.editFilters') }}
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flip-card {
  width: 100%;
  max-width: 580px;
  perspective: 1200px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
}

.flip-card-front,
.flip-card-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-card-front {
  width: 100%;
}

.flip-card-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
  width: 100%;
}

.flip-card-inner.flipped .flip-card-front {
  display: none;
}

.flip-card-inner.flipped .flip-card-back {
  position: relative;
  inset: auto;
}

.cover-wrapper {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

@media (prefers-reduced-motion: no-preference) {
  .mystery-icon {
    animation: mystery-pulse 2s ease-in-out infinite;
  }
}

@keyframes mystery-pulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}
</style>
