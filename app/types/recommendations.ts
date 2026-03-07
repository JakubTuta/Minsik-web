// Recommendation Category Keys

export type RecommendationSectionKey
  = | 'most_read'
    | 'most_wanted'
    | 'trending_reads'
    | 'most_viewed'
    | 'highest_rated'
    | 'community_top_rated'
    | 'most_rated'
    | 'recently_added'
    | 'classics'
    | 'user_favorites'
    | 'recently_finished'
    | 'currently_reading'
    | 'best_writing'
    | 'most_emotional'
    | 'funniest'
    | 'most_thought_provoking'
    | 'most_rereadable'
    | 'top_authors'
    | 'popular_authors'

// Item schemas

export interface RecommendationBookItem {
  book_id: number
  title: string
  slug: string
  language: string
  primary_cover_url: string | null
  author_names: string[]
  author_slugs: string[]
  avg_rating: number
  rating_count: number
  score: number
}

export interface RecommendationAuthorItem {
  author_id: number
  name: string
  slug: string
  photo_url: string | null
  book_count: number
  score: number
}

export interface RecommendationSection {
  key: string
  display_name: string
  item_type: 'book' | 'author'
  book_items: RecommendationBookItem[] | null
  author_items: RecommendationAuthorItem[] | null
  total: number
}

// Response wrappers

export interface HomePageData {
  sections: RecommendationSection[]
}

export interface HomePageResponse {
  success: boolean
  data: HomePageData
  error?: { code: string, message: string } | null
}

export interface RecommendationListResponse {
  success: boolean
  data: RecommendationSection
  error?: { code: string, message: string } | null
}

// Category info (from /recommendations/categories)

export interface CategoryInfo {
  category: string
  display_name: string
  item_type: 'book' | 'author'
}

export interface AvailableCategoriesData {
  categories: CategoryInfo[]
}

export interface AvailableCategoriesResponse {
  success: boolean
  data: AvailableCategoriesData
  error?: { code: string, message: string } | null
}
