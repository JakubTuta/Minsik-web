import type { APIResponse, Book, BookLanguageVariant } from '~/types/api'
import { defineStore } from 'pinia'
import { APP_LOCALES } from '~~/locales.config'

export const useBooksStore = defineStore('books', () => {
  const apiStore = useApiStore()

  // State
  const books = ref(new Map<string, Book>())
  const isLoading = ref(false)
  const lastFetchTime = ref(new Map<string, number>())
  const currentBook = ref<Book | null>(null)
  const langVariantsCache = ref(new Map<string, BookLanguageVariant[]>())
  const langVariantsFetchTime = ref(new Map<string, number>())

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  const supportedLocales = new Set(APP_LOCALES.map(entry => entry.code))

  // Computed
  const hasData = computed(() => books.value.size > 0)
  const currentBookSlug = computed(() => currentBook.value?.slug || null)

  const cacheKey = (slug: string, lang: string) => `${slug}:${lang}`

  const hasBook = (slug: string, lang: string = 'en') => {
    return books.value.has(cacheKey(slug, lang))
  }

  const isCacheFresh = (slug: string, lang: string = 'en') => {
    const timestamp = lastFetchTime.value.get(cacheKey(slug, lang))
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // The backend resolves the edition itself (requested language -> English ->
  // most-rated) and reports what it served in `book.language`, so a missing
  // translation arrives as a different edition rather than a 404.
  const fetchBook = async (slug: string, lang: string = 'en', force = false) => {
    const key = cacheKey(slug, lang)

    if (!force && hasBook(slug, lang) && isCacheFresh(slug, lang)) {
      currentBook.value = books.value.get(key)!

      return currentBook.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get<APIResponse<Book>>(
        `/api/v1/books/${slug}`,
        { params: { language: lang } },
      )
      const book = response.data.data!

      books.value.set(key, book)
      lastFetchTime.value.set(key, Date.now())
      currentBook.value = book

      return book
    }
    catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Error fetching book:', error)
      }
      currentBook.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  const fetchLanguageVariants = async (slug: string, excludeLang: string = 'en'): Promise<BookLanguageVariant[]> => {
    const key = `${slug}:${excludeLang}`
    const fetchTime = langVariantsFetchTime.value.get(key)

    if (fetchTime && Date.now() - fetchTime < CACHE_TTL) {
      return langVariantsCache.value.get(key) ?? []
    }

    try {
      const response = await apiStore.client.get<APIResponse<{ items: BookLanguageVariant[] }>>(
        `/api/v1/books/${slug}/language-variants`,
        { params: { exclude_language: excludeLang } },
      )
      // The dump carries editions in far more languages than the app ships, and
      // the endpoint returns every one of them. An edition the app has no locale
      // for has no URL that can render it — advertising it would mean a hreflang
      // pointing at a page served in a different language, and a switcher entry
      // that silently drops the reader back to the default locale.
      const items = response.data.data!.items.filter(variant => supportedLocales.has(variant.language))

      langVariantsCache.value.set(key, items)
      langVariantsFetchTime.value.set(key, Date.now())

      return items
    }
    catch {
      return []
    }
  }

  const cacheBook = (book: Book, lang: string = 'en') => {
    books.value.set(cacheKey(book.slug, lang), book)
    lastFetchTime.value.set(cacheKey(book.slug, lang), Date.now())
  }

  const cacheBooks = (bookList: Book[], lang: string = 'en') => {
    const timestamp = Date.now()
    bookList.forEach((book) => {
      books.value.set(cacheKey(book.slug, lang), book)
      lastFetchTime.value.set(cacheKey(book.slug, lang), timestamp)
    })
  }

  const getBook = (slug: string, lang: string = 'en') => {
    return books.value.get(cacheKey(slug, lang)) || null
  }

  const refresh = async () => {
    if (!currentBook.value)
      return
    await fetchBook(currentBook.value.slug, currentBook.value.language, true)
  }

  const clearCache = () => {
    books.value.clear()
    lastFetchTime.value.clear()
    langVariantsCache.value.clear()
    langVariantsFetchTime.value.clear()
    currentBook.value = null
  }

  return {
    // State
    books,
    isLoading,
    lastFetchTime,
    currentBook,

    // Computed
    hasData,
    currentBookSlug,

    // Actions
    fetchBook,
    fetchLanguageVariants,
    cacheBook,
    cacheBooks,
    getBook,
    hasBook,
    refresh,
    clearCache,
  }
})
