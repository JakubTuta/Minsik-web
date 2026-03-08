import type { CoverageStats, ImportDumpResult, IngestionResult, IngestionSource } from '~/types/admin'
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
  const ingestionResult = ref<IngestionResult | null>(null)
  const searchResults = ref<any[]>([])
  const importResult = ref<ImportDumpResult | null>(null)

  const isCoverageLoading = ref(false)
  const isIngestionLoading = ref(false)
  const isSearchLoading = ref(false)
  const isImportLoading = ref(false)

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

  const triggerIngestion = async (totalBooks: number, source: IngestionSource, language: string) => {
    isIngestionLoading.value = true
    try {
      const response = await client.value.post<APIResponse<IngestionResult>>(
        '/api/v1/admin/ingestion/trigger',
        { total_books: totalBooks, source, language },
      )
      ingestionResult.value = response.data.data!
      errors.value.ingestion = ''
    }
    catch (error) {
      console.error('Failed to trigger ingestion:', error)
      errors.value.ingestion = 'Failed to trigger ingestion'
    }
    finally {
      isIngestionLoading.value = false
    }
  }

  const searchBooks = async (title: string, author: string, source: IngestionSource, limit: number) => {
    isSearchLoading.value = true
    try {
      const response = await client.value.post<APIResponse<{ results: any[], total_count: number, limit: number, offset: number }>>(
        '/api/v1/admin/books/search',
        { title, author: author || undefined, source, limit },
      )
      searchResults.value = response.data.data!.results || []
      errors.value.search = ''
    }
    catch (error) {
      console.error('Failed to search books:', error)
      errors.value.search = 'Failed to search books'
      searchResults.value = []
    }
    finally {
      isSearchLoading.value = false
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
    ingestionResult,
    searchResults,
    importResult,
    isCoverageLoading,
    isIngestionLoading,
    isSearchLoading,
    isImportLoading,
    isUpdateLoading,
    isDeleteLoading,
    errors,
    fetchCoverage,
    triggerIngestion,
    searchBooks,
    importDump,
    updateBook,
    updateAuthor,
    updateSeries,
    deleteBook,
    deleteAuthor,
    deleteSeries,
  }
})
