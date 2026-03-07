<script setup lang="ts">
import type { Author, Book, BookSummary } from '~/types/api'

interface Props {
  book: Book
  slug: string
  seriesBooks?: BookSummary[]
  primaryAuthor?: Author | null
}

const props = withDefaults(defineProps<Props>(), {
  seriesBooks: () => [],
  primaryAuthor: null,
})

const bookPageStore = useBookPageStore()

const coverUrl = computed(() => props.book.primary_cover_url || '/placeholder-book-lazy.jpg')

const detailsExpanded = ref(false)
const statisticsExpanded = ref(false)

function toggleDetails() {
  detailsExpanded.value = !detailsExpanded.value
  if (detailsExpanded.value)
    statisticsExpanded.value = false
}

function toggleStatistics() {
  statisticsExpanded.value = !statisticsExpanded.value
  if (statisticsExpanded.value)
    detailsExpanded.value = false
}

// Reading time: 1 minute per page
const readingTime = computed(() => {
  const pages = props.book.number_of_pages
  if (!pages || pages <= 0)
    return null

  const minutes = pages
  if (minutes < 60)
    return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  return remainder > 0
    ? `${hours}h ${remainder}min`
    : `${hours}h`
})

function formatSeriesPosition(position: number | null) {
  if (!position)
    return ''

  if (Number.isInteger(position))
    return `#${position}`

  return `#${position.toFixed(1)}`
}
</script>

<template>
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
          aspect-ratio="0.67"
          cover
          eager
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
                class="d-flex series-scroll gap-3"
              >
                <NuxtLink
                  v-for="(seriesBook, index) in seriesBooks"
                  :key="seriesBook.book_id"
                  :to="`/books/${seriesBook.slug}`"
                  class="text-decoration-none flex-shrink-0"
                  style="width: 80px;"
                >
                  <div class="position-relative">
                    <v-img
                      :src="seriesBook.primary_cover_url || '/placeholder-book-lazy.jpg'"
                      :alt="seriesBook.title"
                      aspect-ratio="0.67"
                      width="80"
                      cover
                      class="rounded"
                      :eager="index < 2"
                      :class="{'opacity-75': seriesBook.book_id === book.book_id}"
                    />

                    <!-- Series Position Badge -->
                    <v-badge
                      v-if="seriesBook.series_position"
                      :content="formatSeriesPosition(seriesBook.series_position)"
                      color="primary"
                      class="position-absolute"
                      style="top: 10px; left: 15px;"
                    />

                    <!-- Current Book Indicator -->
                    <div
                      v-if="seriesBook.book_id === book.book_id"
                      class="d-flex align-center position-absolute h-100 w-100 justify-center"
                      style="top: 0; left: 0; background-color: rgba(0, 0, 0, 0.2);"
                    >
                      <v-icon
                        icon="mdi-eye"
                        color="white"
                        size="large"
                      />
                    </div>
                  </div>

                  <div class="font-weight-thin text-onBackground line-clamp-2 mt-1 text-center">
                    {{ seriesBook.title }}
                  </div>

                  <v-tooltip
                    activator="parent"
                    location="bottom"
                  >
                    {{ seriesBook.title }}
                  </v-tooltip>
                </NuxtLink>
              </div>
            </div>

            <!-- Rating -->
            <div class="text-secondary mb-1 mt-6">
              Minsik users reviews
            </div>

            <RatingDisplay
              :rating="bookPageStore.liveAvgRating ?? book.avg_rating"
              :rating-count="bookPageStore.liveRatingCount ?? book.rating_count ?? 0"
            />

            <!-- Other Platform Ratings -->
            <div class="mt-4">
              <div class="text-secondary mb-1">
                Other platforms reviews
              </div>

              <RatingDisplay
                :rating="book.ol_avg_rating"
                :rating-count="book.ol_rating_count"
                size="small"
              />
            </div>

            <!-- First Sentence -->
            <div
              v-if="book.first_sentence"
              class="mt-6"
            >
              <div class="text-secondary mb-1">
                First Sentence
              </div>

              <div
                class="text-body-1 font-italic"
                style="border-left: 3px solid rgb(var(--v-theme-primary)); padding-left: 12px;"
              >
                "{{ book.first_sentence }}"
              </div>
            </div>

            <!-- Categories -->
            <CategoriesChips
              class="mt-6"
              :categories="book.genres.map(e => e.name)"
            />

            <!-- Actions -->
            <ClientOnly>
              <BookActions
                :slug="slug"
                class="mt-6"
              />
            </ClientOnly>

            <!-- Pages & Reading Time -->
            <div
              v-if="book.number_of_pages > 0"
              class="d-flex align-center mt-6 gap-4"
            >
              <div class="d-flex align-center text-body-2 text-medium-emphasis gap-1">
                <v-icon
                  icon="mdi-book-open-page-variant"
                  size="small"
                />

                <span>{{ book.number_of_pages }} pages</span>
              </div>

              <div
                v-if="readingTime"
                class="d-flex align-center text-body-2 text-medium-emphasis gap-1"
              >
                <v-icon
                  icon="mdi-clock-outline"
                  size="small"
                />

                <span>~{{ readingTime }} to read</span>

                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  Based on an average reading speed of 1 page per minute.
                </v-tooltip>
              </div>
            </div>
          </div>

          <!-- Details / Statistics Toggles -->
          <div class="pt-4">
            <div class="d-flex gap-2">
              <v-btn
                variant="text"
                color="secondary"
                size="small"
                @click="toggleDetails"
              >
                Details
                <v-icon
                  :icon="detailsExpanded
                    ? 'mdi-chevron-up'
                    : 'mdi-chevron-down'"
                />
              </v-btn>

              <v-btn
                variant="text"
                color="secondary"
                size="small"
                @click="toggleStatistics"
              >
                Statistics
                <v-icon
                  :icon="statisticsExpanded
                    ? 'mdi-chevron-up'
                    : 'mdi-chevron-down'"
                />
              </v-btn>
            </div>

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
                  <div class="text-secondary font-weight-bold mb-1">
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
                  <div class="text-secondary font-weight-bold mb-1">
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

            <!-- Expandable Statistics Section -->
            <v-expand-transition>
              <div v-show="statisticsExpanded">
                <div class="d-flex text-body-2 mt-2 flex-wrap gap-x-6 gap-y-1">
                  <span v-if="book.view_count">
                    <v-icon
                      icon="mdi-eye"
                      size="small"
                      class="mr-1"
                    />
                    {{ book.view_count.toLocaleString() }} views
                  </span>
                </div>

                <!-- Bookshelf Stats -->
                <div class="text-body-2 mt-3">
                  <div>Minsik want to read: {{ book.app_want_to_read_count.toLocaleString() }}</div>

                  <div>Minsik reading: {{ book.app_reading_count.toLocaleString() }}</div>

                  <div>Minsik read: {{ book.app_read_count.toLocaleString() }}</div>

                  <div class="mt-3">
                    Open Library want to read: {{ book.ol_want_to_read_count.toLocaleString() }}
                  </div>

                  <div>Open Library reading: {{ book.ol_currently_reading_count.toLocaleString() }}</div>

                  <div>Open Library read: {{ book.ol_already_read_count.toLocaleString() }}</div>
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
</template>

<style scoped>
.book-cover-shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.series-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
}
</style>
