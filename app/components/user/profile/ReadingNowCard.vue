<script setup lang="ts">
import type { OverviewBook } from '~/types/user'

defineProps<{
  book: OverviewBook | null
}>()

const { t } = useI18n()
</script>

<template>
  <v-card
    variant="elevated"
    class="mb-6"
  >
    <v-card-title class="text-h6 font-weight-bold">
      {{ t('profile.readingRightNow') }}
    </v-card-title>

    <v-card-text class="pt-2">
      <div
        v-if="book"
        class="d-flex gap-4 align-start"
      >
        <NuxtLinkLocale
          :to="`/books/${book.book_slug}`"
          class="flex-shrink-0"
          style="width: 80px; height: 120px; display: block;"
        >
          <BookCover
            :title="book.book_title"
            :src="book.book_cover_url"
            :width="80"
            :height="120"
            fit="cover"
            rounded
          />
        </NuxtLinkLocale>

        <div class="min-w-0">
          <NuxtLinkLocale
            :to="`/books/${book.book_slug}`"
            class="text-decoration-none text-primary"
          >
            <div class="text-body-1 font-weight-bold">
              {{ book.book_title }}
            </div>
          </NuxtLinkLocale>

          <div class="text-body-2 text-medium-emphasis mt-2">
            <template
              v-for="(name, i) in book.book_author_names"
              :key="name"
            >
              <NuxtLinkLocale
                :to="`/authors/${book.book_author_slugs[i]}`"
                class="text-decoration-none text-medium-emphasis"
              >
                {{ name }}
              </NuxtLinkLocale>

              <span v-if="i < book.book_author_names.length - 1">, </span>
            </template>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-body-2 text-medium-emphasis"
      >
        {{ t('profile.notReadingAnything') }}
      </div>
    </v-card-text>
  </v-card>
</template>
