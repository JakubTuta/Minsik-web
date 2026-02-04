import type { Author, Book, PaginatedResponse } from '~/types/api'
import { defineStore } from 'pinia'

export const useAuthorsStore = defineStore('authors', () => {
  const apiStore = useApiStore()

  // State
  const authors = ref(new Map<string, Author>())
  const authorBooks = ref(new Map<string, Book[]>())
  const isLoading = ref(false)
  const isLoadingBooks = ref(false)
  const lastFetchTime = ref(new Map<string, number>())
  const currentAuthor = ref<Author | null>(null)

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasData = computed(() => authors.value.size > 0)
  const currentAuthorSlug = computed(() => currentAuthor.value?.slug || null)
  const currentAuthorBooks = computed(() => (currentAuthor.value
    ? authorBooks.value.get(currentAuthor.value.slug) || []
    : []),
  )

  // Check if author exists in cache
  const hasAuthor = (slug: string) => {
    return authors.value.has(slug)
  }

  // Check if cached data is fresh
  const isCacheFresh = (slug: string) => {
    const timestamp = lastFetchTime.value.get(slug)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // Compute display dates
  const computeDisplayDates = (author: Author) => {
    if (author.birth_date || author.death_date) {
      const birth = author.birth_date
        ? new Date(author.birth_date).getFullYear()
        : '?'
      const death = author.death_date
        ? new Date(author.death_date).getFullYear()
        : 'present'
      author.display_dates = `${birth} - ${death}`
    }
  }

  // Fetch author details
  const fetchAuthor = async (slug: string, force = false) => {
    if (!force && hasAuthor(slug) && isCacheFresh(slug)) {
      currentAuthor.value = authors.value.get(slug)!

      return currentAuthor.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get<Author>(`/api/v1/authors/${slug}`)
      const author = response.data

      // Compute display dates
      computeDisplayDates(author)

      // Cache the author
      authors.value.set(slug, author)
      lastFetchTime.value.set(slug, Date.now())
      currentAuthor.value = author

      return author
    }
    catch (error) {
      console.error('Error fetching author:', error)
      currentAuthor.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // Fetch ALL author's books (load all at once)
  const fetchAuthorBooks = async (slug: string, force = false) => {
    const cacheKey = `${slug}_books`

    if (!force && authorBooks.value.has(slug) && isCacheFresh(cacheKey)) {
      return authorBooks.value.get(slug)!
    }

    isLoadingBooks.value = true

    try {
      // Fetch with large limit to get all books at once
      const response = await apiStore.client.get<PaginatedResponse<Book>>(`/api/v1/authors/${slug}/books`, {
        params: {
          limit: 1000, // Large enough to get all books
          offset: 0,
        },
      })

      const books = response.data.items || []

      // Cache the books
      authorBooks.value.set(slug, books)
      lastFetchTime.value.set(cacheKey, Date.now())

      return books
    }
    catch (error) {
      console.error('Error fetching author books:', error)

      return []
    }
    finally {
      isLoadingBooks.value = false
    }
  }

  // Cache an author
  const cacheAuthor = (author: Author) => {
    computeDisplayDates(author)
    authors.value.set(author.slug, author)
    lastFetchTime.value.set(author.slug, Date.now())
  }

  // Get author from cache
  const getAuthor = (slug: string) => {
    return authors.value.get(slug) || null
  }

  // Refresh current author
  const refresh = async () => {
    if (!currentAuthor.value)
      return
    await fetchAuthor(currentAuthor.value.slug, true)
    await fetchAuthorBooks(currentAuthor.value.slug, true)
  }

  // Clear cache
  const clearCache = () => {
    authors.value.clear()
    authorBooks.value.clear()
    lastFetchTime.value.clear()
    currentAuthor.value = null
  }

  return {
    // State
    authors,
    authorBooks,
    isLoading,
    isLoadingBooks,
    lastFetchTime,
    currentAuthor,

    // Computed
    hasData,
    currentAuthorSlug,
    currentAuthorBooks,

    // Actions
    fetchAuthor,
    fetchAuthorBooks,
    cacheAuthor,
    getAuthor,
    hasAuthor,
    refresh,
    clearCache,
  }
})
