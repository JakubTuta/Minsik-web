import type { MaybeRefOrGetter } from 'vue'

// Batch-fetch "on your shelf" statuses for a list of books (gated on auth, deduped in store)
export function useShelfStatuses(books: MaybeRefOrGetter<Array<{ book_id: number }>>) {
  const authStore = useAuthStore()
  const bookStatusesStore = useBookStatusesStore()

  watch(
    [() => authStore.isAuthenticated, () => toValue(books).length],
    () => {
      const list = toValue(books)
      if (authStore.isAuthenticated && list.length)
        bookStatusesStore.fetchStatuses(list.map(b => b.book_id))
    },
    { immediate: true },
  )
}
