<script setup lang="ts">
import type { Book } from '~/types/api'

const route = useRoute()
const booksStore = useBooksStore()
const authorsStore = useAuthorsStore()
const seriesStore = useSeriesStore()

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

// Fetch full author data (non-blocking, for caching)
const primaryAuthor = ref<any>(null)
const seriesBooks = ref<Book[]>([])
const detailsExpanded = ref(false)

onMounted(async () => {
  // Fetch author data
  if (book.value?.authors[0]?.slug) {
    try {
      primaryAuthor.value = await authorsStore.fetchAuthor(book.value.authors[0].slug)
    }
    catch {
      // Silently fail
    }
  }

  // Fetch series books
  if (book.value?.series?.slug) {
    try {
      seriesBooks.value = await seriesStore.fetchSeriesBooks(book.value.series.slug)
    }
    catch {
      // Silently fail
    }
  }
})
</script>

<template>
  <v-container v-if="book">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-row no-gutters>
            <!-- Book Cover -->
            <v-col
              cols="12"
              md="4"
              lg="3"
              class="pa-0"
            >
              <v-img
                :src="coverUrl"
                :alt="book.title"
                lazy-src="/placeholder-book-lazy.jpg"
                aspect-ratio="0.67"
                cover
                class="bg-surface-variant"
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
                      <span class="font-weight-bold text-body-1 text-secondary">Series: </span>

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
                      class="d-flex gap-2"
                      style="overflow-x: auto; overflow-y: hidden;"
                    >
                      <NuxtLink
                        v-for="seriesBook in seriesBooks"
                        :key="seriesBook.book_id"
                        :to="`/books/${seriesBook.slug}`"
                        class="text-decoration-none flex-shrink-0"
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
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Rating -->
                  <RatingDisplay
                    :rating="book.avg_rating || 0"
                    :rating-count="book.rating_count || 0"
                  />
                </div>

                <!-- Details Toggle Button -->
                <div class="mt-auto pt-4">
                  <v-btn
                    variant="text"
                    color="primary"
                    class="px-4"
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
                      <!-- Metadata -->
                      <v-list
                        density="compact"
                        class="bg-transparent"
                      >
                        <v-list-item v-if="book.original_publication_year">
                          <template #prepend>
                            <v-icon icon="mdi-calendar" />
                          </template>

                          <v-list-item-title>Published {{ book.original_publication_year }}</v-list-item-title>
                        </v-list-item>

                        <v-list-item v-if="book.view_count">
                          <template #prepend>
                            <v-icon icon="mdi-eye" />
                          </template>

                          <v-list-item-title>{{ book.view_count }} views</v-list-item-title>
                        </v-list-item>
                      </v-list>

                      <!-- Categories -->
                      <div
                        v-if="book.genres && book.genres.length > 0"
                        class="mt-4"
                      >
                        <h3 class="text-subtitle-2 text-secondary font-weight-bold mb-2">
                          Categories
                        </h3>

                        <v-chip
                          v-for="genre in book.genres"
                          :key="genre.genre_id"
                          size="small"
                          class="mb-2 mr-2"
                        >
                          {{ toTitleCase(genre.name) }}
                        </v-chip>
                      </div>

                      <!-- Editions -->
                      <div
                        v-if="book.formats && book.formats.length > 0"
                        class="mt-4"
                      >
                        <h3 class="text-subtitle-2 text-secondary font-weight-bold mb-2">
                          Editions
                        </h3>

                        <v-chip
                          v-for="format in book.formats"
                          :key="format"
                          size="small"
                          variant="outlined"
                          class="mb-2 mr-2"
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
            >
              <AuthorShortCard :author="primaryAuthor" />
            </v-col>
          </v-row>

          <!-- Description -->
          <v-divider />

          <v-card-text v-if="book.description">
            <h2 class="text-h6 font-weight-bold mb-3">
              Description
            </h2>

            <p
              class="font-size-4"
              style="white-space: pre-line;"
            >
              {{ book.description }}
            </p>
          </v-card-text>

          <!-- Cover History -->
          <template v-if="book.cover_history && book.cover_history.length > 1">
            <v-divider />

            <v-card-text>
              <h2 class="text-h6 font-weight-bold mb-3">
                Cover History
              </h2>

              <div class="cover-history-list">
                <div
                  v-for="(cover, index) in book.cover_history"
                  :key="index"
                  class="cover-history-item"
                >
                  <v-card
                    elevation="2"
                    rounded="lg"
                  >
                    <v-img
                      :src="cover.url"
                      :alt="`Cover ${index + 1}`"
                      lazy-src="/placeholder-book-lazy.jpg"
                      :aspect-ratio="0.67"
                      cover
                      class="bg-surface-variant"
                    />

                    <v-card-text class="pa-2 text-center">
                      <div class="text-caption text-secondary">
                        {{ cover.size }} ({{ cover.width }}px)
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="booksStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>

<style scoped>
.cover-history-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.cover-history-item {
  flex: 0 0 auto;
  width: 200px;
}

.cover-history-list::-webkit-scrollbar {
  height: 8px;
}

.cover-history-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.cover-history-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.cover-history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
