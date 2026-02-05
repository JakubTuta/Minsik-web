// API Response Types

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

// Book Types

export interface Book {
  id: string
  slug: string
  title: string
  description?: string
  cover_url?: string
  publication_year?: number
  language?: string
  rating?: number
  rating_count?: number
  view_count: number
  authors: Author[]
  series?: Series
  series_position?: number
  genres: string[]
  formats: string[]
  isbn?: string
  isbn13?: string
  open_library_id?: string
  google_books_id?: string
}

// Author Types

export interface Author {
  id: string
  slug: string
  name: string
  biography?: string
  photo_url?: string
  birth_date?: string
  death_date?: string
  book_count: number
  view_count: number
  display_dates?: string
}

// Series Types

export interface Series {
  id: string
  slug: string
  name: string
  description?: string
  book_count: number
  view_count: number
  author?: Author
}

// Search Types

export interface SearchResult {
  type: 'book' | 'author' | 'series'
  id: number
  title: string
  slug: string
  cover_url?: string | null
  authors: string[]
  author_slugs: string[]
  series_slug: string | null
  relevance_score: number
  view_count: number
}

export interface SearchResultsData {
  results: SearchResult[]
  total_count: number
  limit: number
  offset: number
}

export interface SearchResponse {
  success: boolean
  data: SearchResultsData
  error?: {
    code: string
    message: string
    details?: any
  } | null
}

// Filter Types

export type SearchType = 'all' | 'books' | 'authors' | 'series'

// Cache Types

export interface CacheEntry<T> {
  data: T
  timestamp: number
}
