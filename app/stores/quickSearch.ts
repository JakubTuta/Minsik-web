import type { SuggestItem, SuggestResponse } from '~/types/api'
import { defineStore } from 'pinia'

export const useQuickSearchStore = defineStore('quickSearch', () => {
  const apiStore = useApiStore()
  const { language } = useUserLanguage()

  // State
  const results = ref<SuggestItem[]>([])
  const isLoading = ref(false)
  const isEmpty = ref(false)
  const lastQuery = ref('')

  // Computed
  const hasResults = computed(() => results.value.length > 0)

  // Guards against a slower earlier request (e.g. "hob") resolving after a
  // faster later one (e.g. "hobbit") and overwriting it with stale results.
  let requestToken = 0

  const clear = () => {
    requestToken++
    results.value = []
    isLoading.value = false
    isEmpty.value = false
    lastQuery.value = ''
  }

  const search = async (query: string) => {
    if (!query.trim()) {
      clear()

      return
    }

    const token = ++requestToken
    lastQuery.value = query
    isLoading.value = true
    isEmpty.value = false

    try {
      const response = await apiStore.client.get<SuggestResponse>('/api/v1/search/suggest', {
        params: {
          q: query,
          limit: 20,
          language: language.value,
        },
      })

      if (token !== requestToken)
        return

      results.value = response.data.data.items || []
      isEmpty.value = results.value.length === 0
    }
    catch (error) {
      if (token !== requestToken)
        return

      console.error('Quick search error:', error)
      results.value = []
      isEmpty.value = true
    }
    finally {
      if (token === requestToken)
        isLoading.value = false
    }
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
