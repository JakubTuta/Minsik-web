<script setup lang="ts">
import type { AuthorQuote } from '~/types/api'

interface Props {
  quote: AuthorQuote | null
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <v-card
    v-if="quote"
    color="surface"
    flat
    class=""
  >
    <v-card-text class="d-flex flex-column align-center px-6 py-4 text-center">
      <v-icon
        icon="mdi-format-quote-open"
        size="36"
        color="primary"
        class="mb-4"
      />

      <p
        class="text-h5 font-weight-regular mb-4"
        :class="[
          quote.first_sentence.length > 80
            ? 'text-left'
            : 'text-center',
        ]"
        style="font-style: italic; max-width: 720px; font-family: Georgia, serif;"
      >
        {{ quote.first_sentence }}
      </p>

      <p class="text-body-2 text-medium-emphasis">
        {{ t('author.quoteFrom') }}
        <NuxtLinkLocale
          :to="`/books/${quote.book_slug}`"
          class="text-primary text-decoration-none"
        >
          {{ quote.book_title }}
        </NuxtLinkLocale>

        <span v-if="quote.publication_year">, {{ quote.publication_year }}</span>
      </p>
    </v-card-text>
  </v-card>
</template>
