import type { FavouriteAuthor, TopGenre } from '~/types/user'

export interface MonthlyBucket {
  month: number
  books_finished: number
  pages_read: number
  ratings_given: number
  books: YearBook[]
}

export interface YearBook {
  book_slug: string
  book_title: string
  book_cover_url: string
  author_names: string[]
  author_slugs: string[]
  number_of_pages: number
  finished_at: string
  my_rating: number | null
}

export interface YearInReview {
  year: number
  months_elapsed: number
  monthly: MonthlyBucket[]
  total_books_finished: number
  total_pages_read: number
  total_hours_read: number
  ratings_given: number
  reviews_written: number
  comments_written: number
  favourites_added: number
  average_rating_given: number
  rating_distribution: Record<string, number>
  top_genres: TopGenre[]
  top_authors: FavouriteAuthor[]
  longest_book: YearBook | null
  shortest_book: YearBook | null
  first_finished: YearBook | null
  highest_rated: YearBook | null
  average_pages_per_book: number
  busiest_month: number
  busiest_month_count: number
  average_days_to_finish: number
  currently_reading_count: number
  added_to_shelf_count: number
  finished_cover_urls: string[]
}
