import type { BookSummary } from '~/types/api'

export interface SubGenre {
  slug: string
  name: string
}

export interface Category {
  slug: string
  name: string
  sub_genres: SubGenre[]
}

export interface CategoryBooksData {
  books: BookSummary[]
  total_count: number
}
