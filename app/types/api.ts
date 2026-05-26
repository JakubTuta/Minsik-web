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
  books: BookSummary[]
  total_count: number
  limit: number
  offset: number
}

export interface AuthorQuote {
  first_sentence: string
  book_title: string
  book_slug: string
  publication_year?: number | null
}

export interface AuthorTopBooksResponse {
  books: BookSummary[]
}

export interface SeriesBooksResponse {
  books: BookSummary[]
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
  avg: number
  count: number
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
  books_ol_avg_rating: number
  books_ol_total_ratings: number
  view_count: number
  last_viewed_at?: string
  open_library_id?: string | null
  created_at: string
  updated_at: string
  wikidata_id?: string | null
  wikipedia_url?: string | null
  remote_ids: Record<string, string>
  alternate_names: string[]
  app_want_to_read_count: number
  app_reading_count: number
  app_read_count: number
  ol_want_to_read_count: number
  ol_currently_reading_count: number
  ol_already_read_count: number
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
  description?: string | null
  view_count: number
  last_viewed_at?: string | null
  created_at: string
  updated_at: string
  avg_rating: number
  rating_count: number
  ol_avg_rating: number
  ol_rating_count: number
  author?: Author
  app_want_to_read_count: number
  app_reading_count: number
  app_read_count: number
  ol_want_to_read_count: number
  ol_currently_reading_count: number
  ol_already_read_count: number
  total_pages: number
}

// Book Types

export interface BookSummary {
  book_id: number
  slug: string
  title: string
  description?: string | null
  primary_cover_url?: string | null
  authors: AuthorMinimal[]
  rating_count: number
  avg_rating: number
  ol_rating_count: number
  ol_avg_rating: number
  ol_want_to_read_count: number
  ol_currently_reading_count: number
  ol_already_read_count: number
  app_want_to_read_count: number
  app_reading_count: number
  app_read_count: number
  series_position?: number | null
  rarity?: string | null
  original_publication_year?: number | null
  number_of_pages?: number | null
}

export interface Book {
  book_id: number
  slug: string
  title: string
  description?: string | null
  first_sentence?: string | null
  language: string
  original_publication_year?: number | null
  formats: string[]
  primary_cover_url?: string | null
  rating_count: number
  avg_rating: number
  view_count: number
  last_viewed_at?: string | null
  authors: AuthorMinimal[]
  genres: Genre[]
  series?: SeriesMinimal | null
  series_position?: number | null
  open_library_id?: string | null
  google_books_id?: string | null
  sub_rating_stats: Record<string, SubRatingStat>
  created_at: string
  updated_at: string
  isbn: string[]
  publisher?: string | null
  number_of_pages: number
  external_ids: Record<string, string>
  ol_rating_count: number
  ol_avg_rating: number
  ol_want_to_read_count: number
  ol_currently_reading_count: number
  ol_already_read_count: number
  app_want_to_read_count: number
  app_reading_count: number
  app_read_count: number
  rating_distribution: Record<string, number>
}

export interface BookLanguageVariant {
  book_id: number
  slug: string
  language: string
  title: string
  primary_cover_url?: string | null
}

// Card Display Types — kept for BookCard.vue compatibility

export interface BookCardData {
  slug: string
  title: string
  primary_cover_url?: string | null
  authors: Array<{ name: string, slug: string }>
  series?: { name: string, slug: string } | null
  series_position?: number | null
  avg_rating: number
  rating_count?: number
  ol_avg_rating: number
  ol_rating_count?: number
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
  app_avg_rating: number
  app_rating_count: number
  ol_avg_rating: number
  ol_rating_count: number
  book_count: number
  readers: number
  language?: string
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

export interface SuggestItem {
  type: 'book' | 'author' | 'series'
  id: number
  title: string
  slug: string
  cover_url: string
  authors: string[]
  score: number
  readers: number
  app_avg_rating: number
  app_rating_count: number
  ol_avg_rating: number
  ol_rating_count: number
  language?: string
}

export interface SuggestResultsData {
  items: SuggestItem[]
}

export interface SuggestResponse {
  success: boolean
  data: SuggestResultsData
  error?: {
    code: string
    message: string
    details?: any
  } | null
}

// Filter Types

export type SearchType = 'all' | 'books' | 'authors' | 'series' | 'categories'

// Cache Types

export interface CacheEntry<T> {
  data: T
  timestamp: number
}
