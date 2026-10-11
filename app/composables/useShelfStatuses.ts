import type { MaybeRefOrGetter } from 'vue'

// Batch-fetch "on your shelf" statuses for a list of books (gated on auth, deduped in store).
// Infinite scroll only ever appends, so re-sending the whole accumulated list on every page
// means rebuilding an ever-growing array just to have the store re-filter it down to nothing
// new — track how much of the list was already sent and request only the new tail. A list
// that starts with a different book is a different list (new sort or filter), not a longer one.
export function useShelfStatuses(books: MaybeRefOrGetter<Array<{ book_id: number }>>) {
  const authStore = useAuthStore()
  const bookStatusesStore = useBookStatusesStore()

  let sentCount = 0
  let sentHead: number | undefined

  watch(
    [() => authStore.isAuthenticated, () => toValue(books)[0]?.book_id, () => toValue(books).length],
    () => {
      const list = toValue(books)
      if (!authStore.isAuthenticated || !list.length)
        return

      const appended = list[0]?.book_id === sentHead && list.length > sentCount
      const newItems = appended
        ? list.slice(sentCount)
        : list
      sentCount = list.length
      sentHead = list[0]?.book_id
      bookStatusesStore.fetchStatuses(newItems.map(b => b.book_id))
    },
    { immediate: true },
  )
}
