import type {
  AvailableCategoriesResponse,
  CategoryInfo,
  HomePageResponse,
  RecommendationListResponse,
  RecommendationSection,
} from '~/types/recommendations'
import { defineStore } from 'pinia'

export const useRecommendationsStore = defineStore('recommendations', () => {
  const apiStore = useApiStore()

  // State
  const homeCategories = ref<RecommendationSection[]>([])
  const categoryData = ref(new Map<string, RecommendationSection>())
  const availableCategories = ref<CategoryInfo[]>([])
  const bookRecommendations = ref(new Map<number, RecommendationSection[]>())
  const authorRecommendations = ref(new Map<number, RecommendationSection[]>())
  const lastFetchTime = ref(new Map<string, number>())
  const isLoading = ref(false)
  const isLoadingCategory = ref(false)
  const isLoadingBookRecs = ref(false)
  const isLoadingAuthorRecs = ref(false)

  // Cache TTL — 5 minutes
  const CACHE_TTL = 5 * 60 * 1000

  // Computed
  const hasHomeData = computed(() => homeCategories.value.length > 0)

  function isCacheFresh(key: string) {
    const timestamp = lastFetchTime.value.get(key)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // Fetch all home page recommendations
  async function fetchHomeRecommendations(force = false) {
    if (!force && hasHomeData.value && isCacheFresh('home'))
      return homeCategories.value

    isLoading.value = true
    try {
      const response = await apiStore.client.get<HomePageResponse>(
        '/api/v1/recommendations/home',
        { params: { items_per_category: 10 } },
      )
      homeCategories.value = response.data.data!.sections
      lastFetchTime.value.set('home', Date.now())

      return homeCategories.value
    }
    catch (error) {
      console.error('Error fetching home recommendations:', error)
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // Fetch recommendations for a specific category (with pagination)
  async function fetchCategoryRecommendations(
    category: string,
    limit = 20,
    offset = 0,
    force = false,
  ) {
    const cacheKey = `${category}-${offset}`

    if (!force && categoryData.value.has(cacheKey) && isCacheFresh(cacheKey))
      return categoryData.value.get(cacheKey)!

    isLoadingCategory.value = true
    try {
      const response = await apiStore.client.get<RecommendationListResponse>(
        `/api/v1/recommendations/${category}`,
        { params: { limit, offset } },
      )
      const data = response.data.data!
      categoryData.value.set(cacheKey, data)
      lastFetchTime.value.set(cacheKey, Date.now())

      return data
    }
    catch (error) {
      console.error(`Error fetching recommendations for category "${category}":`, error)
      throw error
    }
    finally {
      isLoadingCategory.value = false
    }
  }

  // Fetch available categories list
  async function fetchAvailableCategories(force = false) {
    if (!force && availableCategories.value.length > 0 && isCacheFresh('categories'))
      return availableCategories.value

    try {
      const response = await apiStore.client.get<AvailableCategoriesResponse>(
        '/api/v1/recommendations/categories',
      )
      availableCategories.value = response.data.data!.categories
      lastFetchTime.value.set('categories', Date.now())

      return availableCategories.value
    }
    catch (error) {
      console.error('Error fetching available categories:', error)
      throw error
    }
  }

  // Fetch recommendations for a specific book
  async function fetchBookRecommendations(bookId: number, force = false) {
    const cacheKey = `book-${bookId}`

    if (!force && bookRecommendations.value.has(bookId) && isCacheFresh(cacheKey))
      return bookRecommendations.value.get(bookId)!

    isLoadingBookRecs.value = true
    try {
      const response = await apiStore.client.get<HomePageResponse>(
        `/api/v1/recommendations/book/${bookId}`,
        { params: { items_per_category: 15 } },
      )
      console.log(response.data)
      const categories = response.data.data!.sections
      bookRecommendations.value.set(bookId, categories)
      lastFetchTime.value.set(cacheKey, Date.now())

      return categories
    }
    catch (error) {
      console.error(`Error fetching book recommendations for book ${bookId}:`, error)

      return []
    }
    finally {
      isLoadingBookRecs.value = false
    }
  }

  // Fetch recommendations for a specific author
  async function fetchAuthorRecommendations(authorId: number, force = false) {
    const cacheKey = `author-${authorId}`

    if (!force && authorRecommendations.value.has(authorId) && isCacheFresh(cacheKey))
      return authorRecommendations.value.get(authorId)!

    isLoadingAuthorRecs.value = true
    try {
      const response = await apiStore.client.get<HomePageResponse>(
        `/api/v1/recommendations/author/${authorId}`,
        { params: { items_per_category: 15 } },
      )
      console.log(response.data)
      const categories = response.data.data!.sections
      authorRecommendations.value.set(authorId, categories)
      lastFetchTime.value.set(cacheKey, Date.now())

      return categories
    }
    catch (error) {
      console.error(`Error fetching author recommendations for author ${authorId}:`, error)

      return []
    }
    finally {
      isLoadingAuthorRecs.value = false
    }
  }

  // Find display name for a category key (from home data or available categories)
  function getCategoryDisplayName(category: string) {
    const fromHome = homeCategories.value.find(c => c.key === category)
    if (fromHome)
      return fromHome.display_name

    const fromAvailable = availableCategories.value.find(c => c.category === category)

    return fromAvailable?.display_name ?? category
  }

  // Clear cache
  function clearCache() {
    homeCategories.value = []
    categoryData.value.clear()
    availableCategories.value = []
    lastFetchTime.value.clear()
  }

  return {
    // State
    homeCategories,
    categoryData,
    availableCategories,
    bookRecommendations,
    authorRecommendations,
    isLoading,
    isLoadingCategory,
    isLoadingBookRecs,
    isLoadingAuthorRecs,

    // Computed
    hasHomeData,

    // Actions
    fetchHomeRecommendations,
    fetchCategoryRecommendations,
    fetchBookRecommendations,
    fetchAuthorRecommendations,
    fetchAvailableCategories,
    getCategoryDisplayName,
    clearCache,
  }
})
