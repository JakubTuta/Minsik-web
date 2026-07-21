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

  function extractError(error: any, fallback: string): string {
    return error?.response?.data?.error?.message
      || error?.response?.data?.message
      || fallback
  }

  // Keep the shared "on shelf" cache (list pages) in sync after optimistic changes
  function syncSharedStatus() {
    const bookId = booksStore.currentBook?.book_id
    if (!bookId)
      return

    const statusesStore = useBookStatusesStore()
    const status = bookshelfStatus.value ?? (isFavourite.value
      ? 'want_to_read'
      : null)
    statusesStore.setStatus(bookId, status
      ? { status, is_favorite: isFavourite.value }
      : null)
  }

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

      syncSharedStatus()
    }
    catch (error) {
      console.error('Failed to fetch book user data:', error)
    }
    finally {
      statusLoading.value = false
    }
  }

  // Refresh aggregate rating stats after a rating write settles (background)
  const refreshLiveRatingStats = async (slug: string) => {
    const lang = booksStore.currentBook?.language ?? 'en'
    const fresh = await booksStore.fetchBook(slug, lang, true)
    if (fresh && currentSlug.value === slug) {
      liveAvgRating.value = fresh.avg_rating
      liveRatingCount.value = fresh.rating_count
      liveSubRatingStats.value = fresh.sub_rating_stats ?? null
    }
  }

  // Upsert bookshelf status (optimistic — reverts on failure)
  const upsertBookshelf = (slug: string, status: BookshelfStatus) => {
    const previous = bookshelfStatus.value
    bookshelfStatus.value = status
    syncSharedStatus()

    client.value.put(`/api/v1/users/me/bookshelves/${slug}`, { status })
      .catch((error) => {
        if (currentSlug.value === slug) {
          bookshelfStatus.value = previous
          syncSharedStatus()
        }
        useToastStore().error(extractError(error, 'Could not update your bookshelf.'))
      })
  }

  // Remove from bookshelf (optimistic)
  const removeFromBookshelf = (slug: string) => {
    const previousStatus = bookshelfStatus.value
    const previousFav = isFavourite.value
    bookshelfStatus.value = null
    isFavourite.value = false
    syncSharedStatus()

    client.value.delete(`/api/v1/users/me/bookshelves/${slug}`)
      .catch((error) => {
        if (currentSlug.value === slug) {
          bookshelfStatus.value = previousStatus
          isFavourite.value = previousFav
          syncSharedStatus()
        }
        useToastStore().error(extractError(error, 'Could not remove this book.'))
      })
  }

  // Toggle favourite (optimistic — favouriting also creates a shelf entry server-side)
  const toggleFavourite = (slug: string) => {
    const wasFav = isFavourite.value
    const previousStatus = bookshelfStatus.value
    isFavourite.value = !wasFav
    if (!wasFav && bookshelfStatus.value === null)
      bookshelfStatus.value = 'want_to_read'
    syncSharedStatus()

    const request = wasFav
      ? client.value.delete(`/api/v1/books/${slug}/favourite`)
      : client.value.post(`/api/v1/books/${slug}/favourite`)

    request.catch((error) => {
      if (currentSlug.value === slug) {
        isFavourite.value = wasFav
        bookshelfStatus.value = previousStatus
        syncSharedStatus()
      }
      useToastStore().error(extractError(error, 'Could not update favourites.'))
    })
  }

  // Submit or update rating (optimistic — aggregate stats refresh in background)
  const submitRating = (slug: string, data: Record<string, any>) => {
    const previous = userRating.value
    userRating.value = data as BookCommentRating

    client.value.post(`/api/v1/books/${slug}/rate`, data)
      .then(() => { refreshLiveRatingStats(slug).catch(() => {}) })
      .catch((error) => {
        if (currentSlug.value === slug)
          userRating.value = previous
        useToastStore().error(extractError(error, 'Could not save your rating.'))
      })
  }

  // Delete rating (optimistic)
  const deleteRating = (slug: string) => {
    const previous = userRating.value
    userRating.value = null

    client.value.delete(`/api/v1/books/${slug}/rate`)
      .then(() => { refreshLiveRatingStats(slug).catch(() => {}) })
      .catch((error) => {
        if (currentSlug.value === slug)
          userRating.value = previous
        useToastStore().error(extractError(error, 'Could not delete your rating.'))
      })
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

  function mapCommentResponse(response: any): BookComment {
    const responseData = response.data.data!
    // API returns nested structure: { comment: {...}, ... }
    const data = responseData.comment || responseData

    return {
      ...data,
      comment_created_at: data.created_at,
      comment_updated_at: data.updated_at,
      user_id: data.user_id,
      username: data.username,
    }
  }

  // Create comment (optimistic — shows instantly, reconciles with server id)
  const createComment = (slug: string, body: string, isSpoiler = false) => {
    const nowIso = new Date().toISOString()
    const optimistic: BookComment = {
      comment_id: -Date.now(),
      user_id: authStore.user?.user_id ?? 0,
      username: authStore.user?.username ?? 'You',
      book_id: 0,
      book_slug: slug,
      body,
      is_spoiler: isSpoiler,
      comment_created_at: nowIso,
      comment_updated_at: nowIso,
    }
    myComment.value = optimistic
    commentsTotal.value++

    client.value.post<APIResponse<any>>(
      `/api/v1/books/${slug}/comments`,
      { body, is_spoiler: isSpoiler },
    )
      .then((response) => {
        if (currentSlug.value === slug)
          myComment.value = mapCommentResponse(response)
      })
      .catch((error) => {
        if (currentSlug.value === slug) {
          myComment.value = null
          commentsTotal.value = Math.max(0, commentsTotal.value - 1)
        }
        useToastStore().error(extractError(error, 'Could not post your comment.'))
      })
  }

  // Update comment (optimistic)
  const updateComment = (slug: string, commentId: number, body: string, isSpoiler = false) => {
    const previous = myComment.value
      ? { ...myComment.value }
      : null
    if (myComment.value) {
      myComment.value = {
        ...myComment.value,
        body,
        is_spoiler: isSpoiler,
        comment_updated_at: new Date().toISOString(),
      }
    }

    client.value.put<APIResponse<any>>(
      `/api/v1/books/${slug}/comments/${commentId}`,
      { body, is_spoiler: isSpoiler },
    )
      .then((response) => {
        if (currentSlug.value === slug)
          myComment.value = mapCommentResponse(response)
      })
      .catch((error) => {
        if (currentSlug.value === slug)
          myComment.value = previous
        useToastStore().error(extractError(error, 'Could not update your comment.'))
      })
  }

  // Delete comment (optimistic)
  const deleteComment = (slug: string, commentId: number) => {
    const previous = myComment.value
      ? { ...myComment.value }
      : null
    const previousTotal = commentsTotal.value
    myComment.value = null
    commentsTotal.value = Math.max(0, commentsTotal.value - 1)

    client.value.delete(`/api/v1/books/${slug}/comments/${commentId}`)
      .catch((error) => {
        if (currentSlug.value === slug) {
          myComment.value = previous
          commentsTotal.value = previousTotal
        }
        useToastStore().error(extractError(error, 'Could not delete your comment.'))
      })
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
