import type { APIResponse } from '~/types/api'
import type { BookshelfStatus } from '~/types/user'
import { defineStore } from 'pinia'

export interface ShelfStatusInfo {
  status: BookshelfStatus
  is_favorite: boolean
}

interface BookStatusesResponseData {
  statuses: Array<{ book_id: number, status: BookshelfStatus, is_favorite: boolean }>
}

// Batch "on your shelf" lookups, shared across list pages (series, author, search...)
export const useBookStatusesStore = defineStore('bookStatuses', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)
  const authStore = useAuthStore()

  const statuses = ref(new Map<number, ShelfStatusInfo>())
  const checked = ref(new Set<number>())
  const inFlight = ref(new Set<number>())

  const fetchStatuses = async (bookIds: number[]) => {
    if (!authStore.isAuthenticated || bookIds.length === 0)
      return

    const missing = [...new Set(bookIds)].filter(
      id => id && !checked.value.has(id) && !inFlight.value.has(id),
    )
    if (missing.length === 0)
      return

    missing.forEach(id => inFlight.value.add(id))
    try {
      const response = await client.value.post<APIResponse<BookStatusesResponseData>>(
        '/api/v1/users/me/books/statuses',
        { book_ids: missing },
      )
      const data = response.data.data!
      for (const s of data.statuses)
        statuses.value.set(s.book_id, { status: s.status, is_favorite: s.is_favorite })

      missing.forEach(id => checked.value.add(id))
    }
    catch (error) {
      console.error('Failed to fetch book statuses:', error)
    }
    finally {
      missing.forEach(id => inFlight.value.delete(id))
    }
  }

  const getStatus = (bookId: number): ShelfStatusInfo | undefined => statuses.value.get(bookId)

  // Keep the shared cache in sync after an optimistic action on a book page
  const setStatus = (bookId: number, info: ShelfStatusInfo | null) => {
    if (info)
      statuses.value.set(bookId, info)
    else
      statuses.value.delete(bookId)

    checked.value.add(bookId)
  }

  const reset = () => {
    statuses.value.clear()
    checked.value.clear()
    inFlight.value.clear()
  }

  return { statuses, fetchStatuses, getStatus, setStatus, reset }
})
