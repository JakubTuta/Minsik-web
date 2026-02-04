<script setup lang="ts">
const route = useRoute()
const authorsStore = useAuthorsStore()

const slug = route.params.slug as string

// Fetch author data and books
const { data: author, error: authorError } = await useAsyncData(
  `author-${slug}`,
  () => authorsStore.fetchAuthor(slug),
)

const { data: books, error: booksError } = await useAsyncData(
  `author-books-${slug}`,
  () => authorsStore.fetchAuthorBooks(slug),
)

// Handle 404
if (authorError.value || !author.value) {
  throw createError({
    statusCode: 404,
    message: 'Author not found',
  })
}

// SEO
const config = useRuntimeConfig()
const canonicalUrl = `${config.public.siteUrl}/authors/${slug}`

useSeo({
  title: author.value.name,
  description: author.value.biography || `${author.value.name} - Author of ${author.value.book_count} books`,
  image: author.value.photo_url,
  type: 'profile',
  url: canonicalUrl,
  author: author.value.name,
})

// Structured data
useAuthorStructuredData({
  name: author.value.name,
  description: author.value.biography,
  image: author.value.photo_url,
  url: canonicalUrl,
  birthDate: author.value.birth_date,
  deathDate: author.value.death_date,
})

const photoUrl = computed(() => author.value?.photo_url || '/placeholder-avatar.jpg')
</script>

<template>
  <v-container v-if="author">
    <v-row>
      <!-- Author Info Card -->
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                md="3"
                class="text-center"
              >
                <v-avatar
                  size="150"
                  color="surface-variant"
                >
                  <v-img
                    :src="photoUrl"
                    :alt="author.name"
                  >
                    <template #placeholder>
                      <v-icon
                        icon="mdi-account"
                        size="x-large"
                      />
                    </template>
                  </v-img>
                </v-avatar>
              </v-col>

              <v-col
                cols="12"
                md="9"
              >
                <h1 class="text-h4 font-weight-bold mb-3">
                  {{ author.name }}
                </h1>

                <div
                  v-if="author.display_dates"
                  class="text-body-1 text-secondary mb-3"
                >
                  {{ author.display_dates }}
                </div>

                <v-chip
                  color="primary"
                  variant="tonal"
                  class="mb-4"
                >
                  {{ author.book_count }} {{ author.book_count === 1
                    ? 'book'
                    : 'books' }}
                </v-chip>

                <div
                  v-if="author.view_count"
                  class="d-flex align-center mb-4 gap-2"
                >
                  <v-icon
                    icon="mdi-eye"
                    size="small"
                  />

                  <span class="text-body-2 text-secondary">{{ author.view_count }} views</span>
                </div>
              </v-col>
            </v-row>

            <v-divider
              v-if="author.biography"
              class="my-4"
            />

            <div v-if="author.biography">
              <h2 class="text-h6 font-weight-bold mb-3">
                Biography
              </h2>

              <p
                class="text-body-1"
                style="white-space: pre-line;"
              >
                {{ author.biography }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Books Section -->
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">
          Books by {{ author.name }}
        </h2>
      </v-col>

      <!-- Books Grid -->
      <template v-if="books && books.length > 0">
        <v-col
          v-for="book in books"
          :key="book.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <BookCard :book="book" />
        </v-col>
      </template>

      <!-- No Books State -->
      <v-col
        v-else-if="!authorsStore.isLoadingBooks"
        cols="12"
      >
        <v-alert
          type="info"
          variant="tonal"
        >
          No books found for this author.
        </v-alert>
      </v-col>

      <!-- Loading Books -->
      <v-col
        v-if="authorsStore.isLoadingBooks"
        cols="12"
      >
        <LoadingState
          type="grid"
          :count="4"
        />
      </v-col>
    </v-row>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="authorsStore.isLoading">
    <LoadingState type="detail" />
  </v-container>
</template>
