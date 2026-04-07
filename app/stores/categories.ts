import type { APIResponse } from '~/types/api'
import type { Category, CategoryBooksData } from '~/types/categories'
import { defineStore } from 'pinia'

export const useCategoriesStore = defineStore('categories', () => {
  const apiStore = useApiStore()

  // State
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const isLoadingBooks = ref(false)
  const categoriesLastFetch = ref(0)

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasCategories = computed(() => categories.value.length > 0)

  const isCacheFresh = () => {
    if (!categoriesLastFetch.value)
      return false
    return Date.now() - categoriesLastFetch.value < CACHE_TTL
  }

  const getCategoryBySlug = (slug: string) => {
    return categories.value.find(c => c.slug === slug) ?? null
  }

  const fetchCategories = async (force = false): Promise<Category[]> => {
    if (!force && hasCategories.value && isCacheFresh()) {
      return categories.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get<APIResponse<{ categories: Category[] }>>('/api/v1/categories')
      categories.value = response.data.data!.categories
      categoriesLastFetch.value = Date.now()
      return categories.value
    }
    catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    finally {
      isLoading.value = false
    }
  }

  const fetchCategoryBooksPage = async (
    slug: string,
    subGenre?: string | null,
    sortBy: 'popularity' | 'rating' = 'popularity',
    order: 'asc' | 'desc' = 'desc',
    offset = 0,
    limit = 20,
  ): Promise<CategoryBooksData> => {
    isLoadingBooks.value = true

    try {
      const params: Record<string, any> = { limit, offset, sort_by: sortBy, order }
      if (subGenre)
        params.sub_genre = subGenre

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
    categories,
    isLoading,
    isLoadingBooks,
    hasCategories,
    fetchCategories,
    fetchCategoryBooksPage,
    getCategoryBySlug,
  }
})
