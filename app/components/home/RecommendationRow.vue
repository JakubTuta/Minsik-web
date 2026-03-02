<script setup lang="ts">
import type { RecommendationCategory } from '~/types/recommendations'

interface Props {
  category: RecommendationCategory
  loading?: boolean
}

const props = defineProps<Props>()

const scrollContainer = ref<HTMLElement | null>(null)

const items = computed(() => {
  if (props.category.item_type === 'author')
    return props.category.author_items ?? []

  return props.category.book_items ?? []
})

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
        :to="`/recommendations/${category.category}`"
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
    <template v-if="loading">
      <div class="carousel-wrapper">
        <div class="carousel-track">
          <v-skeleton-loader
            v-for="n in 5"
            :key="n"
            type="image, article"
            class="skeleton-card flex-shrink-0 overflow-hidden rounded-lg"
          />
        </div>
      </div>
    </template>

    <!-- Carousel -->
    <template v-else>
      <div class="carousel-outer">
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
              <RecommendationAuthorCard
                v-for="author in (category.author_items ?? [])"
                :key="author.author_id"
                :author="author"
              />
            </template>

            <template v-else>
              <RecommendationBookCard
                v-for="book in (category.book_items ?? [])"
                :key="book.book_id"
                :book="book"
              />
            </template>
          </div>
        </div>

        <!-- Right scroll button -->
        <v-btn
          v-show="canScrollRight && items.length > 5"
          icon="mdi-chevron-right"
          size="small"
          variant="elevated"
          class="scroll-btn scroll-btn-right"
          @click="scroll('right')"
        />
      </div>
    </template>
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
}

@media (max-width: 600px) {
  .scroll-btn {
    display: none !important;
  }
}
</style>
