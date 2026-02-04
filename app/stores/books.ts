import type { Book } from '~/types/api'
import { defineStore } from 'pinia'

export const useBooksStore = defineStore('books', () => {
  const apiStore = useApiStore()

  // State
  const books = ref(new Map<string, Book>())
  const isLoading = ref(false)
  const lastFetchTime = ref(new Map<string, number>())
  const currentBook = ref<Book | null>(null)

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasData = computed(() => books.value.size > 0)
  const currentBookSlug = computed(() => currentBook.value?.slug || null)

  // Check if book exists in cache
  const hasBook = (slug: string) => {
    return books.value.has(slug)
  }

  // Check if cached data is fresh
  const isCacheFresh = (slug: string) => {
    const timestamp = lastFetchTime.value.get(slug)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // Fetch book details
  const fetchBook = async (slug: string, force = false) => {
    // Return from cache if fresh
    if (!force && hasBook(slug) && isCacheFresh(slug)) {
      currentBook.value = books.value.get(slug)!

      return currentBook.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get<Book>(`/api/v1/books/${slug}`)
      const book = response.data

      // Cache the book
      books.value.set(slug, book)
      lastFetchTime.value.set(slug, Date.now())
      currentBook.value = book

      return book
    }
    catch (error) {
      console.error('Error fetching book:', error)
      currentBook.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // Cache a book (useful when receiving from search results)
  const cacheBook = (book: Book) => {
    books.value.set(book.slug, book)
    lastFetchTime.value.set(book.slug, Date.now())
  }

  // Cache multiple books
  const cacheBooks = (bookList: Book[]) => {
    const timestamp = Date.now()
    bookList.forEach((book) => {
      books.value.set(book.slug, book)
      lastFetchTime.value.set(book.slug, timestamp)
    })
  }

  // Get book from cache
  const getBook = (slug: string) => {
    return books.value.get(slug) || null
  }

  // Refresh current book
  const refresh = async () => {
    if (!currentBook.value)
      return
    await fetchBook(currentBook.value.slug, true)
  }

  // Clear cache
  const clearCache = () => {
    books.value.clear()
    lastFetchTime.value.clear()
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
    cacheBook,
    cacheBooks,
    getBook,
    hasBook,
    refresh,
    clearCache,
  }
})
