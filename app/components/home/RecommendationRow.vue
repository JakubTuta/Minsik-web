<script setup lang="ts">
import type { RecommendationSection } from '~/types/recommendations'

interface Props {
  category: RecommendationSection
  loading?: boolean
  hideShowMore?: boolean
}

const props = defineProps<Props>()

const scrollContainer = ref<HTMLElement | null>(null)

const itemCount = computed(() => (props.category.item_type === 'author'
  ? (props.category.author_items?.length ?? 0)
  : (props.category.book_items?.length ?? 0)),
)

function scroll(direction: 'left' | 'right') {
  if (!scrollContainer.value)
    return
  const amount = scrollContainer.value.clientWidth
  scrollContainer.value.scrollBy({
    left: direction === 'right'
      ? amount
      : -amount,
    behavior: 'smooth',
  })
}

const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function updateScrollState() {
  if (!scrollContainer.value)
    return
  const el = scrollContainer.value
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', updateScrollState, { passive: true })
  updateScrollState()
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', updateScrollState)
})
</script>

<template>
  <section class="rec-row mb-14">
    <!-- Row header -->
    <div class="d-flex align-center justify-space-between mb-3 px-1">
      <h2 class="text-h5 font-weight-bold">
        {{ category.display_name }}
      </h2>

      <NuxtLink
        v-if="!hideShowMore"
        :to="`/recommendations/${category.key}`"
        class="text-decoration-none"
      >
        <v-btn
          variant="text"
          color="primary"
          size="small"
          append-icon="mdi-chevron-right"
          class="text-none"
        >
          Show more
        </v-btn>
      </NuxtLink>
    </div>

    <!-- Skeleton loading -->
    <div
      v-if="loading"
      class="carousel-wrapper"
    >
      <div class="carousel-track">
        <v-skeleton-loader
          v-for="n in 5"
          :key="n"
          type="image, text, text"
          class="skeleton-card flex-shrink-0 overflow-hidden rounded-lg"
        />
      </div>
    </div>

    <!-- Carousel -->
    <div
      v-else
      class="carousel-outer"
    >
      <!-- Left scroll button -->
      <v-btn
        v-show="canScrollLeft"
        icon="mdi-chevron-left"
        size="small"
        variant="elevated"
        class="scroll-btn scroll-btn-left"
        @click="scroll('left')"
      />

      <!-- Scrollable track -->
      <div
        ref="scrollContainer"
        class="carousel-wrapper"
      >
        <div class="carousel-track">
          <template v-if="category.item_type === 'author'">
            <AuthorPreviewCard
              v-for="(author, index) in (category.author_items ?? [])"
              :key="author.author_id"
              :name="author.name"
              :slug="author.slug"
              :photo-url="author.photo_url"
              :book-count="author.book_count"
              :rating="author.avg_rating"
              :rating-count="author.rating_count"
              :readers="author.readers"
              :eager="index < 2"
            />
          </template>

          <template v-else>
            <BookPreviewCard
              v-for="(book, index) in (category.book_items ?? [])"
              :key="book.book_id"
              :title="book.title"
              :slug="book.slug"
              :cover-url="book.primary_cover_url"
              :author-names="book.author_names"
              :author-slugs="book.author_slugs"
              :rating="book.avg_rating"
              :rating-count="book.rating_count"
              :readers="book.readers"
              :eager="index < 2"
            />
          </template>
        </div>
      </div>

      <!-- Right scroll button -->
      <v-btn
        v-show="canScrollRight && itemCount > 5"
        icon="mdi-chevron-right"
        size="small"
        variant="elevated"
        class="scroll-btn scroll-btn-right"
        @click="scroll('right')"
      />
    </div>
  </section>
</template>

<style scoped>
.carousel-outer {
  position: relative;
}

.carousel-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 4px;
}

.carousel-wrapper::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 20px;
  padding: 4px 2px 4px 2px;
}

.carousel-track > * {
  width: calc((100% - 4 * 20px) / 5);
  min-width: 200px;
  max-width: calc((100% - 4 * 20px) / 5);
  flex-shrink: 0;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.scroll-btn-left {
  left: -16px;
}

.scroll-btn-right {
  right: -16px;
}

.skeleton-card {
  width: calc((100% - 4 * 20px) / 5);
  min-width: 200px;
  height: 360px;
}

@media (max-width: 600px) {
  .scroll-btn {
    display: none !important;
  }
}
</style>
