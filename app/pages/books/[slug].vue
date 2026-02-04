<script setup lang="ts">
const route = useRoute()
const router = useRouter()
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
  image: book.value.cover_url,
  type: 'book',
  url: canonicalUrl,
  author: book.value.authors[0]?.name,
})

// Structured data
useBookStructuredData({
  name: book.value.title,
  author: book.value.authors.map(a => a.name),
  isbn: book.value.isbn,
  description: book.value.description,
  image: book.value.cover_url,
  url: canonicalUrl,
  datePublished: book.value.publication_year?.toString(),
  inLanguage: book.value.language,
})

const coverUrl = computed(() => book.value?.cover_url || '/placeholder-book.jpg')
const authorNames = computed(() => book.value?.authors.map(a => a.name).join(', ') || '')
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
                  <span class="text-body-2 text-secondary">by </span>

                  <template
                    v-for="(author, index) in book.authors"
                    :key="author.id"
                  >
                    <a
                      class="text-body-2 text-primary text-decoration-none cursor-pointer"
                      @click="router.push(`/authors/${author.slug}`)"
                    >
                      {{ author.name }}
                    </a>

                    <span
                      v-if="index < book.authors.length - 1"
                      class="text-body-2 text-secondary"
                    >, </span>
                  </template>
                </div>

                <!-- Series -->
                <div
                  v-if="book.series"
                  class="mb-3"
                >
                  <v-chip
                    color="info"
                    variant="tonal"
                    @click="router.push(`/series/${book.series.slug}`)"
                  >
                    {{ book.series.name }}
                    <span v-if="book.series_position"> #{{ book.series_position }}</span>
                  </v-chip>
                </div>

                <!-- Rating -->
                <div
                  v-if="book.rating"
                  class="d-flex align-center mb-4 gap-2"
                >
                  <v-icon
                    icon="mdi-star"
                    color="warning"
                  />

                  <span class="text-h6">{{ book.rating.toFixed(1) }}</span>

                  <span
                    v-if="book.rating_count"
                    class="text-body-2 text-secondary"
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
                  <v-list-item v-if="book.publication_year">
                    <template #prepend>
                      <v-icon icon="mdi-calendar" />
                    </template>

                    <v-list-item-title>Published {{ book.publication_year }}</v-list-item-title>
                  </v-list-item>

                  <v-list-item v-if="book.language">
                    <template #prepend>
                      <v-icon icon="mdi-translate" />
                    </template>

                    <v-list-item-title>{{ book.language.toUpperCase() }}</v-list-item-title>
                  </v-list-item>

                  <v-list-item v-if="book.view_count">
                    <template #prepend>
                      <v-icon icon="mdi-eye" />
                    </template>

                    <v-list-item-title>{{ book.view_count }} views</v-list-item-title>
                  </v-list-item>
                </v-list>

                <!-- Genres -->
                <div
                  v-if="book.genres && book.genres.length > 0"
                  class="mt-4"
                >
                  <v-chip
                    v-for="genre in book.genres"
                    :key="genre"
                    size="small"
                    class="mb-2 mr-2"
                  >
                    {{ genre }}
                  </v-chip>
                </div>

                <!-- Formats -->
                <div
                  v-if="book.formats && book.formats.length > 0"
                  class="mt-2"
                >
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="booksStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>
