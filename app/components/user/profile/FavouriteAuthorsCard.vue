<script setup lang="ts">
import type { FavouriteAuthor } from '~/types/user'

defineProps<{
  authors: FavouriteAuthor[]
}>()
</script>

<template>
  <v-card
    variant="elevated"
    class="mb-6"
  >
    <v-card-title class="text-h6 font-weight-bold">
      Favourite authors
    </v-card-title>

    <v-card-text class="pt-2">
      <div
        v-if="authors.length"
        class="d-flex flex-column gap-4"
      >
        <div
          v-for="author in authors"
          :key="author.slug"
          class="d-flex align-center gap-3"
        >
          <v-avatar
            size="44"
            color="secondary"
            class="flex-shrink-0"
          >
            <v-img
              v-if="author.photo_url"
              :src="author.photo_url"
              :alt="author.name"
              lazy-src="/placeholder-avatar.jpg"
              cover
            />
            <span
              v-else
              class="text-body-2 font-weight-bold"
            >{{ author.name.charAt(0).toUpperCase() }}</span>
          </v-avatar>

          <div class="flex-grow-1 min-w-0">
            <NuxtLink
              :to="`/authors/${author.slug}`"
              class="text-decoration-none text-body-1 font-weight-medium text-primary"
            >
              {{ author.name }}
            </NuxtLink>
          </div>

          <span class="text-body-2 text-medium-emphasis flex-shrink-0">
            {{ author.count }} {{ author.count === 1 ? 'book' : 'books' }}
          </span>
        </div>
      </div>

      <div
        v-else
        class="text-body-2 text-medium-emphasis"
      >
        No author data yet.
      </div>
    </v-card-text>
  </v-card>
</template>
