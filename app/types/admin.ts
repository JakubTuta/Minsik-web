export interface CoverageStats {
  db_books_count: number
  db_authors_count: number
  db_series_count: number
  cached: boolean
}

export interface ImportDumpResult {
  status: string
  message: string
}

export interface JobTriggerResult {
  status: string
  message: string
}

export interface RecommendationsRefreshResult {
  success: boolean
  message: string
}

export interface EditFieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'array' | 'json'
}

export interface AuditBookItem {
  book_id: number
  title: string
  slug: string
  language: string
  primary_cover_url: string | null
  author_count: number
  genre_count: number
  original_publication_year: number | null
  issues: string[]
}

export interface AuditAuthorItem {
  author_id: number
  name: string
  slug: string
  book_count: number
  issues: string[]
}

export interface AuditSeriesItem {
  series_id: number
  name: string
  slug: string
  language: string
  book_count: number
  total_books: number
  issues: string[]
}

export interface AuditBooksFilters {
  limit?: number
  minAuthors?: number
  maxAuthors?: number
  minGenres?: number
  maxGenres?: number
  language?: string
  checkMissingDescription?: boolean
  checkMissingCover?: boolean
  checkImplausibleYear?: boolean
  checkSuspiciousTitle?: boolean
}

export interface AuditAuthorsFilters {
  limit?: number
  minBooks?: number
  maxBooks?: number
  checkMissingBio?: boolean
  checkJunkName?: boolean
}

export interface AuditSeriesFilters {
  limit?: number
  minBooks?: number
  maxBooks?: number
  language?: string
  checkMissingDescription?: boolean
  checkCountDrift?: boolean
}
