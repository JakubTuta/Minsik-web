import type { BookSummary } from '~/types/api'

export type BookLength = 'short' | 'medium' | 'long' | 'epic'
export type Quality = 'high' | 'medium' | 'low' | 'very_low'
export type Mood = 'funny' | 'emotional' | 'intellectual' | 'easy_read' | 'complex' | 'fast_paced'
export type Era = 'classic' | 'modern' | 'contemporary'
export type SeriesFilter = 'standalone' | 'series'
export type Popularity = 'popular' | 'hidden_gem'
export type DiscoverPhase = 'filtering' | 'loading' | 'revealing' | 'empty'

export interface DiscoverBookFilters {
  language?: string
  book_length?: BookLength | null
  quality?: Quality | null
  moods?: Mood[]
  era?: Era | null
  series_filter?: SeriesFilter | null
  popularity?: Popularity | null
  genre_slugs?: string[]
  exclude_ids?: number[]
}

export interface DiscoverBookData {
  book: BookSummary
  matching_count: number
}

export interface FilterOption<T extends string> {
  value: T
  label: string
  icon: string
  description?: string
}
