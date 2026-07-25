import type { APIResponse } from '~/types/api'
import type { CategoryBooksData, PopularCategory } from '~/types/categories'
import { defineStore } from 'pinia'

export const useCategoriesStore = defineStore('categories', () => {
  const apiStore = useApiStore()
  const { language } = useUserLanguage()

  // State
  const popularCategories = ref<PopularCategory[]>([])
  const isLoadingBooks = ref(false)
  const popularCategoriesLastFetch = ref(0)

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  const fetchPopularCategories = async (limit = 12, force = false): Promise<PopularCategory[]> => {
    const isFresh = popularCategoriesLastFetch.value && Date.now() - popularCategoriesLastFetch.value < CACHE_TTL
    if (!force && popularCategories.value.length > 0 && isFresh)
      return popularCategories.value

    try {
      const response = await apiStore.client.get<APIResponse<{ categories: PopularCategory[] }>>(
        '/api/v1/categories/popular',
        { params: { limit } },
      )
      popularCategories.value = response.data.data!.categories
      popularCategoriesLastFetch.value = Date.now()

      return popularCategories.value
    }
    catch (error) {
      console.error('Error fetching popular categories:', error)

      return []
    }
  }

  const fetchCategoryBooksPage = async (
    slug: string,
    sortBy: 'popularity' | 'rating' = 'popularity',
    order: 'asc' | 'desc' = 'desc',
    offset = 0,
    limit = 20,
  ): Promise<CategoryBooksData> => {
    isLoadingBooks.value = true

    try {
      const params: Record<string, any> = { limit, offset, sort_by: sortBy, order, language: language.value }

      const response = await apiStore.client.get<APIResponse<CategoryBooksData>>(
        `/api/v1/categories/${slug}/books`,
        { params },
      )

      const data = response.data.data!
      // Backend returns avg_rating/ol_avg_rating as strings — coerce to numbers
      data.books = data.books.map(book => ({
        ...book,
        avg_rating: Number(book.avg_rating),
        ol_avg_rating: Number(book.ol_avg_rating),
      }))

      return data
    }
    catch {
      return { books: [], total_count: 0 }
    }
    finally {
      isLoadingBooks.value = false
    }
  }

  return {
    popularCategories,
    isLoadingBooks,
    fetchPopularCategories,
    fetchCategoryBooksPage,
  }
})
