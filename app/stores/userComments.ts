import type { APIResponse, PaginatedResponse } from '~/types/api'
import type { CommentEntry } from '~/types/user'
import { defineStore } from 'pinia'

export interface UserCommentsParams {
  sort_by?: 'created_at' | 'updated_at'
  order?: 'asc' | 'desc'
}

export const useUserCommentsStore = defineStore('userComments', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const items = ref<CommentEntry[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const currentParams = ref<UserCommentsParams>({})

  const hasMore = computed(() => items.value.length < total.value)
  const hasData = computed(() => items.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && items.value.length === 0)

  const LIMIT = 20

  const fetch = async (params: UserCommentsParams = {}, reset = true) => {
    if (isLoading.value)
      return

    if (reset) {
      items.value = []
      total.value = 0
    }

    currentParams.value = params
    isLoading.value = true

    try {
      const offset = reset
        ? 0
        : items.value.length
      const response = await client.value.get<APIResponse<PaginatedResponse<CommentEntry>>>(
        '/api/v1/users/me/comments',
        { params: { ...params, limit: LIMIT, offset } },
      )

      const data = response.data.data!
      items.value = [...items.value, ...data.items]
      total.value = data.total
    }
    catch (error) {
      console.error('Failed to fetch comments:', error)
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
