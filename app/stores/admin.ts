import type { CoverageStats, ImportDumpResult, IngestionResult, IngestionSource } from '~/types/admin'
import type { APIResponse } from '~/types/api'
import { defineStore } from 'pinia'

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

  return {
    coverage,
    ingestionResult,
    searchResults,
    importResult,
    isCoverageLoading,
    isIngestionLoading,
    isSearchLoading,
    isImportLoading,
    errors,
    fetchCoverage,
    triggerIngestion,
    searchBooks,
    importDump,
  }
})
