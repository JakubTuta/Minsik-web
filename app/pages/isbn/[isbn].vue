<script setup lang="ts">
import type { APIResponse } from '~/types/api'

interface BookLookup {
  slug: string
  language: string
  title: string
  work_id: string
}

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const apiStore = useApiStore()
const { language } = useUserLanguage()

const isbn = route.params.isbn as string

// An ISBN names one printed edition; this page only finds the book it belongs to and moves on.
const { data: book, error } = await useAsyncData(
  `isbn-${isbn}`,
  async () => (await apiStore.client.get<APIResponse<BookLookup>>(
    `/api/v1/books/isbn/${encodeURIComponent(isbn)}`,

    { params: { language: language.value } },
  )).data.data!,
)

if (error.value || !book.value) {
  throw createError(pageErrorProps(error.value, {
    notFound: t('isbnPage.notFound', { isbn }),
    failed: t('common.loadFailed'),
  }))
}

const otherEdition = book.value.language !== language.value

await navigateTo(
  localePath({
    name: 'books-slug',
    params: { slug: book.value.slug },
    query: otherEdition
      ? { lang: book.value.language }
      : {},
  }),
  { redirectCode: 302, replace: true },
)
</script>

<template>
  <v-container class="py-12 text-center">
    <v-progress-circular indeterminate />
  </v-container>
</template>
