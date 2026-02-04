import type { Book, PaginatedResponse, Series } from '~/types/api'
import { defineStore } from 'pinia'

export const useSeriesStore = defineStore('series', () => {
  const apiStore = useApiStore()

  // State
  const series = ref(new Map<string, Series>())
  const seriesBooks = ref(new Map<string, Book[]>())
  const isLoading = ref(false)
  const isLoadingBooks = ref(false)
  const lastFetchTime = ref(new Map<string, number>())
  const currentSeries = ref<Series | null>(null)

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasData = computed(() => series.value.size > 0)
  const currentSeriesSlug = computed(() => currentSeries.value?.slug || null)
  const currentSeriesBooks = computed(() => (currentSeries.value
    ? seriesBooks.value.get(currentSeries.value.slug) || []
    : []),
  )

  // Check if series exists in cache
  const hasSeries = (slug: string) => {
    return series.value.has(slug)
  }

  // Check if cached data is fresh
  const isCacheFresh = (slug: string) => {
    const timestamp = lastFetchTime.value.get(slug)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // Fetch series details
  const fetchSeries = async (slug: string, force = false) => {
    if (!force && hasSeries(slug) && isCacheFresh(slug)) {
      currentSeries.value = series.value.get(slug)!

      return currentSeries.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get<Series>(`/api/v1/series/${slug}`)
      const seriesData = response.data

      // Cache the series
      series.value.set(slug, seriesData)
      lastFetchTime.value.set(slug, Date.now())
      currentSeries.value = seriesData

      return seriesData
    }
    catch (error) {
      console.error('Error fetching series:', error)
      currentSeries.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // Fetch ALL series books (load all at once, sorted by position)
  const fetchSeriesBooks = async (slug: string, force = false) => {
    const cacheKey = `${slug}_books`

    if (!force && seriesBooks.value.has(slug) && isCacheFresh(cacheKey)) {
      return seriesBooks.value.get(slug)!
    }

    isLoadingBooks.value = true

    try {
      // Fetch with large limit to get all books at once
      const response = await apiStore.client.get<PaginatedResponse<Book>>(`/api/v1/series/${slug}/books`, {
        params: {
          limit: 1000, // Large enough to get all books
          offset: 0,
        },
      })

      const books = response.data.items || []

      // Cache the books
      seriesBooks.value.set(slug, books)
      lastFetchTime.value.set(cacheKey, Date.now())

      return books
    }
    catch (error) {
      console.error('Error fetching series books:', error)

      return []
    }
    finally {
      isLoadingBooks.value = false
    }
  }

  // Cache a series
  const cacheSeries = (seriesData: Series) => {
    series.value.set(seriesData.slug, seriesData)
    lastFetchTime.value.set(seriesData.slug, Date.now())
  }

  // Get series from cache
  const getSeries = (slug: string) => {
    return series.value.get(slug) || null
  }

  // Refresh current series
  const refresh = async () => {
    if (!currentSeries.value)
      return
    await fetchSeries(currentSeries.value.slug, true)
    await fetchSeriesBooks(currentSeries.value.slug, true)
  }

  // Clear cache
  const clearCache = () => {
    series.value.clear()
    seriesBooks.value.clear()
    lastFetchTime.value.clear()
    currentSeries.value = null
  }

  return {
    // State
    series,
    seriesBooks,
    isLoading,
    isLoadingBooks,
    lastFetchTime,
    currentSeries,

    // Computed
    hasData,
    currentSeriesSlug,
    currentSeriesBooks,

    // Actions
    fetchSeries,
    fetchSeriesBooks,
    cacheSeries,
    getSeries,
    hasSeries,
    refresh,
    clearCache,
  }
})
