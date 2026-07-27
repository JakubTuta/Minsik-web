import type { CoverageStats, ImportDumpResult, JobTriggerResult, RecommendationsRefreshResult } from '~/types/admin'
import type { APIResponse } from '~/types/api'
import { defineStore } from 'pinia'

function getChangedFields(
  original: Record<string, any>,
  edited: Record<string, any>,
  allowedKeys: string[],
): Record<string, any> {
  const changes: Record<string, any> = {}
  for (const key of allowedKeys) {
    const orig = original[key] ?? null
    const edit = edited[key] ?? null
    if (JSON.stringify(orig) !== JSON.stringify(edit)) {
      changes[key] = edit
    }
  }

  return changes
}

export const useAdminStore = defineStore('admin', () => {
  const { t, te } = useI18n()
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const coverage = ref<CoverageStats | null>(null)
  const importResult = ref<ImportDumpResult | null>(null)
  const cleanupResult = ref<JobTriggerResult | null>(null)
  const reindexResult = ref<JobTriggerResult | null>(null)
  const recommendationsRefreshResult = ref<RecommendationsRefreshResult | null>(null)
  const personalRecommendationsRefreshResult = ref<RecommendationsRefreshResult | null>(null)
  const userPersonalRecommendationsRefreshResult = ref<RecommendationsRefreshResult | null>(null)
  const contextualRecommendationsRefreshResult = ref<RecommendationsRefreshResult | null>(null)
  const contextualInvalidateResult = ref<RecommendationsRefreshResult | null>(null)
  const bookOfTheWeekRefreshResult = ref<RecommendationsRefreshResult | null>(null)

  const isCoverageLoading = ref(false)
  const isImportLoading = ref(false)
  const isCleanupLoading = ref(false)
  const isReindexLoading = ref(false)
  const isRecommendationsRefreshLoading = ref(false)
  const isPersonalRecommendationsRefreshLoading = ref(false)
  const isUserPersonalRecommendationsRefreshLoading = ref(false)
  const isContextualRecommendationsRefreshLoading = ref(false)
  const isContextualInvalidateLoading = ref(false)
  const isBookOfTheWeekRefreshLoading = ref(false)

  const errors = ref<Record<string, string>>({})
  const isUpdateLoading = ref(false)
  const isDeleteLoading = ref(false)

  const fetchCoverage = async () => {
    isCoverageLoading.value = true
    try {
      const response = await client.value.get<APIResponse<CoverageStats>>(
        '/api/v1/admin/ingestion/coverage',
      )
      coverage.value = response.data.data!
      errors.value.coverage = ''
    }
    catch (error) {
      console.error('Failed to fetch coverage:', error)
      errors.value.coverage = t('storeErrors.adminCoverageLoadFailed')
    }
    finally {
      isCoverageLoading.value = false
    }
  }

  const importDump = async () => {
    isImportLoading.value = true
    try {
      const response = await client.value.post<APIResponse<ImportDumpResult>>(
        '/api/v1/admin/ingestion/import-dump',
      )
      importResult.value = response.data.data!
      errors.value.import = ''
    }
    catch (error) {
      console.error('Failed to import dump:', error)
      errors.value.import = t('storeErrors.adminImportStartFailed')
    }
    finally {
      isImportLoading.value = false
    }
  }

  const runCleanup = async () => {
    isCleanupLoading.value = true
    try {
      const response = await client.value.post<APIResponse<JobTriggerResult>>(
        '/api/v1/admin/jobs/cleanup',
      )
      cleanupResult.value = response.data.data!
      errors.value.cleanup = ''
    }
    catch (error) {
      console.error('Failed to trigger cleanup:', error)
      errors.value.cleanup = t('storeErrors.adminCleanupStartFailed')
    }
    finally {
      isCleanupLoading.value = false
    }
  }

  const runReindex = async () => {
    isReindexLoading.value = true
    try {
      const response = await client.value.post<APIResponse<JobTriggerResult>>(
        '/api/v1/admin/jobs/reindex',
      )
      reindexResult.value = response.data.data!
      errors.value.reindex = ''
    }
    catch (error) {
      console.error('Failed to trigger reindex:', error)
      errors.value.reindex = t('storeErrors.adminReindexStartFailed')
    }
    finally {
      isReindexLoading.value = false
    }
  }

  const refreshRecommendations = async () => {
    isRecommendationsRefreshLoading.value = true
    try {
      const response = await client.value.post<APIResponse<RecommendationsRefreshResult>>(
        '/api/v1/admin/recommendations/refresh',
      )
      recommendationsRefreshResult.value = response.data.data!
      errors.value.recommendationsRefresh = ''
    }
    catch (error) {
      console.error('Failed to refresh recommendations:', error)
      errors.value.recommendationsRefresh = t('storeErrors.adminRecommendationsRefreshFailed')
    }
    finally {
      isRecommendationsRefreshLoading.value = false
    }
  }

  const refreshPersonalRecommendations = async () => {
    isPersonalRecommendationsRefreshLoading.value = true
    try {
      const response = await client.value.post<APIResponse<RecommendationsRefreshResult>>(
        '/api/v1/admin/recommendations/personal/refresh',
      )
      personalRecommendationsRefreshResult.value = response.data.data!
      errors.value.personalRecommendationsRefresh = ''
    }
    catch (error) {
      console.error('Failed to refresh personal recommendations:', error)
      errors.value.personalRecommendationsRefresh = t('storeErrors.adminPersonalRecommendationsRefreshFailed')
    }
    finally {
      isPersonalRecommendationsRefreshLoading.value = false
    }
  }

  const refreshUserPersonalRecommendations = async (username: string) => {
    isUserPersonalRecommendationsRefreshLoading.value = true
    try {
      const response = await client.value.post<APIResponse<RecommendationsRefreshResult>>(
        `/api/v1/admin/recommendations/personal/refresh/${encodeURIComponent(username)}`,
      )
      userPersonalRecommendationsRefreshResult.value = response.data.data!
      errors.value.userPersonalRecommendationsRefresh = ''
    }
    catch (error: any) {
      console.error('Failed to refresh personal recommendations for user:', error)
      errors.value.userPersonalRecommendationsRefresh
        = apiErrorMessage(error, t, te, 'storeErrors.adminUserPersonalRecommendationsRefreshFailed')
    }
    finally {
      isUserPersonalRecommendationsRefreshLoading.value = false
    }
  }

  const refreshContextualRecommendations = async () => {
    isContextualRecommendationsRefreshLoading.value = true
    try {
      const response = await client.value.post<APIResponse<RecommendationsRefreshResult>>(
        '/api/v1/admin/recommendations/contextual/refresh',
      )
      contextualRecommendationsRefreshResult.value = response.data.data!
      errors.value.contextualRecommendationsRefresh = ''
    }
    catch (error) {
      console.error('Failed to refresh contextual recommendations:', error)
      errors.value.contextualRecommendationsRefresh = t('storeErrors.adminContextualRecommendationsRefreshFailed')
    }
    finally {
      isContextualRecommendationsRefreshLoading.value = false
    }
  }

  const invalidateContextualCache = async (entityType: 'book' | 'author' | 'series', slug: string) => {
    isContextualInvalidateLoading.value = true
    try {
      const response = await client.value.post<APIResponse<RecommendationsRefreshResult>>(
        `/api/v1/admin/recommendations/contextual/invalidate/${entityType}/${encodeURIComponent(slug)}`,
      )
      contextualInvalidateResult.value = response.data.data!
      errors.value.contextualInvalidate = ''
    }
    catch (error: any) {
      console.error('Failed to invalidate contextual cache:', error)
      errors.value.contextualInvalidate
        = apiErrorMessage(error, t, te, 'storeErrors.adminContextualInvalidateFailed')
    }
    finally {
      isContextualInvalidateLoading.value = false
    }
  }

  const refreshBookOfTheWeek = async () => {
    isBookOfTheWeekRefreshLoading.value = true
    try {
      const response = await client.value.post<APIResponse<RecommendationsRefreshResult>>(
        '/api/v1/admin/recommendations/book-of-the-week/refresh',
      )
      bookOfTheWeekRefreshResult.value = response.data.data!
      errors.value.bookOfTheWeekRefresh = ''
    }
    catch (error) {
      console.error('Failed to refresh book of the week:', error)
      errors.value.bookOfTheWeekRefresh = t('storeErrors.adminBookOfTheWeekRefreshFailed')
    }
    finally {
      isBookOfTheWeekRefreshLoading.value = false
    }
  }

  const updateBook = async (bookId: number, original: Record<string, any>, edited: Record<string, any>) => {
    const allowedKeys = [
      'title',
      'slug',
      'description',
      'first_sentence',
      'language',
      'original_publication_year',
      'primary_cover_url',
      'formats',
      'isbn',
      'publisher',
      'number_of_pages',
      'external_ids',
      'open_library_id',
      'google_books_id',
      'series_id',
      'series_position',
    ]
    const changes = getChangedFields(original, edited, allowedKeys)
    if (Object.keys(changes).length === 0)
      return { success: true, noChanges: true }

    isUpdateLoading.value = true
    try {
      await client.value.patch(`/api/v1/admin/books/${bookId}`, changes)

      return { success: true }
    }
    catch (error: any) {
      const msg = apiErrorMessage(error, t, te, 'storeErrors.adminBookUpdateFailed')

      return { success: false, error: msg }
    }
    finally {
      isUpdateLoading.value = false
    }
  }

  const updateAuthor = async (authorId: number, original: Record<string, any>, edited: Record<string, any>) => {
    const allowedKeys = [
      'name',
      'slug',
      'bio',
      'birth_date',
      'death_date',
      'birth_place',
      'nationality',
      'photo_url',
      'wikidata_id',
      'wikipedia_url',
      'remote_ids',
      'alternate_names',
      'open_library_id',
    ]
    const changes = getChangedFields(original, edited, allowedKeys)
    if (Object.keys(changes).length === 0)
      return { success: true, noChanges: true }

    isUpdateLoading.value = true
    try {
      await client.value.patch(`/api/v1/admin/authors/${authorId}`, changes)

      return { success: true }
    }
    catch (error: any) {
      const msg = apiErrorMessage(error, t, te, 'storeErrors.adminAuthorUpdateFailed')

      return { success: false, error: msg }
    }
    finally {
      isUpdateLoading.value = false
    }
  }

  const updateSeries = async (seriesId: number, original: Record<string, any>, edited: Record<string, any>) => {
    const allowedKeys = ['name', 'slug', 'description', 'total_books']
    const changes = getChangedFields(original, edited, allowedKeys)
    if (Object.keys(changes).length === 0)
      return { success: true, noChanges: true }

    isUpdateLoading.value = true
    try {
      await client.value.patch(`/api/v1/admin/series/${seriesId}`, changes)

      return { success: true }
    }
    catch (error: any) {
      const msg = apiErrorMessage(error, t, te, 'storeErrors.adminSeriesUpdateFailed')

      return { success: false, error: msg }
    }
    finally {
      isUpdateLoading.value = false
    }
  }

  const removeBookAuthor = async (bookId: number, authorId: number) => {
    isUpdateLoading.value = true
    try {
      await client.value.delete(`/api/v1/admin/books/${bookId}/authors/${authorId}`)

      return { success: true }
    }
    catch (error: any) {
      const msg = apiErrorMessage(error, t, te, 'storeErrors.adminRemoveAuthorFromBookFailed')

      return { success: false, error: msg }
    }
    finally {
      isUpdateLoading.value = false
    }
  }

  const removeSeriesAuthor = async (seriesId: number, authorId: number) => {
    isUpdateLoading.value = true
    try {
      await client.value.delete(`/api/v1/admin/series/${seriesId}/authors/${authorId}`)

      return { success: true }
    }
    catch (error: any) {
      const msg = apiErrorMessage(error, t, te, 'storeErrors.adminRemoveAuthorFromSeriesFailed')

      return { success: false, error: msg }
    }
    finally {
      isUpdateLoading.value = false
    }
  }

  const deleteBook = async (bookId: number) => {
    isDeleteLoading.value = true
    try {
      await client.value.delete(`/api/v1/admin/books/${bookId}`)

      return { success: true }
    }
    catch (error: any) {
      const msg = apiErrorMessage(error, t, te, 'storeErrors.adminBookDeleteFailed')

      return { success: false, error: msg }
    }
    finally {
      isDeleteLoading.value = false
    }
  }

  const deleteAuthor = async (authorId: number) => {
    isDeleteLoading.value = true
    try {
      await client.value.delete(`/api/v1/admin/authors/${authorId}`)

      return { success: true }
    }
    catch (error: any) {
      const msg = apiErrorMessage(error, t, te, 'storeErrors.adminAuthorDeleteFailed')

      return { success: false, error: msg }
    }
    finally {
      isDeleteLoading.value = false
    }
  }

  const deleteSeries = async (seriesId: number) => {
    isDeleteLoading.value = true
    try {
      await client.value.delete(`/api/v1/admin/series/${seriesId}`)

      return { success: true }
    }
    catch (error: any) {
      const msg = apiErrorMessage(error, t, te, 'storeErrors.adminSeriesDeleteFailed')

      return { success: false, error: msg }
    }
    finally {
      isDeleteLoading.value = false
    }
  }

  return {
    coverage,
    importResult,
    cleanupResult,
    reindexResult,
    recommendationsRefreshResult,
    personalRecommendationsRefreshResult,
    userPersonalRecommendationsRefreshResult,
    contextualRecommendationsRefreshResult,
    contextualInvalidateResult,
    bookOfTheWeekRefreshResult,
    isCoverageLoading,
    isImportLoading,
    isCleanupLoading,
    isReindexLoading,
    isRecommendationsRefreshLoading,
    isPersonalRecommendationsRefreshLoading,
    isUserPersonalRecommendationsRefreshLoading,
    isContextualRecommendationsRefreshLoading,
    isContextualInvalidateLoading,
    isBookOfTheWeekRefreshLoading,
    isUpdateLoading,
    isDeleteLoading,
    errors,
    fetchCoverage,
    importDump,
    runCleanup,
    runReindex,
    refreshRecommendations,
    refreshPersonalRecommendations,
    refreshUserPersonalRecommendations,
    refreshContextualRecommendations,
    invalidateContextualCache,
    refreshBookOfTheWeek,
    updateBook,
    removeBookAuthor,
    removeSeriesAuthor,
    updateAuthor,
    updateSeries,
    deleteBook,
    deleteAuthor,
    deleteSeries,
  }
})
