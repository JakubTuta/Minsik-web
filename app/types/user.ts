export type BookshelfStatus = 'want_to_read' | 'reading' | 'read' | 'abandoned'

export interface BookshelfEntry {
  book_id: number
  book_slug: string
  book_title: string
  book_cover_url?: string | null
  book_author_names: string[]
  book_author_slugs: string[]
  book_series_name: string | null
  book_series_slug: string | null
  status: BookshelfStatus
  is_favourite: boolean
  created_at: string
  updated_at: string
}

export interface FavouriteEntry {
  book_id: number
  book_slug: string
  book_title: string
  book_cover_url?: string | null
  book_author_names: string[]
  book_author_slugs: string[]
  book_series_name: string | null
  book_series_slug: string | null
  status: BookshelfStatus
  created_at: string
  updated_at: string
}

export interface RatingEntry {
  book_id: number
  book_slug: string
  book_title: string
  book_cover_url?: string | null
  book_author_names: string[]
  book_author_slugs: string[]
  overall_rating: number
  review_text?: string | null
  pacing?: number | null
  emotional_impact?: number | null
  intellectual_depth?: number | null
  writing_quality?: number | null
  rereadability?: number | null
  readability?: number | null
  plot_complexity?: number | null
  humor?: number | null
  created_at: string
  updated_at: string
  book_avg_rating?: number
  book_rating_count?: number
}

export interface CommentEntry {
  comment_id: number
  book_id: number
  book_slug: string
  book_title: string
  book_cover_url?: string | null
  book_author_names: string[]
  book_author_slugs: string[]
  book_series_name: string | null
  book_series_slug: string | null
  body: string
  is_spoiler: boolean
  created_at: string
  updated_at: string
}

export interface BookCommentUser {
  user_id: number
  username: string
  display_name?: string | null
  avatar_url?: string | null
}

export interface BookCommentRating {
  overall_rating: number
  review_text?: string | null
  pacing?: number | null
  emotional_impact?: number | null
  intellectual_depth?: number | null
  writing_quality?: number | null
  rereadability?: number | null
  readability?: number | null
  plot_complexity?: number | null
  humor?: number | null
}

export interface BookComment {
  comment_id: number
  user_id: number
  username: string
  book_id: number
  book_slug: string
  body: string
  is_spoiler: boolean
  comment_created_at: string
  comment_updated_at: string
  rating?: BookCommentRating | null
  // Optional extended user info (client-side enrichment)
  user?: BookCommentUser
}

export interface UserPublicProfile {
  user_id: number
  username: string
  display_name?: string | null
  avatar_url?: string | null
  bio?: string | null
}

// GET /api/v1/users/me/books/{book_slug} response
export interface UserBookBookshelf {
  bookshelf_id: number
  user_id: number
  book_id: number
  book_slug: string
  book_title: string
  book_cover_url: string
  status: BookshelfStatus
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface UserBookRating {
  rating_id: number
  user_id: number
  book_id: number
  book_slug: string
  book_title: string
  book_cover_url: string
  overall_rating: number
  review_text?: string | null
  pacing?: number | null
  emotional_impact?: number | null
  intellectual_depth?: number | null
  writing_quality?: number | null
  rereadability?: number | null
  readability?: number | null
  plot_complexity?: number | null
  humor?: number | null
  created_at: string
  updated_at: string
}

export interface UserBookComment {
  comment_id: number
  user_id: number
  book_id: number
  book_slug: string
  body: string
  is_spoiler: boolean
  created_at: string
  updated_at: string
}

export interface UserBookInfoData {
  bookshelf: UserBookBookshelf | null
  rating: UserBookRating | null
  comment: UserBookComment | null
}

export interface UserStats {
  want_to_read_count: number
  reading_count: number
  read_count: number
  abandoned_count: number
  favourites_count: number
  ratings_count: number
  comments_count: number
  finished_this_year_count: number
  pages_read_this_year: number
  hours_read_this_year: number
  bookshelf_updated_at: string
  favourites_updated_at: string
  comments_updated_at: string
  ratings_updated_at: string
  average_rating: number
  rating_distribution: Record<string, number>
  pages_read_total: number
  reviews_count: number
}

export interface OverviewBook {
  book_slug: string
  book_title: string
  book_cover_url: string
  book_author_names: string[]
  book_author_slugs: string[]
}

export interface TopGenre {
  name: string
  slug: string
  count: number
  percent: number
}

export interface FavouriteAuthor {
  name: string
  slug: string
  count: number
  photo_url?: string | null
}

export interface ProfileOverview {
  user: UserPublicProfile
  reading_now: OverviewBook | null
  top_genres: TopGenre[]
  favourite_authors: FavouriteAuthor[]
  favourites_this_year: OverviewBook[]
}

export interface BookCommentsListData {
  items: BookComment[]
  total_count: number
  limit: number
  offset: number
  my_entry?: BookComment | null
}
