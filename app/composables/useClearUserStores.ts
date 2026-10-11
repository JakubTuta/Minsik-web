/**
 * Drops everything the signed-in reader's session put into the client stores,
 * so the next person on this tab never sees their shelves, ratings or comments.
 */
export function useClearUserStores(): () => void {
  return () => {
    useBookshelfStore().resetMine()
    useFavouritesStore().reset()
    useRatingsStore().reset()
    useUserCommentsStore().reset()
    useDashboardStore().reset()
    useYearInReviewStore().reset()
    useBookPageStore().resetState()
    useBookStatusesStore().reset()
    useRecommendationsStore().clearCache()
  }
}
