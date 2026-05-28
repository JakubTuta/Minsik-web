<script setup lang="ts">
import type { BookLanguageVariant } from '~/types/api'

const props = defineProps<{
  slug: string
  variants: BookLanguageVariant[]
  currentLang: string
}>()

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

function langLabel(code: string): string {
  return languageNames.of(code) || code.toUpperCase()
}
</script>

<template>
  <v-card class="mt-4">
    <v-card-text>
      <h2 class="text-h6 font-weight-bold mb-3">
        Other Editions
      </h2>

      <div class="d-flex gap-3 overflow-x-auto pb-2">
        <NuxtLink
          v-for="variant in props.variants"
          :key="variant.language"
          :to="`/books/${props.slug}?lang=${variant.language}`"
          replace
          class="text-decoration-none flex-shrink-0"
        >
          <div
            class="d-flex flex-column align-center gap-1"
            style="width: 90px;"
          >
            <v-img
              :src="variant.primary_cover_url || undefined"
              lazy-src="/placeholder-book-lazy.jpg"
              :alt="variant.title"
              width="90"
              height="130"
              cover
              class="rounded"
              :class="{'border-primary border-2': variant.language === props.currentLang}"
            />

            <span class="text-caption text-medium-emphasis text-center">
              {{ langLabel(variant.language) }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </v-card-text>
  </v-card>
</template>
