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

export interface AdminUpdateBookRequest {
  title?: string | null
  slug?: string | null
  description?: string | null
  first_sentence?: string | null
  language?: string | null
  original_publication_year?: number | null
  primary_cover_url?: string | null
  formats?: string[] | null
  isbn?: string[] | null
  publisher?: string | null
  number_of_pages?: number | null
  external_ids?: Record<string, string> | null
  open_library_id?: string | null
  google_books_id?: string | null
  series_id?: number | null
  series_position?: number | null
}

export interface AdminUpdateAuthorRequest {
  name?: string | null
  slug?: string | null
  bio?: string | null
  birth_date?: string | null
  death_date?: string | null
  birth_place?: string | null
  nationality?: string | null
  photo_url?: string | null
  wikidata_id?: string | null
  wikipedia_url?: string | null
  remote_ids?: Record<string, string> | null
  alternate_names?: string[] | null
  open_library_id?: string | null
}

export interface AdminUpdateSeriesRequest {
  name?: string | null
  slug?: string | null
  description?: string | null
  total_books?: number | null
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
  maxAuthors?: number
  maxGenres?: number
  language?: string
}

export interface AuditAuthorsFilters {
  limit?: number
  minBooks?: number
  maxBooks?: number
}

export interface AuditSeriesFilters {
  limit?: number
  minBooks?: number
  maxBooks?: number
  language?: string
}
