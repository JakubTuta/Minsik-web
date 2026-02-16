import type { APIResponse, PaginatedResponse } from '~/types/api'
import type { BookshelfEntry, BookshelfStatus } from '~/types/user'
import { defineStore } from 'pinia'

export interface BookshelfParams {
  status?: BookshelfStatus | null
  sort_by?: 'created_at' | 'updated_at' | 'book_title'
  order?: 'asc' | 'desc'
}

export const useBookshelfStore = defineStore('bookshelf', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  // My bookshelf state
  const myItems = ref<BookshelfEntry[]>([])
  const myTotal = ref(0)
  const myIsLoading = ref(false)
  const myCurrentParams = ref<BookshelfParams>({})

  const myHasMore = computed(() => myItems.value.length < myTotal.value)
  const myHasData = computed(() => myItems.value.length > 0)
  const myIsEmpty = computed(() => !myIsLoading.value && myItems.value.length === 0)

  // Public user bookshelf state
  const publicItems = ref<BookshelfEntry[]>([])
  const publicTotal = ref(0)
  const publicIsLoading = ref(false)
  const publicCurrentUsername = ref<string | null>(null)
  const publicCurrentParams = ref<BookshelfParams>({})

  const publicHasMore = computed(() => publicItems.value.length < publicTotal.value)
  const publicHasData = computed(() => publicItems.value.length > 0)
  const publicIsEmpty = computed(() => !publicIsLoading.value && publicItems.value.length === 0)

  const LIMIT = 20

  // My bookshelf
  const fetchMine = async (params: BookshelfParams = {}, reset = true) => {
    if (myIsLoading.value)
      return

    if (reset) {
      myItems.value = []
      myTotal.value = 0
    }

    myCurrentParams.value = params
    myIsLoading.value = true

    try {
      const offset = reset
        ? 0
        : myItems.value.length
      const response = await client.value.get<APIResponse<PaginatedResponse<BookshelfEntry>>>(
        '/api/v1/users/me/bookshelves',
        { params: { ...params, limit: LIMIT, offset } },
      )

      const data = response.data.data!
      myItems.value = [...myItems.value, ...data.items]
      myTotal.value = data.total
    }
    catch (error) {
      console.error('Failed to fetch bookshelf:', error)
    }
    finally {
      myIsLoading.value = false
    }
  }

  const loadMoreMine = async () => {
    if (!myHasMore.value || myIsLoading.value)
      return
    await fetchMine(myCurrentParams.value, false)
  }

  // Public user bookshelf
  const fetchByUsername = async (username: string, params: BookshelfParams = {}, reset = true) => {
    if (publicIsLoading.value)
      return

    if (reset) {
      publicItems.value = []
      publicTotal.value = 0
      publicCurrentUsername.value = username
    }

    publicCurrentParams.value = params
    publicIsLoading.value = true

    try {
      const offset = reset
        ? 0
        : publicItems.value.length
      const response = await client.value.get<APIResponse<PaginatedResponse<BookshelfEntry>>>(
        `/api/v1/users/${username}/bookshelves`,
        { params: { ...params, limit: LIMIT, offset } },
      )

      const data = response.data.data!
      publicItems.value = [...publicItems.value, ...data.items]
      publicTotal.value = data.total
    }
    catch (error) {
      console.error('Failed to fetch public bookshelf:', error)
    }
    finally {
      publicIsLoading.value = false
    }
  }

  const loadMoreByUsername = async (username: string) => {
    if (!publicHasMore.value || publicIsLoading.value)
      return
    await fetchByUsername(username, publicCurrentParams.value, false)
  }

  return {
    // My bookshelf
    myItems,
    myTotal,
    myIsLoading,
    myHasMore,
    myHasData,
    myIsEmpty,
    fetchMine,
    loadMoreMine,
    // Public bookshelf
    publicItems,
    publicTotal,
    publicIsLoading,
    publicCurrentUsername,
    publicHasMore,
    publicHasData,
    publicIsEmpty,
    fetchByUsername,
    loadMoreByUsername,
  }
})
