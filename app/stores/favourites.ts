import type { APIResponse, PaginatedResponse } from '~/types/api'
import type { FavouriteEntry } from '~/types/user'
import { defineStore } from 'pinia'

export const useFavouritesStore = defineStore('favourites', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const items = ref<FavouriteEntry[]>([])
  const total = ref(0)
  const isLoading = ref(false)

  const hasMore = computed(() => items.value.length < total.value)
  const hasData = computed(() => items.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && items.value.length === 0)

  const LIMIT = 20

  const fetch = async (reset = true) => {
    if (isLoading.value)
      return

    if (reset) {
      items.value = []
      total.value = 0
    }

    isLoading.value = true

    try {
      const offset = reset
        ? 0
        : items.value.length
      const response = await client.value.get<APIResponse<PaginatedResponse<FavouriteEntry>>>(
        '/api/v1/users/me/favourites',
        { params: { limit: LIMIT, offset } },
      )

      const data = response.data.data!
      items.value = [...items.value, ...data.items]
      total.value = data.total
    }
    catch (error) {
      console.error('Failed to fetch favourites:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const loadMore = async () => {
    if (!hasMore.value || isLoading.value)
      return
    await fetch(false)
  }

  return {
    items,
    total,
    isLoading,
    hasMore,
    hasData,
    isEmpty,
    fetch,
    loadMore,
  }
})
