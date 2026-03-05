<script setup lang="ts">
import type { Book } from '~/types/api'
import gsap from 'gsap'

interface Props {
  book: Book
  matchingCount: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'discover-another': []
  'back-to-filters': []
}>()

const cardInner = ref<HTMLElement | null>(null)

const descriptionSnippet = computed(() => {
  const desc = props.book.description
  if (!desc)
    return null

  return desc.length > 220
    ? `${desc.slice(0, 220)}…`
    : desc
})

const genreNames = computed(() => props.book.genres?.map(g => g.name) ?? [])

onMounted(async () => {
  await nextTick()
  if (!cardInner.value)
    return

  gsap.fromTo(
    cardInner.value,
    { rotateY: 0 },
    {
      rotateY: 180,
      duration: 0.8,
      ease: 'power2.inOut',
      delay: 0.3,
    },
  )
})
</script>

<template>
  <div class="flip-card mx-auto">
    <div
      ref="cardInner"
      class="flip-card-inner"
    >
      <!-- Front face (mystery) -->
      <div class="flip-card-front">
        <v-card
          class="d-flex flex-column align-center justify-center pa-8"
          height="500"
          max-width="580"
        >
          <v-icon
            size="80"
            color="primary"
            class="mystery-icon mb-4"
          >
            mdi-help-circle-outline
          </v-icon>

          <div class="text-h6 text-medium-emphasis">
            Your Discovery
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
                :src="book.primary_cover_url || '/placeholder-book.jpg'"
                :alt="book.title"
                width="160"
                height="234"
                cover
                class="rounded"
              />
            </div>

            <!-- Title -->
            <h2 class="text-h5 font-weight-bold mb-2">
              {{ book.title }}
            </h2>

            <!-- Authors -->
            <div class="mb-3">
              <NuxtLink
                v-for="author in book.authors"
                :key="author.author_id"
                :to="`/authors/${author.slug}`"
                class="text-body-1 text-primary text-decoration-none font-weight-medium mr-1"
              >
                {{ author.name }}
              </NuxtLink>
            </div>

            <!-- Stats -->
            <div class="d-flex align-center mb-3 flex-wrap justify-center gap-4">
              <RatingDisplay
                :rating="book.avg_rating"
                :rating-count="book.rating_count"
                size="small"
              />

              <div class="d-flex align-center text-body-2 text-medium-emphasis gap-1">
                <v-icon
                  size="small"
                  icon="mdi-eye"
                />

                <span>{{ book.view_count.toLocaleString() }} views</span>
              </div>
            </div>

            <!-- Genres -->
            <!--
              <div
              v-if="genreNames.length"
              class="mb-4"
              >
              <CategoriesChips
              :categories="genreNames"
              :max-visible="4"
              />
              </div>
            -->

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
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-book-search"
              class="mb-5"
            >
              {{ matchingCount }} books match your filters
            </v-chip>

            <!-- Action buttons -->
            <div class="d-flex flex-wrap justify-center gap-3">
              <NuxtLink
                :to="`/books/${book.slug}`"
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
                prepend-icon="mdi-compass"
                @click="emit('discover-another')"
              >
                Discover Another
              </v-btn>

              <v-btn
                variant="text"
                prepend-icon="mdi-filter"
                @click="emit('back-to-filters')"
              >
                Edit Filters
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

.cover-wrapper {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.mystery-icon {
  animation: mystery-pulse 2s ease-in-out infinite;
}

@keyframes mystery-pulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}
</style>
