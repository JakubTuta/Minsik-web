import type { Book } from '~/types/api'

export type BookshelfStatus = 'want_to_read' | 'reading' | 'read' | 'abandoned'

export interface BookshelfEntry {
  book: Book
  status: BookshelfStatus
  is_favourite: boolean
  created_at: string
  updated_at: string
}

export interface FavouriteEntry {
  book: Book
  created_at: string
}

export interface RatingEntry {
  book: Book
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

export interface CommentEntry {
  comment_id: number
  book: Book
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
  user_id?: number
  user?: BookCommentUser
  username: string
  body: string
  is_spoiler: boolean
  rating?: BookCommentRating | null
  comment_created_at: string
  comment_updated_at: string
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
