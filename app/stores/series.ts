import type { APIResponse, BookSummary, Series, SeriesBooksResponse } from '~/types/api'
import { defineStore } from 'pinia'

export const useSeriesStore = defineStore('series', () => {
  const apiStore = useApiStore()
  const { language } = useUserLanguage()

  // State
  const series = ref(new Map<string, Series>())
  const seriesBooks = ref(new Map<string, BookSummary[]>())
  const isLoading = ref(false)
  const lastFetchTime = ref(new Map<string, number>())
  const currentSeries = ref<Series | null>(null)

  // Cache TTL
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Language is part of every cache key: a series is a different per-language
  // record with its own book list.
  const cacheKey = (...parts: string[]) => [language.value, ...parts].join(':')

  // Computed
  const hasData = computed(() => series.value.size > 0)
  const currentSeriesSlug = computed(() => currentSeries.value?.slug || null)

  const hasSeries = (slug: string) => {
    return series.value.has(cacheKey(slug))
  }

  const isCacheFresh = (key: string) => {
    const timestamp = lastFetchTime.value.get(key)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

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

    try {
      const response = await apiStore.client.get<APIResponse<SeriesBooksResponse>>(`/api/v1/series/${slug}/books`, {
        params: {
          limit: 100, // API maximum limit
          offset: 0,
          language: language.value,
        },
      })

      const books = response.data.data?.books || []

      seriesBooks.value.set(key, books)
      lastFetchTime.value.set(key, Date.now())

      return books
    }
    catch {
      return []
    }
  }

  const cacheSeries = (seriesData: Series) => {
    series.value.set(cacheKey(seriesData.slug), seriesData)
    lastFetchTime.value.set(cacheKey(seriesData.slug), Date.now())
  }

  const getSeries = (slug: string) => {
    return series.value.get(cacheKey(slug)) || null
  }

  const refresh = async () => {
    if (!currentSeries.value)
      return
    await fetchSeries(currentSeries.value.slug, true)
    await fetchSeriesBooks(currentSeries.value.slug, true)
  }

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
    lastFetchTime,
    currentSeries,

    // Computed
    hasData,
    currentSeriesSlug,

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
