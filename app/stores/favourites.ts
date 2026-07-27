import type { APIResponse, PaginatedResponse } from '~/types/api'
import type { FavouriteEntry } from '~/types/user'
import { defineStore } from 'pinia'

export const useFavouritesStore = defineStore('favourites', () => {
  const { t } = useI18n()
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const items = ref<FavouriteEntry[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const currentSortBy = ref<string>('created_at')
  const currentOrder = ref<'asc' | 'desc'>('desc')
  const error = ref<string | null>(null)

  const hasMore = ref(false)
  const hasData = computed(() => items.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && !error.value && items.value.length === 0)

  const LIMIT = 10

  const fetch = async (reset = true, sortBy: string = currentSortBy.value, order: 'asc' | 'desc' = currentOrder.value) => {
    if (isLoading.value)
      return

    if (reset) {
      items.value = []
      total.value = 0
      hasMore.value = false
      currentSortBy.value = sortBy
      currentOrder.value = order
    }

    isLoading.value = true
    error.value = null

    try {
      const offset = reset
        ? 0
        : items.value.length
      const response = await client.value.get<APIResponse<PaginatedResponse<FavouriteEntry>>>(
        '/api/v1/users/me/favourites',
        { params: { limit: LIMIT, offset, sort_by: currentSortBy.value, order: currentOrder.value } },
      )

      const data = response.data.data!
      const newItems = data.items
      items.value = [...items.value, ...newItems]
      total.value = data.total
      hasMore.value = data.has_more ?? (newItems.length >= LIMIT)
    }
    catch (err) {
      console.error('Failed to fetch favourites:', err)
      error.value = t('storeErrors.favouritesLoadFailed')
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

  const removeFavourite = async (slug: string) => {
    try {
      await client.value.delete(`/api/v1/books/${slug}/favourite`)
      const idx = items.value.findIndex(item => item.book_slug === slug)
      if (idx !== -1) {
        items.value.splice(idx, 1)
        total.value--
      }
    }
    catch (err) {
      console.error('Failed to remove favourite:', err)
      useToastStore().error(t('storeErrors.favouriteRemoveFailed'))
      throw err
    }
  }

  return {
    items,
    total,
    isLoading,
    hasMore,
    hasData,
    isEmpty,
    error,
    fetch,
    loadMore,
    removeFavourite,
  }
})
