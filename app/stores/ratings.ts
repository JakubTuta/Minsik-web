import type { APIResponse, PaginatedResponse } from '~/types/api'
import type { RatingEntry } from '~/types/user'
import { defineStore } from 'pinia'

export interface RatingsParams {
  sort_by?: 'created_at' | 'overall_rating'
  order?: 'asc' | 'desc'
  min_rating?: number | null
  max_rating?: number | null
}

export const useRatingsStore = defineStore('ratings', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const items = ref<RatingEntry[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const currentParams = ref<RatingsParams>({})

  const hasMore = ref(false)
  const hasData = computed(() => items.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && items.value.length === 0)

  const LIMIT = 10

  const fetch = async (params: RatingsParams = {}, reset = true) => {
    if (isLoading.value)
      return

    if (reset) {
      items.value = []
      total.value = 0
      hasMore.value = false
    }

    currentParams.value = params
    isLoading.value = true

    try {
      const offset = reset
        ? 0
        : items.value.length
      const cleanParams = Object.fromEntries(
        Object.entries({ ...params, limit: LIMIT, offset }).filter(([, v]) => v != null),
      )
      const response = await client.value.get<APIResponse<PaginatedResponse<RatingEntry>>>(
        '/api/v1/users/me/ratings',
        { params: cleanParams },
      )

      const data = response.data.data!
      const newItems = data.items
      items.value = [...items.value, ...newItems]
      total.value = data.total
      hasMore.value = data.has_more ?? (newItems.length >= LIMIT)
    }
    catch (error) {
      console.error('Failed to fetch ratings:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const loadMore = async () => {
    if (!hasMore.value || isLoading.value)
      return
    await fetch(currentParams.value, false)
  }

  return {
    items,
    total,
    isLoading,
    currentParams,
    hasMore,
    hasData,
    isEmpty,
    fetch,
    loadMore,
  }
})
