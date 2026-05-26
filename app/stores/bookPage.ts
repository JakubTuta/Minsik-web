import type { APIResponse, SubRatingStat } from '~/types/api'
import type { BookComment, BookCommentRating, BookCommentsListData, BookshelfStatus, UserBookInfoData } from '~/types/user'
import { defineStore } from 'pinia'

export const useBookPageStore = defineStore('bookPage', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)
  const authStore = useAuthStore()
  const booksStore = useBooksStore()

  // Bookshelf / favourite state
  const currentSlug = ref<string | null>(null)
  const bookshelfStatus = ref<BookshelfStatus | null>(null)
  const isFavourite = ref(false)
  const statusLoading = ref(false)

  // User rating state
  const userRating = ref<BookCommentRating | null>(null)

  // Live rating stats — updated after submit/delete so the page reflects new values without a full refresh
  const liveAvgRating = ref<number | null>(null)
  const liveRatingCount = ref<number | null>(null)
  const liveSubRatingStats = ref<Record<string, SubRatingStat> | null>(null)

  // Comments state
  const comments = ref<BookComment[]>([])
  const commentsTotal = ref(0)
  const commentsLoading = ref(false)
  const myComment = ref<BookComment | null>(null)
  const currentCommentParams = ref<Record<string, any>>({})

  const COMMENTS_LIMIT = 10

  const commentsHasMore = computed(() => comments.value.length < commentsTotal.value)

  // Fetch all user data for a book in a single call
  const fetchBookUserData = async (slug: string) => {
    if (!authStore.isAuthenticated) {
      bookshelfStatus.value = null
      isFavourite.value = false
      userRating.value = null
      statusLoading.value = false

      return
    }

    currentSlug.value = slug
    statusLoading.value = true

    try {
      const response = await client.value.get<APIResponse<UserBookInfoData>>(
        `/api/v1/users/me/books/${slug}`,
      )

      const data = response.data.data!

      // Bookshelf
      if (data.bookshelf) {
        bookshelfStatus.value = data.bookshelf.status
        isFavourite.value = data.bookshelf.is_favorite
      }
      else {
        bookshelfStatus.value = null
        isFavourite.value = false
      }

      // Rating
      if (data.rating) {
        userRating.value = {
          overall_rating: data.rating.overall_rating,
          pacing: data.rating.pacing,
          emotional_impact: data.rating.emotional_impact,
          intellectual_depth: data.rating.intellectual_depth,
          writing_quality: data.rating.writing_quality,
          rereadability: data.rating.rereadability,
          readability: data.rating.readability,
          plot_complexity: data.rating.plot_complexity,
          humor: data.rating.humor,
        }
      }
      else {
        userRating.value = null
      }
    }
    catch (error) {
      console.error('Failed to fetch book user data:', error)
    }
    finally {
      statusLoading.value = false
    }
  }

  // Upsert bookshelf status
  const upsertBookshelf = async (slug: string, status: BookshelfStatus) => {
    try {
      await client.value.put(`/api/v1/users/me/bookshelves/${slug}`, { status })
      bookshelfStatus.value = status
    }
    catch (error) {
      console.error('Failed to update bookshelf:', error)
      throw error
    }
  }

  // Remove from bookshelf
  const removeFromBookshelf = async (slug: string) => {
    try {
      await client.value.delete(`/api/v1/users/me/bookshelves/${slug}`)
      bookshelfStatus.value = null
    }
    catch (error) {
      console.error('Failed to remove from bookshelf:', error)
      throw error
    }
  }

  // Toggle favourite
  const toggleFavourite = async (slug: string) => {
    try {
      if (isFavourite.value) {
        await client.value.delete(`/api/v1/books/${slug}/favourite`)
        isFavourite.value = false
      }
      else {
        await client.value.post(`/api/v1/books/${slug}/favourite`)
        isFavourite.value = true
      }
    }
    catch (error) {
      console.error('Failed to toggle favourite:', error)
      throw error
    }
  }

  // Submit or update rating
  const submitRating = async (slug: string, data: Record<string, any>) => {
    try {
      await client.value.post(`/api/v1/books/${slug}/rate`, data)
      userRating.value = data as BookCommentRating
      const lang = booksStore.currentBook?.language ?? 'en'
      const fresh = await booksStore.fetchBook(slug, lang, true)
      if (fresh) {
        liveAvgRating.value = fresh.avg_rating
        liveRatingCount.value = fresh.rating_count
        liveSubRatingStats.value = fresh.sub_rating_stats ?? null
      }
    }
    catch (error) {
      console.error('Failed to submit rating:', error)
      throw error
    }
  }

  // Delete rating
  const deleteRating = async (slug: string) => {
    try {
      await client.value.delete(`/api/v1/books/${slug}/rate`)
      userRating.value = null
      const lang = booksStore.currentBook?.language ?? 'en'
      const fresh = await booksStore.fetchBook(slug, lang, true)
      if (fresh) {
        liveAvgRating.value = fresh.avg_rating
        liveRatingCount.value = fresh.rating_count
        liveSubRatingStats.value = fresh.sub_rating_stats ?? null
      }
    }
    catch (error) {
      console.error('Failed to delete rating:', error)
      throw error
    }
  }

  // Fetch comments for a book
  const fetchComments = async (slug: string, params: Record<string, any> = {}, reset = true) => {
    if (commentsLoading.value)
      return

    if (reset) {
      comments.value = []
      commentsTotal.value = 0
    }

    currentCommentParams.value = params
    commentsLoading.value = true

    try {
      const offset = reset
        ? 0
        : comments.value.length
      const response = await client.value.get<APIResponse<BookCommentsListData>>(
        `/api/v1/books/${slug}/comments`,
        { params: { ...params, limit: COMMENTS_LIMIT, offset } },
      )

      const data = response.data.data!

      // Extract my_entry if present (authenticated); clear on reset when not authenticated
      if (data.my_entry) {
        myComment.value = data.my_entry
      }
      else if (reset && !authStore.isAuthenticated) {
        myComment.value = null
      }

      // Handle paginated items
      const items: BookComment[] = data.items ?? []
      comments.value = [...comments.value, ...items]
      commentsTotal.value = data.total_count ?? 0
    }
    catch (error) {
      console.error('Failed to fetch comments:', error)
    }
    finally {
      commentsLoading.value = false
    }
  }

  const loadMoreComments = async () => {
    if (!commentsHasMore.value || commentsLoading.value || !currentSlug.value)
      return
    await fetchComments(currentSlug.value, currentCommentParams.value, false)
  }

  // Create comment
  const createComment = async (slug: string, body: string, isSpoiler = false) => {
    try {
      const response = await client.value.post<APIResponse<any>>(
        `/api/v1/books/${slug}/comments`,
        { body, is_spoiler: isSpoiler },
      )
      const responseData = response.data.data!
      // API returns nested structure: { comment: {...}, ... }
      const data = responseData.comment || responseData

      // Map API response to BookComment interface
      myComment.value = {
        ...data,
        comment_created_at: data.created_at,
        comment_updated_at: data.updated_at,
        user_id: data.user_id,
        username: data.username,
      }
      commentsTotal.value++
    }
    catch (error) {
      console.error('Failed to create comment:', error)
      throw error
    }
  }

  // Update comment
  const updateComment = async (slug: string, commentId: number, body: string, isSpoiler = false) => {
    try {
      const response = await client.value.put<APIResponse<any>>(
        `/api/v1/books/${slug}/comments/${commentId}`,
        { body, is_spoiler: isSpoiler },
      )
      const responseData = response.data.data!
      // API returns nested structure: { comment: {...}, ... }
      const data = responseData.comment || responseData

      // Map API response to BookComment interface
      myComment.value = {
        ...data,
        comment_created_at: data.created_at,
        comment_updated_at: data.updated_at,
        user_id: data.user_id,
        username: data.username,
      }
    }
    catch (error) {
      console.error('Failed to update comment:', error)
      throw error
    }
  }

  // Delete comment
  const deleteComment = async (slug: string, commentId: number) => {
    try {
      await client.value.delete(`/api/v1/books/${slug}/comments/${commentId}`)
      myComment.value = null
      commentsTotal.value = Math.max(0, commentsTotal.value - 1)
    }
    catch (error) {
      console.error('Failed to delete comment:', error)
      throw error
    }
  }

  // Reset all state (call when navigating away)
  const resetState = () => {
    currentSlug.value = null
    bookshelfStatus.value = null
    isFavourite.value = false
    statusLoading.value = false
    userRating.value = null
    liveAvgRating.value = null
    liveRatingCount.value = null
    liveSubRatingStats.value = null
    comments.value = []
    commentsTotal.value = 0
    commentsLoading.value = false
    myComment.value = null
    currentCommentParams.value = {}
  }

  return {
    currentSlug,
    bookshelfStatus,
    isFavourite,
    statusLoading,
    comments,
    commentsTotal,
    commentsLoading,
    myComment,
    commentsHasMore,
    userRating,
    liveAvgRating,
    liveRatingCount,
    liveSubRatingStats,
    fetchBookUserData,
    upsertBookshelf,
    removeFromBookshelf,
    toggleFavourite,
    submitRating,
    deleteRating,
    fetchComments,
    loadMoreComments,
    createComment,
    updateComment,
    deleteComment,
    resetState,
  }
})
