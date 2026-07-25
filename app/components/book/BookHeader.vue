<script setup lang="ts">
import type { Author, Book, BookLanguageVariant, BookSummary } from '~/types/api'
import { hashColor } from '~/utils/coverColor'
import { formatReadingTime } from '~/utils/readingTime'

interface Props {
  book: Book
  slug: string
  seriesBooks?: BookSummary[]
  primaryAuthor?: Author | null
  langVariants?: BookLanguageVariant[]
  currentLang?: string
}

const props = withDefaults(defineProps<Props>(), {
  seriesBooks: () => [],
  primaryAuthor: null,
  langVariants: () => [],
  currentLang: 'en',
})

const bookPageStore = useBookPageStore()

const { optimized } = useOptimizedImage()
const coverUrl = computed(() => optimized(props.book.primary_cover_url, 640))
const coverBg = computed(() => coverColor(props.book))

const coverRef = ref<HTMLElement | null>(null)
useParallax(coverRef)

const lightboxOpen = ref(false)
const detailsExpanded = ref(false)
const statisticsExpanded = ref(false)
const langVariantsExpanded = ref(false)
const externalLinksExpanded = ref(false)

const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

const languageDisplay = computed(() => {
  const lang = props.book.language
  if (!lang)
    return null

  try {
    return languageNames.of(lang) || lang
  }
  catch {
    return lang
  }
})

const combinedReaders = computed(() => props.book.app_want_to_read_count + props.book.app_reading_count + props.book.app_read_count
  + props.book.ol_want_to_read_count + props.book.ol_currently_reading_count + props.book.ol_already_read_count,
)

const combinedReadersFormatted = computed(() => compactFmt.format(combinedReaders.value))

interface ExternalLink {
  title: string
  url: string
  icon: string
  color?: string
}

const externalLinks = computed<ExternalLink[]>(() => {
  const result: ExternalLink[] = []
  const exIds = props.book.external_ids || {}

  if (props.book.open_library_id) {
    const isEdition = props.book.open_library_id.endsWith('M')
    result.push({
      title: 'Open Library',
      url: `https://openlibrary.org/${isEdition
        ? 'books'
        : 'works'}/${props.book.open_library_id}`,
      icon: 'mdi-library',
      color: '#e2d5c3',
    })
  }
  if (props.book.google_books_id) {
    result.push({
      title: 'Google Books',
      url: `https://books.google.com/books?id=${props.book.google_books_id}`,
      icon: 'mdi-google',
      color: '#4285F4',
    })
  }
  if (exIds.goodreads) {
    result.push({
      title: 'Goodreads',
      url: `https://www.goodreads.com/book/show/${exIds.goodreads}`,
      icon: 'mdi-alpha-g-box',
      color: '#553b08',
    })
  }
  if (exIds.librarything) {
    result.push({
      title: 'LibraryThing',
      url: `https://www.librarything.com/work/${exIds.librarything}`,
      icon: 'mdi-bookshelf',
      color: '#947A6D',
    })
  }
  if (exIds.amazon) {
    result.push({
      title: 'Amazon',
      url: `https://www.amazon.com/dp/${exIds.amazon}`,
      icon: 'mdi-cart',
      color: '#FF9900',
    })
  }
  if (exIds.better_world_books) {
    result.push({
      title: 'Better World Books',
      url: `https://www.betterworldbooks.com/product/detail/${exIds.better_world_books}`,
      icon: 'mdi-earth',
      color: '#4CAF50',
    })
  }
  if (exIds.dnb) {
    result.push({
      title: 'DNB',
      url: `https://d-nb.info/${exIds.dnb}`,
      icon: 'mdi-bank',
      color: '#333333',
    })
  }

  return result
})

const hasExternalLinks = computed(() => externalLinks.value.length > 0)

function toggleDetails() {
  detailsExpanded.value = !detailsExpanded.value
  if (detailsExpanded.value) {
    statisticsExpanded.value = false
    langVariantsExpanded.value = false
    externalLinksExpanded.value = false
  }
}

function toggleStatistics() {
  statisticsExpanded.value = !statisticsExpanded.value
  if (statisticsExpanded.value) {
    detailsExpanded.value = false
    langVariantsExpanded.value = false
    externalLinksExpanded.value = false
  }
}

function toggleLangVariants() {
  langVariantsExpanded.value = !langVariantsExpanded.value
  if (langVariantsExpanded.value) {
    detailsExpanded.value = false
    statisticsExpanded.value = false
    externalLinksExpanded.value = false
  }
}

function toggleExternalLinks() {
  externalLinksExpanded.value = !externalLinksExpanded.value
  if (externalLinksExpanded.value) {
    detailsExpanded.value = false
    statisticsExpanded.value = false
    langVariantsExpanded.value = false
  }
}

function langLabel(code: string): string {
  return languageNames.of(code) || code.toUpperCase()
}

// The backend falls back to the best available edition when the requested
// language has none — surface that so the reader knows why they're seeing
// e.g. English when they asked for Polish.
const showFallbackNotice = computed(() => !!props.book.language && !!props.currentLang && props.book.language !== props.currentLang)

const readingTime = computed(() => formatReadingTime(props.book.number_of_pages))

const bookStats = computed(() => {
  const items: Array<{
    icon: string
    value: string | number
    label: string
  }> = []

  if (props.book.number_of_pages > 0) {
    items.push({
      icon: 'mdi-book-open-page-variant',
      value: props.book.number_of_pages.toLocaleString(),
      label: 'PAGES',
    })
  }

  if (readingTime.value) {
    items.push({
      icon: 'mdi-clock-outline',
      value: `~${readingTime.value}`,
      label: 'READING TIME',
    })
  }

  if (languageDisplay.value) {
    items.push({
      icon: 'mdi-translate',
      value: languageDisplay.value,
      label: 'LANGUAGE',
    })
  }

  if (combinedReaders.value > 0) {
    items.push({
      icon: 'mdi-account-multiple',
      value: combinedReadersFormatted.value,
      label: 'READERS',
    })
  }

  return items
})

function formatSeriesPosition(position: number | null) {
  if (!position)
    return ''

  if (Number.isInteger(position))
    return `#${position.toFixed(0)}`

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
        <div
          ref="coverRef"
          class="cursor-pointer"
          @click="lightboxOpen = true"
        >
          <v-img
            :src="coverUrl"
            :alt="book.title"
            aspect-ratio="0.67"
            cover
            eager
            class="book-cover-shadow rounded"
          >
            <template #placeholder>
              <HashedFill :color="coverBg" />
            </template>
          </v-img>
        </div>

        <v-dialog
          v-model="lightboxOpen"
          max-width="600"
        >
          <v-img
            :src="coverUrl"
            :alt="book.title"
            contain
            max-height="90vh"
            class="rounded"
            @click="lightboxOpen = false"
          >
            <template #placeholder>
              <HashedFill :color="coverBg" />
            </template>
          </v-img>
        </v-dialog>
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

            <v-alert
              v-if="showFallbackNotice"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              Not yet available in {{ langLabel(currentLang) }} — showing the {{ langLabel(book.language) }} edition.
            </v-alert>

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
                  v-for="seriesBook in seriesBooks"
                  :key="seriesBook.book_id"
                  :to="`/books/${seriesBook.slug}`"
                  class="text-decoration-none flex-shrink-0"
                  style="width: 80px;"
                >
                  <div class="position-relative">
                    <v-img
                      :src="seriesBook.primary_cover_url || undefined"
                      :alt="seriesBook.title"
                      aspect-ratio="0.67"
                      width="80"
                      cover
                      class="rounded"
                      :class="{'opacity-75': seriesBook.book_id === book.book_id}"
                    >
                      <template #placeholder>
                        <HashedFill :color="hashColor(seriesBook.title, book.series?.name)" />
                      </template>
                    </v-img>

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

            <!-- Ratings Card -->
            <v-card
              class="mt-6"
              flat
              color="background"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-stretch">
                  <div class="d-flex flex-column align-center flex-1 pa-2 text-center">
                    <div class="text-caption text-secondary mb-1">
                      Minsik readers
                    </div>

                    <div class="text-h4 font-weight-bold text-primary">
                      {{ (bookPageStore.liveAvgRating ?? book.avg_rating).toFixed(1) }}
                    </div>

                    <v-rating
                      :model-value="Math.floor((bookPageStore.liveAvgRating ?? book.avg_rating) * 2) / 2"
                      readonly
                      half-increments
                      color="warning"
                      active-color="warning"
                      density="compact"
                      size="small"
                    />

                    <div class="text-caption text-secondary mt-1">
                      {{ (bookPageStore.liveRatingCount ?? book.rating_count ?? 0).toLocaleString() }} ratings
                    </div>
                  </div>

                  <v-divider vertical />

                  <div class="d-flex flex-column align-center flex-1 pa-2 text-center">
                    <div class="text-caption text-secondary mb-1">
                      Other platforms
                    </div>

                    <div class="text-h4 font-weight-bold text-primary">
                      {{ book.ol_avg_rating.toFixed(1) }}
                    </div>

                    <v-rating
                      :model-value="Math.floor(book.ol_avg_rating * 2) / 2"
                      readonly
                      half-increments
                      color="warning"
                      active-color="warning"
                      density="compact"
                      size="small"
                    />

                    <div class="text-caption text-secondary mt-1">
                      {{ book.ol_rating_count.toLocaleString() }} ratings
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Stats Row -->
            <StatsRow
              :stats="bookStats"
              class="mt-4"
            />

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
          </div>

          <!-- Details / Statistics Toggles -->
          <div class="pt-4">
            <div class="d-flex flex-wrap gap-2">
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

              <v-btn
                v-if="langVariants.length > 0"
                variant="text"
                color="secondary"
                size="small"
                @click="toggleLangVariants"
              >
                Languages
                <v-icon
                  :icon="langVariantsExpanded
                    ? 'mdi-chevron-up'
                    : 'mdi-chevron-down'"
                />
              </v-btn>

              <v-btn
                v-if="hasExternalLinks"
                variant="text"
                color="secondary"
                size="small"
                @click="toggleExternalLinks"
              >
                External Links
                <v-icon
                  :icon="externalLinksExpanded
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

            <!-- Expandable Languages Section -->
            <v-expand-transition>
              <div v-show="langVariantsExpanded">
                <div class="d-flex mt-2 gap-3 overflow-x-auto pb-2">
                  <NuxtLink
                    v-for="variant in langVariants"
                    :key="variant.language"
                    :to="`/books/${slug}?lang=${variant.language}`"
                    replace
                    class="text-decoration-none flex-shrink-0"
                  >
                    <div
                      class="d-flex flex-column align-center gap-1"
                      style="width: 80px;"
                    >
                      <v-img
                        :src="variant.primary_cover_url || undefined"
                        lazy-src="/placeholder-book-lazy.jpg"
                        :alt="variant.title"
                        width="80"
                        height="116"
                        cover
                        class="rounded"
                        :class="{'border-primary border-2': variant.language === currentLang}"
                      />

                      <span class="text-caption text-medium-emphasis text-center">
                        {{ langLabel(variant.language) }}
                      </span>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </v-expand-transition>

            <!-- Expandable External Links Section -->
            <v-expand-transition>
              <div v-show="externalLinksExpanded">
                <div class="d-flex mt-2 flex-wrap gap-2">
                  <v-btn
                    v-for="link in externalLinks"
                    :key="link.title"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    :color="link.color"
                    :prepend-icon="link.icon"
                    append-icon="mdi-open-in-new"
                  >
                    {{ link.title }}
                  </v-btn>
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
