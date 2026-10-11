import type { APIResponse, PaginatedResponse } from '~/types/api'
import type { BookshelfEntry, BookshelfStatus } from '~/types/user'
import { defineStore } from 'pinia'

export interface BookshelfParams {
  status?: BookshelfStatus | null
  sort_by?: 'created_at' | 'updated_at' | 'book_title'
  order?: 'asc' | 'desc'
}

export const useBookshelfStore = defineStore('bookshelf', () => {
  const { t } = useNuxtApp().$i18n
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  // My bookshelf state
  const myItems = ref<BookshelfEntry[]>([])
  const myTotal = ref(0)
  const myIsLoading = ref(false)
  const myHasMore = ref(false)
  const myCurrentParams = ref<BookshelfParams>({})
  const myError = ref<string | null>(null)

  const myHasData = computed(() => myItems.value.length > 0)
  const myIsEmpty = computed(() => !myIsLoading.value && !myError.value && myItems.value.length === 0)

  // Public user bookshelf state
  const publicItems = ref<BookshelfEntry[]>([])
  const publicTotal = ref(0)
  const publicIsLoading = ref(false)
  const publicHasMore = ref(false)
  const publicCurrentUsername = ref<string | null>(null)
  const publicCurrentParams = ref<BookshelfParams>({})
  const publicError = ref<string | null>(null)

  const publicHasData = computed(() => publicItems.value.length > 0)
  const publicIsEmpty = computed(() => !publicIsLoading.value && !publicError.value && publicItems.value.length === 0)

  const LIMIT = 10

  // A reset (new filter or sort) must win over whatever is still loading, not be dropped
  // because a request is in flight; each request then only applies its answer if it is the
  // latest. Only "load more" yields to a running request.
  let myRequest = 0
  let publicRequest = 0

  // My bookshelf
  const fetchMine = async (params: BookshelfParams = {}, reset = true) => {
    if (!reset && myIsLoading.value)
      return

    const request = ++myRequest

    if (reset) {
      myItems.value = []
      myTotal.value = 0
      myHasMore.value = false
    }

    myCurrentParams.value = params
    myIsLoading.value = true
    myError.value = null

    try {
      const offset = reset
        ? 0
        : myItems.value.length
      const response = await client.value.get<APIResponse<PaginatedResponse<BookshelfEntry>>>(
        '/api/v1/users/me/bookshelves',
        { params: { ...params, limit: LIMIT, offset } },
      )

      if (request !== myRequest)
        return

      const data = response.data.data!
      const newItems = data.items
      myItems.value = [...myItems.value, ...newItems]
      myTotal.value = data.total
      myHasMore.value = data.has_more ?? (newItems.length >= LIMIT)
    }
    catch (error) {
      if (request !== myRequest)
        return

      console.error('Failed to fetch bookshelf:', error)
      myError.value = t('storeErrors.bookshelfLoadFailed')
    }
    finally {
      if (request === myRequest)
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
    if (!reset && publicIsLoading.value)
      return

    const request = ++publicRequest

    if (reset) {
      publicItems.value = []
      publicTotal.value = 0
      publicHasMore.value = false
      publicCurrentUsername.value = username
    }

    publicCurrentParams.value = params
    publicIsLoading.value = true
    publicError.value = null

    try {
      const offset = reset
        ? 0
        : publicItems.value.length
      const response = await client.value.get<APIResponse<PaginatedResponse<BookshelfEntry>>>(
        `/api/v1/users/${username}/bookshelves`,
        { params: { ...params, limit: LIMIT, offset } },
      )

      if (request !== publicRequest)
        return

      const data = response.data.data!
      const newPublicItems = data.items
      publicItems.value = [...publicItems.value, ...newPublicItems]
      publicTotal.value = data.total
      publicHasMore.value = data.has_more ?? (newPublicItems.length >= LIMIT)
    }
    catch (error) {
      if (request !== publicRequest)
        return

      console.error('Failed to fetch public bookshelf:', error)
      publicError.value = t('storeErrors.publicBookshelfLoadFailed')
    }
    finally {
      if (request === publicRequest)
        publicIsLoading.value = false
    }
  }

  const loadMoreByUsername = async (username: string) => {
    if (!publicHasMore.value || publicIsLoading.value)
      return
    await fetchByUsername(username, publicCurrentParams.value, false)
  }

  const upsertStatus = async (slug: string, status: BookshelfStatus) => {
    await client.value.put(`/api/v1/users/me/bookshelves/${slug}`, { status })
    const item = myItems.value.find(i => i.book_slug === slug)
    if (item)
      item.status = status
    const pubItem = publicItems.value.find(i => i.book_slug === slug)
    if (pubItem)
      pubItem.status = status
  }

  const removeItem = (slug: string) => {
    const idx = myItems.value.findIndex(i => i.book_slug === slug)
    if (idx !== -1) {
      myItems.value.splice(idx, 1)
      myTotal.value--
    }
    const pubIdx = publicItems.value.findIndex(i => i.book_slug === slug)
    if (pubIdx !== -1) {
      publicItems.value.splice(pubIdx, 1)
      publicTotal.value--
    }
  }

  const deleteMine = async (slug: string) => {
    await client.value.delete(`/api/v1/users/me/bookshelves/${slug}`)
    removeItem(slug)
  }

  // The signed-in reader's own shelf only; the public profile being viewed is not theirs.
  const resetMine = () => {
    myRequest++
    myItems.value = []
    myTotal.value = 0
    myIsLoading.value = false
    myHasMore.value = false
    myCurrentParams.value = {}
    myError.value = null
  }

  return {
    // My bookshelf
    myItems,
    myTotal,
    myIsLoading,
    myHasMore,
    myHasData,
    myIsEmpty,
    myError,
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
    publicError,
    fetchByUsername,
    loadMoreByUsername,
    // Actions
    upsertStatus,
    removeItem,
    deleteMine,
    resetMine,
  }
})
