import type { APIResponse, BookSummary, Series, SeriesBooksResponse } from '~/types/api'
import { defineStore } from 'pinia'

export const useSeriesStore = defineStore('series', () => {
  const apiStore = useApiStore()
  const { language } = useUserLanguage()

  // State
  const series = ref(new Map<string, Series>())
  const seriesBooks = ref(new Map<string, BookSummary[]>())
  const isLoading = ref(false)
  const isLoadingBooks = ref(false)
  const lastFetchTime = ref(new Map<string, number>())
  const currentSeries = ref<Series | null>(null)

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * The reader's language is part of every cache key: a series resolves to a
   * different per-language record with its own book list, so a language switch
   * has to miss the cache rather than keep serving the previous language.
   */
  const cacheKey = (...parts: string[]) => [language.value, ...parts].join(':')

  // Computed
  const hasData = computed(() => series.value.size > 0)
  const currentSeriesSlug = computed(() => currentSeries.value?.slug || null)
  const currentSeriesBooks = computed(() => (currentSeries.value
    ? seriesBooks.value.get(cacheKey(currentSeries.value.slug)) || []
    : []),
  )

  // Check if series exists in cache
  const hasSeries = (slug: string) => {
    return series.value.has(cacheKey(slug))
  }

  // Check if cached data is fresh
  const isCacheFresh = (key: string) => {
    const timestamp = lastFetchTime.value.get(key)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // Fetch series details
  const fetchSeries = async (slug: string, force = false) => {
    const key = cacheKey(slug)

    if (!force && hasSeries(slug) && isCacheFresh(key)) {
      currentSeries.value = series.value.get(key)!

      return currentSeries.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get<APIResponse<Series>>(`/api/v1/series/${slug}`, {
        params: { language: language.value },
      })
      const seriesData = response.data.data!

      // Cache the series
      series.value.set(key, seriesData)
      lastFetchTime.value.set(key, Date.now())
      currentSeries.value = seriesData

      return seriesData
    }
    catch (error) {
      currentSeries.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // Fetch ALL series books (load all at once, sorted by position)
  const fetchSeriesBooks = async (slug: string, force = false) => {
    const key = cacheKey(slug, 'books')

    if (!force && seriesBooks.value.has(key) && isCacheFresh(key)) {
      return seriesBooks.value.get(key)!
    }

    isLoadingBooks.value = true

    try {
      // Fetch with max allowed limit
      const response = await apiStore.client.get<APIResponse<SeriesBooksResponse>>(`/api/v1/series/${slug}/books`, {
        params: {
          limit: 100, // API maximum limit
          offset: 0,
          language: language.value,
        },
      })

      const books = response.data.data?.books || []

      // Cache the books
      seriesBooks.value.set(key, books)
      lastFetchTime.value.set(key, Date.now())

      return books
    }
    catch {
      return []
    }
    finally {
      isLoadingBooks.value = false
    }
  }

  // Cache a series
  const cacheSeries = (seriesData: Series) => {
    series.value.set(cacheKey(seriesData.slug), seriesData)
    lastFetchTime.value.set(cacheKey(seriesData.slug), Date.now())
  }

  // Get series from cache
  const getSeries = (slug: string) => {
    return series.value.get(cacheKey(slug)) || null
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
