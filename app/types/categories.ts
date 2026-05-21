import type { BookSummary } from '~/types/api'

export interface Category {
  slug: string
  name: string
}

export interface CategoryBooksData {
  books: BookSummary[]
  total_count: number
}

export interface PopularCategory {
  slug: string
  name: string
  book_count: number
}
