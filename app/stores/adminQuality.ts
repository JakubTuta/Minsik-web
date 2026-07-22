import type { AuditAuthorItem, AuditAuthorsFilters, AuditBookItem, AuditBooksFilters, AuditSeriesFilters, AuditSeriesItem } from '~/types/admin'
import type { APIResponse } from '~/types/api'
import { defineStore } from 'pinia'

export const useAdminQualityStore = defineStore('adminQuality', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const books = ref<AuditBookItem[]>([])
  const authors = ref<AuditAuthorItem[]>([])
  const series = ref<AuditSeriesItem[]>([])

  const isBooksLoading = ref(false)
  const isAuthorsLoading = ref(false)
  const isSeriesLoading = ref(false)

  const errors = ref<Record<string, string>>({})

  const fetchBooks = async (filters: AuditBooksFilters = {}) => {
    isBooksLoading.value = true
    try {
      const response = await client.value.get<APIResponse<{ items: AuditBookItem[] }>>(
        '/api/v1/admin/quality/books',
        {
          params: {
            limit: filters.limit,
            max_authors: filters.maxAuthors,
            max_genres: filters.maxGenres,
            language: filters.language || undefined,
          },
        },
      )
      books.value = response.data.data!.items
      errors.value.books = ''
    }
    catch (error: any) {
      console.error('Failed to fetch low-quality books:', error)
      errors.value.books = error.response?.data?.error?.message || 'Failed to load low-quality books'
    }
    finally {
      isBooksLoading.value = false
    }
  }

  const fetchAuthors = async (filters: AuditAuthorsFilters = {}) => {
    isAuthorsLoading.value = true
    try {
      const response = await client.value.get<APIResponse<{ items: AuditAuthorItem[] }>>(
        '/api/v1/admin/quality/authors',
        {
          params: {
            limit: filters.limit,
            min_books: filters.minBooks,
            max_books: filters.maxBooks,
          },
        },
      )
      authors.value = response.data.data!.items
      errors.value.authors = ''
    }
    catch (error: any) {
      console.error('Failed to fetch low-quality authors:', error)
      errors.value.authors = error.response?.data?.error?.message || 'Failed to load low-quality authors'
    }
    finally {
      isAuthorsLoading.value = false
    }
  }

  const fetchSeries = async (filters: AuditSeriesFilters = {}) => {
    isSeriesLoading.value = true
    try {
      const response = await client.value.get<APIResponse<{ items: AuditSeriesItem[] }>>(
        '/api/v1/admin/quality/series',
        {
          params: {
            limit: filters.limit,
            min_books: filters.minBooks,
            max_books: filters.maxBooks,
            language: filters.language || undefined,
          },
        },
      )
      series.value = response.data.data!.items
      errors.value.series = ''
    }
    catch (error: any) {
      console.error('Failed to fetch low-quality series:', error)
      errors.value.series = error.response?.data?.error?.message || 'Failed to load low-quality series'
    }
    finally {
      isSeriesLoading.value = false
    }
  }

  return {
    books,
    authors,
    series,
    isBooksLoading,
    isAuthorsLoading,
    isSeriesLoading,
    errors,
    fetchBooks,
    fetchAuthors,
    fetchSeries,
  }
})
