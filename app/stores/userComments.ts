import type { APIResponse, PaginatedResponse } from '~/types/api'
import type { CommentEntry } from '~/types/user'
import { defineStore } from 'pinia'

interface UpdateCommentResponse {
  comment_id: number
  body: string
  is_spoiler: boolean
  updated_at: string
}

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

  const hasMore = ref(false)
  const hasData = computed(() => items.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && items.value.length === 0)

  const LIMIT = 10

  const fetch = async (params: UserCommentsParams = {}, reset = true) => {
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
      const response = await client.value.get<APIResponse<PaginatedResponse<CommentEntry>>>(
        '/api/v1/users/me/comments',
        { params: { ...params, limit: LIMIT, offset } },
      )

      const data = response.data.data!
      const newItems = data.items
      items.value = [...items.value, ...newItems]
      total.value = data.total
      hasMore.value = data.has_more ?? (newItems.length >= LIMIT)
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

  const updateComment = async (slug: string, commentId: number, body: string, isSpoiler: boolean) => {
    const response = await client.value.put<APIResponse<UpdateCommentResponse>>(
      `/api/v1/books/${slug}/comments/${commentId}`,
      { body, is_spoiler: isSpoiler },
    )
    const updated = response.data.data!
    const idx = items.value.findIndex(e => e.comment_id === commentId)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], body: updated.body, is_spoiler: updated.is_spoiler, updated_at: updated.updated_at }
    }
  }

  const deleteComment = async (slug: string, commentId: number) => {
    await client.value.delete(`/api/v1/books/${slug}/comments/${commentId}`)
    items.value = items.value.filter(e => e.comment_id !== commentId)
    total.value = Math.max(0, total.value - 1)
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
    updateComment,
    deleteComment,
  }
})
