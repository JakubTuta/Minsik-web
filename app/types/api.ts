// API Response Types

export interface ErrorDetail {
  code: string
  message: string
  details?: any
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: ErrorDetail | null
}

export interface BookDetailResponse {
  success: boolean
  data: Book
  error?: ErrorDetail | null
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface AuthorBooksResponse {
  books: Book[]
  total_count: number
  limit: number
  offset: number
}

export interface SeriesBooksResponse {
  books: Book[]
  total_count: number
  limit: number
  offset: number
}

// Genre Types

export interface Genre {
  genre_id: number
  name: string
  slug: string
}

// Sub-Rating Types

export interface SubRatingStat {
  avg: string | null
  count: number
}

// Cover Types

export interface CoverHistory {
  url: string
  width: number
  size: string
}

// Author Types

export interface AuthorMinimal {
  author_id: number
  name: string
  slug: string
  photo_url?: string | null
}

export interface Author extends AuthorMinimal {
  bio?: string
  birth_date?: string
  death_date?: string
  birth_place?: string | null
  nationality?: string | null
  books_count: number
  book_categories: string[]
  books_avg_rating: number
  books_total_ratings: number
  books_total_views: number
  view_count: number
  last_viewed_at?: string
  open_library_id?: string
  created_at: string
  updated_at: string
  // Computed client-side
  display_dates?: string
}

// Series Types

export interface SeriesMinimal {
  series_id: number
  name: string
  slug: string
  total_books?: number | null
}

export interface Series extends SeriesMinimal {
  description?: string
  view_count: number
  last_viewed_at?: string
  created_at: string
  updated_at: string
  author?: Author
}

// Book Types

export interface Book {
  book_id: number
  slug: string
  title: string
  description?: string | null
  language: string
  original_publication_year?: number | null
  formats: string[]
  primary_cover_url?: string | null
  cover_history: CoverHistory[]
  rating_count: number
  avg_rating: number
  view_count: number
  last_viewed_at?: string | null
  authors: AuthorMinimal[]
  genres: Genre[]
  series?: SeriesMinimal | null
  series_position?: string | null
  open_library_id?: string | null
  google_books_id?: string | null
  sub_rating_stats?: Record<string, SubRatingStat>
  created_at: string
  updated_at: string
}

// Card Display Types (for components)

export interface BookCardData {
  slug: string
  title: string
  primary_cover_url?: string | null
  authors: Array<{ name: string, slug: string }>
  series?: { name: string, slug: string } | null
  series_position?: string | null
  avg_rating?: number
  rating_count?: number
  view_count: number
  genres?: Array<{ name: string, slug: string }>
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
