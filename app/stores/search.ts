import type { SearchResponse, SearchResult, SearchType } from '~/types/api'
import { defineStore } from 'pinia'
import { dedupByWork } from '~/utils/dedupResults'

export const useSearchStore = defineStore('search', () => {
  const apiStore = useApiStore()
  const { language } = useUserLanguage()

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

  // Identity -> index in `results.value`, so appending a page can dedupe
  // against everything shown so far in O(page size) instead of re-running
  // dedupByWork over the whole accumulated list on every page (O(n) work
  // repeated per page -> O(n^2) over a long infinite-scroll session).
  const resultIndex = new Map<string, number>()

  function resultKey(item: SearchResult): string {
    const identity = item.type === 'book'
      ? (item.work_id || item.slug)
      : item.slug

    return `${item.type}:${identity}`
  }

  // Same tie-break as dedupByWork: an edition in the preferred language wins
  // outright; otherwise the one with more readers wins.
  function mergeResults(newItems: SearchResult[]) {
    for (const item of dedupByWork(newItems, language.value)) {
      const key = resultKey(item)
      const existingIdx = resultIndex.get(key)

      if (existingIdx === undefined) {
        resultIndex.set(key, results.value.length)
        results.value.push(item)
        continue
      }

      const existing = results.value[existingIdx]!
      const isPreferred = item.language === language.value
      const existingIsPreferred = existing.language === language.value
      const shouldReplace = (isPreferred && !existingIsPreferred)
        || (!existingIsPreferred && !isPreferred && item.readers > existing.readers)

      if (shouldReplace)
        results.value[existingIdx] = item
    }
  }

  // Computed
  const hasData = computed(() => results.value.length > 0)
  const hasMore = computed(() => results.value.length < total.value)
  const isEmpty = computed(() => !isLoading.value && !hasData.value && query.value.length > 0)

  // Clear search
  const clear = () => {
    query.value = ''
    results.value = []
    resultIndex.clear()
    offset.value = 0
    total.value = 0
    isLoading.value = false
  }

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

  // Search function — extracted from the debounce wrapper so a deep link
  // with a query already in the URL (see `search` below) can fetch
  // immediately instead of paying the 300ms debounce meant for live typing.
  const performSearch = async (force = false) => {
    if (!query.value.trim()) {
      clear()
      isLoading.value = false

      return
    }

    const cacheKey = getCacheKey(query.value, type.value, offset.value)

    // Check cache
    if (!force && isCacheFresh(cacheKey)) {
      const cached = cache.get(cacheKey)!
      if (offset.value === 0) {
        results.value = []
        resultIndex.clear()
        mergeResults(cached.data)
      }
      else {
        mergeResults(cached.data)
      }
      total.value = cached.total
      isLoading.value = false

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
          language: language.value,
        },
      })

      const searchData = response.data.data
      const newResults = dedupByWork(searchData.results || [], language.value)

      // Update cache
      cache.set(cacheKey, {
        data: newResults,
        timestamp: Date.now(),
        total: searchData.total_count || 0,
      })

      // Append or replace results
      if (offset.value === 0) {
        results.value = []
        resultIndex.clear()
      }
      mergeResults(newResults)

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
  }

  const searchDebounced = useDebounceFn(performSearch, 300)

  // Main search method. `immediate` skips the debounce — for a deep link
  // whose query is already known on page load, there's no typing to debounce
  // against, and waiting 300ms just delays the first paint of results.
  const search = async (force = false, immediate = false) => {
    if (immediate)
      await performSearch(force)
    else
      await searchDebounced(force)
  }

  // Refresh (force reload)
  const refresh = async () => {
    offset.value = 0
    results.value = []
    await search(true)
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

    // Only search if there's a query
    if (query.value.trim()) {
      search(true) // Force new search with the new type
    }
  }

  // Set query and trigger search
  const setQuery = (newQuery: string) => {
    query.value = newQuery
    offset.value = 0
    results.value = []
    total.value = 0

    if (newQuery.trim()) {
      isLoading.value = true // Set loading immediately only if there's a query
      search()
    }
    else {
      isLoading.value = false
    }
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
    clear,
    search,
    refresh,
    loadMore,
    setType,
    setQuery,
  }
})
