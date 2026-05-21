import type { SuggestItem, SuggestResponse } from '~/types/api'
import { defineStore } from 'pinia'

export const useQuickSearchStore = defineStore('quickSearch', () => {
  const apiStore = useApiStore()

  // State
  const results = ref<SuggestItem[]>([])
  const isLoading = ref(false)
  const isEmpty = ref(false)
  const lastQuery = ref('')

  // Computed
  const hasResults = computed(() => results.value.length > 0)

  const search = async (query: string) => {
    if (!query.trim()) {
      clear()

      return
    }

    lastQuery.value = query
    isLoading.value = true
    isEmpty.value = false

    try {
      const response = await apiStore.client.get<SuggestResponse>('/api/v1/search/suggest', {
        params: {
          q: query,
          limit: 20,
        },
      })
      results.value = response.data.data.items || []
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
