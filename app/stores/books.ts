import type { APIResponse, Book, BookLanguageVariant } from '~/types/api'
import { defineStore } from 'pinia'

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

  // Fetch book details — falls back to 'en' if lang edition not found
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
      if (lang !== 'en' && error?.response?.status === 404) {
        isLoading.value = false
        return fetchBook(slug, 'en', force)
      }
      console.error('Error fetching book:', error)
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
      const items = response.data.data!.items

      langVariantsCache.value.set(key, items)
      langVariantsFetchTime.value.set(key, Date.now())

      return items
    }
    catch {
      return []
    }
  }

  // Cache a book (useful when receiving from search results)
  const cacheBook = (book: Book, lang: string = 'en') => {
    books.value.set(cacheKey(book.slug, lang), book)
    lastFetchTime.value.set(cacheKey(book.slug, lang), Date.now())
  }

  // Cache multiple books
  const cacheBooks = (bookList: Book[], lang: string = 'en') => {
    const timestamp = Date.now()
    bookList.forEach((book) => {
      books.value.set(cacheKey(book.slug, lang), book)
      lastFetchTime.value.set(cacheKey(book.slug, lang), timestamp)
    })
  }

  // Get book from cache
  const getBook = (slug: string, lang: string = 'en') => {
    return books.value.get(cacheKey(slug, lang)) || null
  }

  // Refresh current book
  const refresh = async () => {
    if (!currentBook.value)
      return
    await fetchBook(currentBook.value.slug, currentBook.value.language, true)
  }

  // Clear cache
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
