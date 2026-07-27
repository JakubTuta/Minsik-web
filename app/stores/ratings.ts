import type { APIResponse, PaginatedResponse } from '~/types/api'
import type { RatingEntry } from '~/types/user'
import { defineStore } from 'pinia'

interface UpsertRatingData {
  overall_rating: number
  review_text?: string | null
  pacing?: number | null
  emotional_impact?: number | null
  intellectual_depth?: number | null
  writing_quality?: number | null
  rereadability?: number | null
  readability?: number | null
  plot_complexity?: number | null
  humor?: number | null
}

export interface RatingsParams {
  sort_by?: 'created_at' | 'overall_rating'
  order?: 'asc' | 'desc'
  min_rating?: number | null
  max_rating?: number | null
}

export const useRatingsStore = defineStore('ratings', () => {
  const { t } = useI18n()
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const items = ref<RatingEntry[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const currentParams = ref<RatingsParams>({})
  const error = ref<string | null>(null)

  const hasMore = ref(false)
  const hasData = computed(() => items.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && !error.value && items.value.length === 0)

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
    error.value = null

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
    catch (err) {
      console.error('Failed to fetch ratings:', err)
      error.value = t('storeErrors.ratingsLoadFailed')
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

  const updateRating = async (slug: string, data: UpsertRatingData) => {
    await client.value.post(`/api/v1/books/${slug}/rate`, data)
    const idx = items.value.findIndex(e => e.book_slug === slug)
    if (idx !== -1)
      items.value[idx] = { ...items.value[idx], ...data }
    await useDashboardStore().fetchStats(true)
  }

  const deleteRating = async (slug: string) => {
    await client.value.delete(`/api/v1/books/${slug}/rate`)
    const idx = items.value.findIndex(e => e.book_slug === slug)
    if (idx !== -1) {
      items.value.splice(idx, 1)
      total.value = Math.max(0, total.value - 1)
    }
    await useDashboardStore().fetchStats(true)
  }

  return {
    items,
    total,
    isLoading,
    currentParams,
    hasMore,
    hasData,
    isEmpty,
    error,
    fetch,
    loadMore,
    updateRating,
    deleteRating,
  }
})
