<script setup lang="ts">
import type { BookOfTheWeek } from '~/types/recommendations'
import { hashColor } from '~/utils/coverColor'

interface Props {
  book: BookOfTheWeek
}

const props = defineProps<Props>()

const localePath = useLocalePath()

const { t } = useI18n()
const genreLabel = useGenreLabel()
const themeStore = useThemeStore()

const authorNames = computed(() => props.book.authors.map(a => a.name).join(', '),
)

const coverBg = computed(() => hashColor(props.book.title, authorNames.value))
const { optimized } = useOptimizedImage()
</script>

<template>
  <v-card
    class="bow-card bg-surface-variant overflow-hidden"
    :theme="themeStore.currentTheme"
    elevation="4"
  >
    <div class="bow-glow" />

    <v-card-text class="position-relative z-1 pa-6">
      <v-chip
        color="primary"
        variant="tonal"
        size="small"
        class="font-weight-bold text-uppercase letter-spacing-wide mb-4"
        prepend-icon="mdi-star-four-points"
      >
        {{ t('home.bookOfTheWeek') }}
      </v-chip>

      <div class="d-flex ga-5">
        <v-img
          :src="optimized(book.primary_cover_url, 240)"
          :alt="book.title"
          width="120"
          min-width="120"
          height="180"
          cover
          eager
          rounded="lg"
          class="bow-cover elevation-6"
        >
          <template #placeholder>
            <HashedFill :color="coverBg" />
          </template>
        </v-img>

        <div class="d-flex flex-column overflow-hidden">
          <NuxtLinkLocale
            :to="`/books/${book.slug}`"
            class="text-decoration-none"
          >
            <div class="text-h5 font-weight-black text-high-emphasis bow-book-link mb-1 text-truncate">
              {{ book.title }}
            </div>
          </NuxtLinkLocale>

          <div class="d-flex ga-1 mb-3 flex-wrap">
            <NuxtLinkLocale
              v-for="author in book.authors"
              :key="author.author_id"
              :to="`/authors/${author.slug}`"
              class="text-body-2 text-medium-emphasis text-decoration-none bow-author-link"
            >
              {{ author.name }}
            </NuxtLinkLocale>
          </div>

          <RatingDisplay
            :rating="book.weighted_avg_rating"
            :rating-count="book.rating_count"
            size="small"
            class="mb-3"
          />

          <div class="bow-quote text-body-1 text-medium-emphasis mb-3 font-italic">
            "{{ book.first_sentence }}"
          </div>

          <div class="d-flex ga-1 mt-auto flex-wrap">
            <v-chip
              v-for="cat in book.categories.slice(0, 3)"
              :key="cat.genre_id"
              size="x-small"
              variant="flat"
              color="secondary"
              :to="localePath(`/search?q=${encodeURIComponent(cat.slug)}&type=categories`)"
            >
              {{ genreLabel(cat.slug) }}
            </v-chip>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.bow-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 20px !important;
  position: relative;
}

.bow-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.08) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.bow-cover {
  border-radius: 8px;
  flex-shrink: 0;
}

.bow-quote {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  border-left: 3px solid rgba(var(--v-theme-primary), 0.5);
  padding-left: 10px;
  line-height: 1.5;
}

.bow-author-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

.bow-book-link:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

.letter-spacing-wide {
  letter-spacing: 0.05em;
}

.z-1 {
  z-index: 1;
}
</style>
