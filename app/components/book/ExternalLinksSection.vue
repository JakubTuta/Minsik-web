<script setup lang="ts">
import type { Book } from '~/types/api'

interface Props {
  book: Book
}

const props = defineProps<Props>()

interface ExternalLink {
  title: string
  url: string
  icon: string
  color?: string
}

const links = computed<ExternalLink[]>(() => {
  const result: ExternalLink[] = []

  if (props.book.open_library_id) {
    const isEdition = props.book.open_library_id.endsWith('M')
    const path = isEdition
      ? 'books'
      : 'works'
    result.push({
      title: 'Open Library',
      url: `https://openlibrary.org/${path}/${props.book.open_library_id}`,
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

  const exIds = props.book.external_ids || {}

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
      icon: 'mdi-amazon',
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

const hasLinks = computed(() => links.value.length > 0)

const cardRef = ref<HTMLElement | null>(null)
useScrollReveal(cardRef)
</script>

<template>
  <v-card
    v-if="hasLinks"
    ref="cardRef"
    class="mt-4"
  >
    <v-card-text>
      <h2 class="text-h6 font-weight-bold mb-3">
        Check out this book on other platforms
      </h2>

      <v-list lines="two">
        <template
          v-for="(link, index) in links"
          :key="link.title"
        >
          <v-list-item
            variant="elevated"
            class="my-1"
          >
            <template #prepend>
              <v-icon
                :color="link.color"
                size="large"
                class="mr-3"
              >
                {{ link.icon }}
              </v-icon>
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ link.title }}
            </v-list-item-title>

            <template #append>
              <v-btn
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                variant="elevated"
                size="small"
                color="primary"
                append-icon="mdi-open-in-new"
              >
                Open
              </v-btn>
            </template>
          </v-list-item>

          <v-divider v-if="index < links.length - 1" />
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>
