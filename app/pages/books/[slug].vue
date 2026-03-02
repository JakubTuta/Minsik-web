<script setup lang="ts">
import type { Book } from '~/types/api'
import type { RecommendationSection } from '~/types/recommendations'

const route = useRoute()
const booksStore = useBooksStore()
const authorsStore = useAuthorsStore()
const seriesStore = useSeriesStore()
const bookPageStore = useBookPageStore()
const authStore = useAuthStore()
const recommendationsStore = useRecommendationsStore()

const slug = route.params.slug as string

// Fetch book data
const { data: book, error } = await useAsyncData(
  `book-${slug}`,
  () => booksStore.fetchBook(slug),
)

// Handle 404
if (error.value || !book.value) {
  throw createError({
    statusCode: 404,
    message: 'Book not found',
  })
}

// SEO
const config = useRuntimeConfig()
const canonicalUrl = `${config.public.siteUrl}/books/${slug}`

useSeo({
  title: book.value.title,
  description: book.value.description || `${book.value.title} by ${book.value.authors.map(a => a.name).join(', ')}`,
  image: book.value.primary_cover_url || undefined,
  type: 'book',
  url: canonicalUrl,
  author: book.value.authors[0]?.name,
})

// Structured data
useBookStructuredData({
  name: book.value.title,
  author: book.value.authors.map(a => a.name),
  isbn: undefined,
  description: book.value.description || undefined,
  image: book.value.primary_cover_url || undefined,
  url: canonicalUrl,
  datePublished: book.value.original_publication_year?.toString(),
  inLanguage: book.value.language,
})

const coverUrl = computed(() => book.value?.primary_cover_url || '/placeholder-book.jpg')

// Non-blocking data fetches
const primaryAuthor = ref<any>(null)
const seriesBooks = ref<Book[]>([])
const bookRecommendations = ref<RecommendationSection[]>([])
const detailsExpanded = ref(false)
const descriptionExpanded = ref(false)
const descriptionRef = ref<HTMLElement>()
const expandedHeight = ref(0)

// Description truncation
const DESCRIPTION_MAX_LENGTH = 500
const TRUNCATION_WINDOW = 20

const truncatedDescription = computed(() => {
  const desc = book.value?.description
  if (!desc || desc.length <= DESCRIPTION_MAX_LENGTH + TRUNCATION_WINDOW)
    return null

  const windowStart = DESCRIPTION_MAX_LENGTH - TRUNCATION_WINDOW
  const windowEnd = DESCRIPTION_MAX_LENGTH + TRUNCATION_WINDOW
  const window = desc.slice(windowStart, windowEnd)

  // Try to cut at paragraph boundary within window
  const paragraphIdx = window.indexOf('\n\n')
  if (paragraphIdx >= 0)
    return desc.slice(0, windowStart + paragraphIdx).trim()

  // Try to cut at sentence boundary within window
  const sentenceMatch = window.match(/[.!?](?:\s|$)/)
  if (sentenceMatch?.index != null)
    return desc.slice(0, windowStart + sentenceMatch.index + 1).trim()

  // Try to cut at word boundary within window
  const wordIdx = window.indexOf(' ')
  if (wordIdx >= 0)
    return `${desc.slice(0, windowStart + wordIdx).trim()}...`

  return `${desc.slice(0, DESCRIPTION_MAX_LENGTH).trim()}...`
})

const descriptionNeedsTruncation = computed(() => !!truncatedDescription.value)

function toggleDescription() {
  if (descriptionRef.value)
    expandedHeight.value = descriptionRef.value.scrollHeight
  descriptionExpanded.value = !descriptionExpanded.value
}

onMounted(async () => {
  if (book.value?.authors[0]?.slug) {
    try {
      primaryAuthor.value = await authorsStore.fetchAuthor(book.value.authors[0].slug)
    }
    catch { /* Silently fail */ }
  }

  if (book.value?.series?.slug) {
    try {
      seriesBooks.value = await seriesStore.fetchSeriesBooks(book.value.series.slug)
    }
    catch { /* Silently fail */ }
  }

  if (book.value?.book_id) {
    try {
      bookRecommendations.value = await recommendationsStore.fetchBookRecommendations(book.value.book_id) ?? []
    }
    catch { /* Silently fail */ }
  }
})

// Fetch user data client-side only — refetches on login/logout
if (import.meta.client) {
  watch(() => authStore.isAuthenticated, (isAuth) => {
    bookPageStore.resetState()
    bookPageStore.currentSlug = slug
    if (isAuth) {
      bookPageStore.fetchBookUserData(slug)
    }
  }, { immediate: true })
}

onUnmounted(() => {
  bookPageStore.resetState()
})
</script>

<template>
  <v-container v-if="book">
    <v-row>
      <v-col cols="12">
        <!-- Book Header -->
        <v-card>
          <v-row no-gutters>
            <!-- Book Cover -->
            <v-col
              cols="12"
              md="4"
              lg="3"
              class="pa-6"
              align-self="start"
            >
              <v-img
                :src="coverUrl"
                :alt="book.title"
                lazy-src="/placeholder-book-lazy.jpg"
                aspect-ratio="0.67"
                cover
                class="book-cover-shadow rounded"
              />
            </v-col>

            <!-- Book Info -->
            <v-col
              cols="12"
              md="5"
              lg="6"
            >
              <v-card-text class="d-flex flex-column h-100">
                <div>
                  <h1 class="text-h4 font-weight-bold mb-3">
                    {{ book.title }}
                  </h1>

                  <!-- Series -->
                  <div
                    v-if="book.series"
                    class="mb-4"
                  >
                    <div class="mb-2">
                      <span class="text-body-1">More from </span>

                      <NuxtLink
                        class="font-weight-bold text-body-1 text-primary text-decoration-none"
                        :to="`/series/${book.series.slug}`"
                      >
                        {{ book.series.name }}
                      </NuxtLink>
                    </div>

                    <!-- Series Books Horizontal Scroll -->
                    <div
                      v-if="seriesBooks.length > 0"
                      class="d-flex gap-3"
                      style="overflow-x: auto; overflow-y: hidden; padding-bottom: 4px;"
                    >
                      <NuxtLink
                        v-for="seriesBook in seriesBooks"
                        :key="seriesBook.book_id"
                        :to="`/books/${seriesBook.slug}`"
                        class="text-decoration-none flex-shrink-0"
                        style="width: 80px;"
                      >
                        <div class="position-relative">
                          <v-img
                            :src="seriesBook.primary_cover_url || '/placeholder-book.jpg'"
                            :alt="seriesBook.title"
                            lazy-src="/placeholder-book-lazy.jpg"
                            aspect-ratio="0.67"
                            width="80"
                            cover
                            class="rounded"
                            :class="{'opacity-50': seriesBook.book_id === book.book_id}"
                          />

                          <!-- Series Position Badge -->
                          <v-badge
                            v-if="seriesBook.series_position"
                            :content="`#${seriesBook.series_position}`"
                            color="primary"
                            class="position-absolute"
                            style="top: 4px; left: 4px;"
                          />

                          <!-- Current Book Indicator -->
                          <div
                            v-if="seriesBook.book_id === book.book_id"
                            class="d-flex align-center position-absolute h-100 w-100 justify-center"
                            style="top: 0; left: 0; background-color: rgba(0, 0, 0, 0.3);"
                          >
                            <v-icon
                              icon="mdi-eye"
                              color="white"
                              size="large"
                            />
                          </div>
                        </div>

                        <div class="text-caption mt-1 text-truncate">
                          {{ seriesBook.title }}
                        </div>
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Rating -->
                  <div class="text-caption text-secondary mb-1">
                    Minsik users reviews
                  </div>

                  <RatingDisplay
                    :rating="bookPageStore.liveAvgRating ?? book.avg_rating ?? 0"
                    :rating-count="bookPageStore.liveRatingCount ?? book.rating_count ?? 0"
                  />

                  <!-- Other Platform Ratings -->
                  <div class="mt-3">
                    <div class="text-caption text-secondary mb-1">
                      Other platforms reviews
                    </div>

                    <RatingDisplay
                      :rating="Number(book.ol_avg_rating) / 2"
                      :rating-count="book.ol_rating_count"
                      size="small"
                    />
                  </div>

                  <!-- Categories -->
                  <div
                    v-if="book.genres && book.genres.length > 0"
                    class="d-flex mt-3 flex-wrap gap-1"
                  >
                    <v-chip
                      v-for="genre in book.genres"
                      :key="genre.genre_id"
                      size="small"
                    >
                      {{ toTitleCase(genre.name) }}
                    </v-chip>
                  </div>

                  <!-- Actions -->
                  <ClientOnly>
                    <BookActions
                      :slug="slug"
                      class="mt-4"
                    />
                  </ClientOnly>
                </div>

                <!-- Details Toggle -->
                <div class="mt-auto pt-3">
                  <v-btn
                    variant="text"
                    color="secondary"
                    size="small"
                    @click="detailsExpanded = !detailsExpanded"
                  >
                    Details
                    <v-icon
                      :icon="detailsExpanded
                        ? 'mdi-chevron-up'
                        : 'mdi-chevron-down'"
                    />
                  </v-btn>

                  <!-- Expandable Details Section -->
                  <v-expand-transition>
                    <div v-show="detailsExpanded">
                      <div class="d-flex text-body-2 mt-2 flex-wrap gap-x-6 gap-y-1">
                        <span v-if="book.original_publication_year">
                          <v-icon
                            icon="mdi-calendar"
                            size="small"
                            class="mr-1"
                          />
                          Published {{ book.original_publication_year }}
                        </span>

                        <span v-if="book.publisher">
                          <v-icon
                            icon="mdi-domain"
                            size="small"
                            class="mr-1"
                          />
                          {{ book.publisher }}
                        </span>

                        <span v-if="book.number_of_pages > 0">
                          <v-icon
                            icon="mdi-book-open-page-variant"
                            size="small"
                            class="mr-1"
                          />
                          {{ book.number_of_pages }} pages
                        </span>

                        <span v-if="book.view_count">
                          <v-icon
                            icon="mdi-eye"
                            size="small"
                            class="mr-1"
                          />
                          {{ book.view_count.toLocaleString() }} views
                        </span>
                      </div>

                      <!-- ISBN -->
                      <div
                        v-if="book.isbn && book.isbn.length > 0"
                        class="mt-3"
                      >
                        <div class="text-caption text-secondary font-weight-bold mb-1">
                          ISBN
                        </div>

                        <div class="text-body-2">
                          {{ book.isbn.join(', ') }}
                        </div>
                      </div>

                      <!-- Editions -->
                      <div
                        v-if="book.formats && book.formats.length > 0"
                        class="mt-3"
                      >
                        <div class="text-caption text-secondary font-weight-bold mb-1">
                          Editions
                        </div>

                        <v-chip
                          v-for="format in book.formats"
                          :key="format"
                          size="small"
                          variant="outlined"
                          class="mb-1 mr-1"
                        >
                          {{ toTitleCase(format) }}
                        </v-chip>
                      </div>
                    </div>
                  </v-expand-transition>
                </div>
              </v-card-text>
            </v-col>

            <!-- About Author -->
            <v-col
              v-if="book.authors.length > 0 && primaryAuthor"
              cols="12"
              md="3"
              lg="3"
              align-self="start"
            >
              <AuthorShortCard :author="primaryAuthor" />
            </v-col>
          </v-row>
        </v-card>

        <!-- Description -->
        <v-card
          v-if="book.description"
          class="mt-4"
        >
          <v-card-text>
            <h2 class="text-h6 font-weight-bold mb-3">
              Description
            </h2>

            <div
              ref="descriptionRef"
              class="description-content"
              :class="{'description-collapsed': descriptionNeedsTruncation && !descriptionExpanded}"
              :style="descriptionNeedsTruncation && descriptionExpanded && expandedHeight
                ? {'maxHeight': `${expandedHeight}px`}
                : undefined"
            >
              <p
                class="text-body-1 mb-0"
                style="white-space: pre-line;"
              >
                {{ book.description }}
              </p>
            </div>

            <v-btn
              v-if="descriptionNeedsTruncation"
              variant="text"
              color="secondary"
              size="small"
              class="mt-2"
              @click="toggleDescription"
            >
              {{ descriptionExpanded
                ? 'Read less'
                : 'Read more' }}
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Cover History -->
        <v-card
          v-if="false && book.cover_history && book.cover_history.length > 1"
          class="mt-4"
        >
          <v-card-text>
            <h2 class="text-h6 font-weight-bold text-primary mb-4">
              Book Cover History
            </h2>

            <div class="cover-timeline">
              <div
                v-for="(cover, index) in book.cover_history"
                :key="index"
                class="cover-timeline-item"
              >
                <!-- Timeline Marker -->
                <div class="cover-timeline-marker">
                  <div class="cover-timeline-dot" />

                  <div
                    v-if="index < book.cover_history.length - 1"
                    class="cover-timeline-line"
                  />
                </div>

                <!-- Cover Card -->
                <div class="cover-timeline-content">
                  <v-card
                    elevation="2"
                    rounded="lg"
                    class="pa-2"
                  >
                    <v-img
                      :src="cover.url"
                      :alt="`Cover ${index + 1}`"
                      lazy-src="/placeholder-book-lazy.jpg"
                      :aspect-ratio="0.67"
                      width="140"
                      cover
                      class="bg-surface-variant rounded"
                    />

                    <div class="text-caption text-secondary mt-2 text-center">
                      {{ cover.size }} ({{ cover.width }}px)
                    </div>
                  </v-card>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Rating -->
        <v-card class="mt-4">
          <v-card-text>
            <SubRatingSection
              :stats="bookPageStore.liveSubRatingStats ?? book.sub_rating_stats ?? {}"
              :rating-count="bookPageStore.liveRatingCount ?? book.rating_count ?? 0"
              :slug="slug"
            />
          </v-card-text>
        </v-card>

        <!-- Book Recommendations -->
        <ClientOnly>
          <div
            v-if="bookRecommendations.length > 0 || recommendationsStore.isLoadingBookRecs"
            class="mt-8"
          >
            <template v-if="recommendationsStore.isLoadingBookRecs">
              <div
                v-for="n in 2"
                :key="n"
                class="mb-8"
              >
                <v-skeleton-loader
                  type="heading"
                  width="200"
                  class="mb-3"
                />

                <div class="d-flex gap-3">
                  <v-skeleton-loader
                    v-for="m in 5"
                    :key="m"
                    type="image, article"
                    width="160"
                    class="flex-shrink-0 rounded-lg"
                  />
                </div>
              </div>
            </template>

            <template v-else>
              <template
                v-for="category in bookRecommendations"
                :key="category.key"
              >
                <RecommendationRow
                  v-if="(category.book_items?.length ?? 0) > 0 || (category.author_items?.length ?? 0) > 0"
                  :category="category"
                  hide-show-more
                />
              </template>
            </template>
          </div>
        </ClientOnly>

        <!-- Comments Section -->
        <ClientOnly>
          <v-card class="mt-4">
            <v-card-text>
              <BookCommentsSection :slug="slug" />
            </v-card-text>
          </v-card>
        </ClientOnly>
      </v-col>
    </v-row>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="booksStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>

<style scoped>
.book-cover-shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

/* Description expand/collapse */
.description-content {
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.description-collapsed {
  max-height: 10em;
  position: relative;
}

.description-collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3em;
  background: linear-gradient(transparent, rgb(var(--v-theme-surface)));
  pointer-events: none;
}

/* Cover History Timeline */
.cover-timeline {
  display: flex;
  overflow-x: auto;
  gap: 0;
  padding-bottom: 8px;
}

.cover-timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  min-width: 160px;
}

.cover-timeline-marker {
  display: flex;
  align-items: center;
  width: 100%;
  height: 24px;
  position: relative;
  justify-content: center;
  margin-bottom: 8px;
}

.cover-timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-primary));
  z-index: 1;
  flex-shrink: 0;
}

.cover-timeline-line {
  position: absolute;
  left: 50%;
  right: -50%;
  top: 50%;
  height: 2px;
  background-color: rgb(var(--v-theme-primary));
  opacity: 0.3;
  transform: translateX(6px);
}

.cover-timeline-item:last-child .cover-timeline-line {
  display: none;
}

.cover-timeline-content {
  flex: 1;
}

.cover-timeline::-webkit-scrollbar {
  height: 8px;
}

.cover-timeline::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.cover-timeline::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.cover-timeline::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
