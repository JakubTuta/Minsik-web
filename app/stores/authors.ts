import type { APIResponse, Author, AuthorBooksResponse, AuthorQuote, AuthorStats, AuthorTopBooksResponse, BookSummary } from '~/types/api'
import { defineStore } from 'pinia'

export const useAuthorsStore = defineStore('authors', () => {
  const apiStore = useApiStore()
  const { language } = useUserLanguage()

  // State
  const authors = ref(new Map<string, Author>())
  const authorBooks = ref(new Map<string, BookSummary[]>())
  const authorBooksPages = ref(new Map<string, AuthorBooksResponse>())
  const isLoading = ref(false)
  const lastFetchTime = ref(new Map<string, number>())
  const currentAuthor = ref<Author | null>(null)

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Language is part of every cache key: stats and editions both change with it.
  const cacheKey = (...parts: (string | number)[]) => [language.value, ...parts].join(':')

  // Computed
  const hasData = computed(() => authors.value.size > 0)
  const currentAuthorSlug = computed(() => currentAuthor.value?.slug || null)

  const hasAuthor = (slug: string) => {
    return authors.value.has(cacheKey(slug))
  }

  const isCacheFresh = (key: string) => {
    const timestamp = lastFetchTime.value.get(key)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

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

  const fetchAuthor = async (slug: string, force = false) => {
    const key = cacheKey(slug)

    if (!force && hasAuthor(slug) && isCacheFresh(key)) {
      currentAuthor.value = authors.value.get(key)!

      return currentAuthor.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get<APIResponse<Author>>(`/api/v1/authors/${slug}`, {
        params: { language: language.value },
      })
      const author = response.data.data!

      computeDisplayDates(author)

      authors.value.set(key, author)
      lastFetchTime.value.set(key, Date.now())
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

  // Fetch a single page of author's books (for infinite scroll)
  const fetchAuthorBooksPage = async (
    slug: string,
    sortBy: 'publication_year' | 'combined_rating' | 'readers_count' = 'publication_year',
    order: 'asc' | 'desc' = 'desc',
    offset = 0,
    limit = 10,
  ): Promise<AuthorBooksResponse> => {
    const key = cacheKey(slug, 'books-page', sortBy, order, offset, limit)

    if (authorBooksPages.value.has(key) && isCacheFresh(key)) {
      return authorBooksPages.value.get(key)!
    }

    try {
      const response = await apiStore.client.get<APIResponse<AuthorBooksResponse>>(`/api/v1/authors/${slug}/books`, {
        params: { limit, offset, sort_by: sortBy, order, language: language.value },
      })
      const page = response.data.data!

      authorBooksPages.value.set(key, page)
      lastFetchTime.value.set(key, Date.now())

      return page
    }
    catch {
      return { books: [], total_count: 0, limit, offset }
    }
  }

  // Fetch ALL author's books (load all at once)
  const fetchAuthorBooks = async (
    slug: string,
    sortBy: 'publication_year' | 'combined_rating' | 'readers_count' = 'combined_rating',
    order: 'asc' | 'desc' = 'desc',
    force = false,
  ) => {
    const key = cacheKey(slug, 'books', sortBy, order)

    if (!force && authorBooks.value.has(key) && isCacheFresh(key)) {
      return authorBooks.value.get(key)!
    }

    try {
      const response = await apiStore.client.get<APIResponse<AuthorBooksResponse>>(`/api/v1/authors/${slug}/books`, {
        params: {
          limit: 100, // API maximum limit
          offset: 0,
          sort_by: sortBy,
          order,
          language: language.value,
        },
      })

      const books = response.data.data?.books || []

      authorBooks.value.set(key, books)
      lastFetchTime.value.set(key, Date.now())

      return books
    }
    catch {
      return []
    }
  }

  const authorQuoteCache = ref(new Map<string, { data: AuthorQuote | null, timestamp: number }>())
  const authorTopBooksCache = ref(new Map<string, { data: BookSummary[], timestamp: number }>())

  const fetchAuthorQuote = async (slug: string, force = false): Promise<AuthorQuote | null> => {
    const key = cacheKey(slug)
    const cached = authorQuoteCache.value.get(key)
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL)
      return cached.data

    try {
      const response = await apiStore.client.get<APIResponse<AuthorQuote>>(`/api/v1/authors/${slug}/quote`, {
        params: { language: language.value },
      })
      const data = response.data.data ?? null
      authorQuoteCache.value.set(key, { data, timestamp: Date.now() })

      return data
    }
    catch {
      return null
    }
  }

  const fetchAuthorTopBooks = async (slug: string, force = false): Promise<BookSummary[]> => {
    const key = cacheKey(slug)
    const cached = authorTopBooksCache.value.get(key)
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL)
      return cached.data

    try {
      const response = await apiStore.client.get<APIResponse<AuthorTopBooksResponse>>(`/api/v1/authors/${slug}/top-books`, {
        params: { language: language.value },
      })
      const books = response.data.data?.books ?? []
      authorTopBooksCache.value.set(key, { data: books, timestamp: Date.now() })

      return books
    }
    catch {
      return []
    }
  }

  // Never cached in the store: the progress half of the payload is the
  // viewer's own, so a cached copy would follow a sign-out into the next
  // session's page.
  const fetchAuthorStats = async (slug: string): Promise<AuthorStats | null> => {
    try {
      const response = await apiStore.client.get<APIResponse<AuthorStats>>(`/api/v1/authors/${slug}/stats`, {
        params: { language: language.value },
      })

      return response.data.data ?? null
    }
    catch {
      return null
    }
  }

  const cacheAuthor = (author: Author) => {
    computeDisplayDates(author)
    authors.value.set(cacheKey(author.slug), author)
    lastFetchTime.value.set(cacheKey(author.slug), Date.now())
  }

  const getAuthor = (slug: string) => {
    return authors.value.get(cacheKey(slug)) || null
  }

  const refresh = async () => {
    if (!currentAuthor.value)
      return
    await fetchAuthor(currentAuthor.value.slug, true)
    await fetchAuthorBooks(currentAuthor.value.slug, 'combined_rating', 'desc', true)
  }

  const clearCache = () => {
    authors.value.clear()
    authorBooks.value.clear()
    authorBooksPages.value.clear()
    authorQuoteCache.value.clear()
    authorTopBooksCache.value.clear()
    lastFetchTime.value.clear()
    currentAuthor.value = null
  }

  return {
    // State
    authors,
    authorBooks,
    isLoading,
    lastFetchTime,
    currentAuthor,

    // Computed
    hasData,
    currentAuthorSlug,

    // Actions
    fetchAuthor,
    fetchAuthorBooks,
    fetchAuthorBooksPage,
    fetchAuthorQuote,
    fetchAuthorTopBooks,
    fetchAuthorStats,
    cacheAuthor,
    getAuthor,
    hasAuthor,
    refresh,
    clearCache,
  }
})
