import type { SearchResponse, SearchResult } from '~/types/api'
import { defineStore } from 'pinia'

export const useQuickSearchStore = defineStore('quickSearch', () => {
  const apiStore = useApiStore()

  // State
  const results = ref<SearchResult[]>([])
  const isLoading = ref(false)
  const isEmpty = ref(false)
  const lastQuery = ref('')

  // Computed
  const hasResults = computed(() => results.value.length > 0)

  // Quick search function (no caching, always fresh)
  const search = async (query: string) => {
    if (!query.trim()) {
      clear()

      return
    }

    lastQuery.value = query
    isLoading.value = true
    isEmpty.value = false

    try {
      const response = await apiStore.client.get<SearchResponse>('/api/v1/search', {
        params: {
          q: query,
          type: 'all',
          limit: 20,
          offset: 0,
        },
      })
      results.value = response.data.data.results || []
      isEmpty.value = results.value.length === 0
    }
    catch (error) {
      console.error('Quick search error:', error)
      results.value = []
      isEmpty.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  // Clear search
  const clear = () => {
    results.value = []
    isLoading.value = false
    isEmpty.value = false
    lastQuery.value = ''
  }

  return {
    // State
    results,
    isLoading,
    isEmpty,
    lastQuery,

    // Computed
    hasResults,

    // Actions
    search,
    clear,
  }
})
