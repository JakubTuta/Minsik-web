<script setup lang="ts">
const route = useRoute()
const booksStore = useBooksStore()

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
            >
              <v-img
                :src="coverUrl"
                :alt="book.title"
                aspect-ratio="0.67"
                cover
                class="bg-surface-variant"
              >
                <template #placeholder>
                  <div class="d-flex align-center fill-height justify-center">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    />
                  </div>
                </template>
              </v-img>
            </v-col>

            <!-- Book Info -->
            <v-col
              cols="12"
              md="8"
              lg="9"
            >
              <v-card-text>
                <h1 class="text-h4 font-weight-bold mb-3">
                  {{ book.title }}
                </h1>

                <!-- Authors -->
                <div
                  v-if="book.authors.length > 0"
                  class="mb-3"
                >
                  <span class="font-weight-bold text-h6 text-secondary">by </span>

                  <template
                    v-for="(author, index) in book.authors"
                    :key="author.author_id"
                  >
                    <NuxtLink
                      class="font-weight-bold text-h6 text-primary text-decoration-none cursor-pointer"
                      :to="`/authors/${author.slug}`"
                    >
                      {{ author.name }}
                    </NuxtLink>

                    <span
                      v-if="index < book.authors.length - 1"
                      class="font-weight-bold text-h6 text-secondary"
                    >, </span>
                  </template>
                </div>

                <!-- Series -->
                <div
                  v-if="book.series"
                  class="mb-3"
                >
                  <span class="font-weight-bold text-body-1 text-secondary">series: </span>

                  <NuxtLink
                    class="font-weight-bold text-body-1 text-primary text-decoration-none"
                    :to="`/series/${book.series.slug}`"
                  >
                    {{ book.series.name }}
                    <span v-if="book.series_position"> #{{ book.series_position }}</span>
                  </NuxtLink>
                </div>

                <!-- Rating -->
                <div
                  v-if="book.avg_rating > 0"
                  class="d-flex align-center mb-4 gap-2"
                >
                  <v-icon
                    icon="mdi-star"
                    color="warning"
                  />

                  <span class="text-h6">{{ book.avg_rating.toFixed(1) }}</span>

                  <span
                    v-if="book.rating_count"
                    class="text-body-2 text-primary"
                  >
                    ({{ book.rating_count }} {{ book.rating_count === 1
                      ? 'rating'
                      : 'ratings' }})
                  </span>
                </div>

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
                    {{ genre.name }}
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
                    {{ format }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-col>
          </v-row>

          <!-- Description -->
          <v-divider />

          <v-card-text v-if="book.description">
            <h2 class="text-h6 font-weight-bold mb-3">
              Description
            </h2>

            <p
              class="text-body-1"
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
