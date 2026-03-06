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

export const BOOK_LENGTH_OPTIONS: FilterOption<BookLength>[] = [
  { value: 'short', label: 'Short', icon: 'mdi-book-open-variant', description: '<200 pages' },
  { value: 'medium', label: 'Medium', icon: 'mdi-book', description: '200-400 pages' },
  { value: 'long', label: 'Long', icon: 'mdi-book-multiple', description: '400-600 pages' },
  { value: 'epic', label: 'Epic', icon: 'mdi-library', description: '600+ pages' },
]

export const QUALITY_OPTIONS: FilterOption<Quality>[] = [
  { value: 'high', label: 'High Quality', icon: 'mdi-star', description: '>4.0' },
  { value: 'medium', label: 'Good', icon: 'mdi-star-half-full', description: '3.0-4.0' },
  { value: 'low', label: 'Low', icon: 'mdi-star-outline', description: '2.0-3.0' },
  { value: 'very_low', label: 'Very Low', icon: 'mdi-star-off-outline', description: '≤2.0' },
]

export const MOOD_OPTIONS: FilterOption<Mood>[] = [
  { value: 'funny', label: 'Funny', icon: 'mdi-emoticon-happy' },
  { value: 'emotional', label: 'Emotional', icon: 'mdi-heart-pulse' },
  { value: 'intellectual', label: 'Intellectual', icon: 'mdi-brain' },
  { value: 'easy_read', label: 'Easy Read', icon: 'mdi-sofa' },
  { value: 'complex', label: 'Complex', icon: 'mdi-puzzle' },
  { value: 'fast_paced', label: 'Fast-Paced', icon: 'mdi-lightning-bolt' },
]

export const ERA_OPTIONS: FilterOption<Era>[] = [
  { value: 'classic', label: 'Classic', icon: 'mdi-clock-outline', description: 'Pre-1950' },
  { value: 'modern', label: 'Modern', icon: 'mdi-clock-fast', description: '1950-2000' },
  { value: 'contemporary', label: 'Contemporary', icon: 'mdi-clock-digital', description: '2000+' },
]

export const SERIES_OPTIONS: FilterOption<SeriesFilter>[] = [
  { value: 'standalone', label: 'Standalone', icon: 'mdi-book-open-page-variant' },
  { value: 'series', label: 'Series', icon: 'mdi-bookshelf' },
]

export const POPULARITY_OPTIONS: FilterOption<Popularity>[] = [
  { value: 'popular', label: 'Popular', icon: 'mdi-fire', description: '>100 readers' },
  { value: 'hidden_gem', label: 'Hidden Gem', icon: 'mdi-diamond-stone', description: '<50 readers' },
]
