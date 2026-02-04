import type { SearchResponse, SearchResult, SearchType } from '~/types/api'
import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', () => {
  const apiStore = useApiStore()

  // State
  const query = ref('')
  const type = ref<SearchType>('all')
  const results = ref<SearchResult[]>([])
  const isLoading = ref(false)
  const lastFetchTime = ref<number>(0)
  const total = ref(0)
  const limit = ref(20)
  const offset = ref(0)

  // Cache with TTL
  const cache = new Map<string, { data: SearchResult[], timestamp: number, total: number }>()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasData = computed(() => results.value.length > 0)
  const hasMore = computed(() => results.value.length < total.value)
  const isEmpty = computed(() => !isLoading.value && !hasData.value && query.value.length > 0)

  // Generate cache key
  const getCacheKey = (q: string, t: SearchType, off: number) => {
    return `${q}_${t}_${off}`
  }

  // Check if cache is fresh
  const isCacheFresh = (key: string) => {
    const cached = cache.get(key)
    if (!cached)
      return false

    return Date.now() - cached.timestamp < CACHE_TTL
  }

  // Search function with debouncing
  const searchDebounced = useDebounceFn(async (force = false) => {
    if (!query.value.trim()) {
      clear()

      return
    }

    const cacheKey = getCacheKey(query.value, type.value, offset.value)

    // Check cache
    if (!force && isCacheFresh(cacheKey)) {
      const cached = cache.get(cacheKey)!
      if (offset.value === 0) {
        results.value = cached.data
      }
      else {
        results.value = [...results.value, ...cached.data]
      }
      total.value = cached.total

      return
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get<SearchResponse>('/api/v1/search', {
        params: {
          q: query.value,
          type: type.value,
          limit: limit.value,
          offset: offset.value,
        },
      })

      const searchData = response.data.data
      const newResults = searchData.results || []

      // Update cache
      cache.set(cacheKey, {
        data: newResults,
        timestamp: Date.now(),
        total: searchData.total_count || 0,
      })

      // Append or replace results
      if (offset.value === 0) {
        results.value = newResults
      }
      else {
        results.value = [...results.value, ...newResults]
      }

      total.value = searchData.total_count || 0
      lastFetchTime.value = Date.now()
    }
    catch (error) {
      console.error('Search error:', error)
      if (offset.value === 0) {
        results.value = []
        total.value = 0
      }
    }
    finally {
      isLoading.value = false
    }
  }, 500) // 500ms debounce

  // Main search method
  const search = async (force = false) => {
    await searchDebounced(force)
  }

  // Load more for infinite scroll
  const loadMore = async () => {
    if (isLoading.value || !hasMore.value)
      return

    offset.value += limit.value
    await search()
  }

  // Change search type
  const setType = (newType: SearchType) => {
    type.value = newType
    offset.value = 0
    results.value = []
    search()
  }

  // Set query and trigger search
  const setQuery = (newQuery: string) => {
    query.value = newQuery
    offset.value = 0
    results.value = []
    total.value = 0
    isLoading.value = true // Set loading immediately
    search()
  }

  // Clear search
  const clear = () => {
    query.value = ''
    results.value = []
    offset.value = 0
    total.value = 0
  }

  // Refresh (force reload)
  const refresh = async () => {
    offset.value = 0
    results.value = []
    await search(true)
  }

  return {
    // State
    query,
    type,
    results,
    isLoading,
    lastFetchTime,
    total,
    limit,
    offset,

    // Computed
    hasData,
    hasMore,
    isEmpty,

    // Actions
    search,
    loadMore,
    setType,
    setQuery,
    clear,
    refresh,
  }
})
