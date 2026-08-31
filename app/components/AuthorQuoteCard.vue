<script setup lang="ts">
import type { AuthorQuote } from '~/types/api'

interface Props {
  quote: AuthorQuote
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <QuoteBlock
    :label="t('authorPage.openingLine')"
    :text="quote.first_sentence"
  >
    <template #caption>
      {{ t('author.quoteFrom') }}

      <NuxtLinkLocale
        :to="`/books/${quote.book_slug}`"
        class="text-primary text-decoration-none font-weight-medium"
      >
        {{ quote.book_title }}
      </NuxtLinkLocale>

      <span v-if="quote.publication_year">, {{ quote.publication_year }}</span>

      — {{ t('authorPage.openingLineFootnote') }}
    </template>
  </QuoteBlock>
</template>
