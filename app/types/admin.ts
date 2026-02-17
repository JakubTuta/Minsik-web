export interface IngestionResult {
  job_id: string
  status: string
  total_books: number
  processed: number
  successful: number
  failed: number
}

export interface CoverageStats {
  db_books_count: number
  db_authors_count: number
  db_series_count: number
  ol_english_total: number
  coverage_percent: number
  cached: boolean
}

export interface ImportDumpResult {
  status: string
  message: string
}

export type IngestionSource = 'open_library' | 'google_books' | 'both'
