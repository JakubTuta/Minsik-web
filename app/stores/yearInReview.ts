import type { APIResponse } from '~/types/api'
import type { YearInReview } from '~/types/yearInReview'
import { defineStore } from 'pinia'

const CACHE_TTL_MS = 5 * 60 * 1000

export const useYearInReviewStore = defineStore('yearInReview', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const review = ref<YearInReview | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref(0)

  const isStale = computed(() => Date.now() - lastFetchedAt.value > CACHE_TTL_MS)

  const fetch = async (force = false) => {
    if (isLoading.value)
      return
    if (review.value && !isStale.value && !force)
      return

    isLoading.value = true
    error.value = null
    try {
      const response = await client.value.get<APIResponse<{ review: YearInReview }>>(
        '/api/v1/users/me/year-in-review',
      )
      review.value = response.data.data!.review
      lastFetchedAt.value = Date.now()
    }
    catch (err) {
      console.error('Failed to fetch year in review:', err)
      error.value = 'Could not load your year in review.'
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    review,
    isLoading,
    error,
    fetch,
  }
})
