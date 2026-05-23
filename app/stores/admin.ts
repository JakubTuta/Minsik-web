import type { CoverageStats, ImportDumpResult, JobTriggerResult } from '~/types/admin'
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
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const coverage = ref<CoverageStats | null>(null)
  const importResult = ref<ImportDumpResult | null>(null)
  const cleanupResult = ref<JobTriggerResult | null>(null)
  const reindexResult = ref<JobTriggerResult | null>(null)

  const isCoverageLoading = ref(false)
  const isImportLoading = ref(false)
  const isCleanupLoading = ref(false)
  const isReindexLoading = ref(false)

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
      errors.value.coverage = 'Failed to load coverage statistics'
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
      errors.value.import = 'Failed to start dump import'
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
      errors.value.cleanup = 'Failed to start cleanup job'
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
      errors.value.reindex = 'Failed to start reindex job'
    }
    finally {
      isReindexLoading.value = false
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
      const msg = error.response?.data?.error?.message || 'Failed to update book'

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
      const msg = error.response?.data?.error?.message || 'Failed to update author'

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
      const msg = error.response?.data?.error?.message || 'Failed to update series'

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
      const msg = error.response?.data?.error?.message || 'Failed to delete book'

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
      const msg = error.response?.data?.error?.message || 'Failed to delete author'

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
      const msg = error.response?.data?.error?.message || 'Failed to delete series'

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
    isCoverageLoading,
    isImportLoading,
    isCleanupLoading,
    isReindexLoading,
    isUpdateLoading,
    isDeleteLoading,
    errors,
    fetchCoverage,
    importDump,
    runCleanup,
    runReindex,
    updateBook,
    updateAuthor,
    updateSeries,
    deleteBook,
    deleteAuthor,
    deleteSeries,
  }
})
