import type { MaybeRefOrGetter } from 'vue'

// Batch-fetch "on your shelf" statuses for a list of books (gated on auth, deduped in store).
// Infinite scroll only ever appends, so re-sending the whole accumulated list on every page
// means rebuilding an ever-growing array just to have the store re-filter it down to nothing
// new — track how much of the list was already sent and request only the new tail.
export function useShelfStatuses(books: MaybeRefOrGetter<Array<{ book_id: number }>>) {
  const authStore = useAuthStore()
  const bookStatusesStore = useBookStatusesStore()

  let sentCount = 0

  watch(
    [() => authStore.isAuthenticated, () => toValue(books).length],
    () => {
      const list = toValue(books)
      if (!authStore.isAuthenticated || !list.length)
        return

      const newItems = list.length > sentCount
        ? list.slice(sentCount)
        : list
      sentCount = list.length
      bookStatusesStore.fetchStatuses(newItems.map(b => b.book_id))
    },
    { immediate: true },
  )
}
