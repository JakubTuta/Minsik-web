<script setup lang="ts">
import type { OverviewBook } from '~/types/user'

defineProps<{
  books: OverviewBook[]
  year: number
}>()

const { t } = useI18n()
</script>

<template>
  <v-card
    variant="elevated"
    class="mb-6"
  >
    <v-card-title class="text-h6 font-weight-bold">
      {{ t('profile.favouritesOfYear', { year }) }}
    </v-card-title>

    <v-card-text class="pt-2">
      <div
        v-if="books.length"
        class="d-flex flex-wrap gap-3"
      >
        <NuxtLinkLocale
          v-for="book in books"
          :key="book.book_slug"
          :to="`/books/${book.book_slug}`"
          style="width: calc(25% - 9px); min-width: 64px;"
        >
          <v-img
            :src="book.book_cover_url || undefined"
            :alt="book.book_title"
            :aspect-ratio="2/3"
            cover
            rounded="sm"
            lazy-src="/placeholder-book-lazy.jpg"
          >
            <v-tooltip
              activator="parent"
              location="top"
            >
              {{ book.book_title }}
            </v-tooltip>
          </v-img>
        </NuxtLinkLocale>
      </div>

      <div
        v-else
        class="text-body-2 text-medium-emphasis"
      >
        {{ t('profile.noFavouritesThisYear') }}
      </div>
    </v-card-text>
  </v-card>
</template>
