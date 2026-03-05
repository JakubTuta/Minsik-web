import type { AuthorMinimal } from '~/types/api'

export type Rarity = 'legendary' | 'ultra_rare' | 'super_rare' | 'rare' | 'uncommon' | 'common'

export const RARITY_COLORS: Record<Rarity, string> = {
  legendary: '#FFD700',
  ultra_rare: '#FF4444',
  super_rare: '#FF69B4',
  rare: '#9B59B6',
  uncommon: '#3498DB',
  common: '#95A5A6',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  legendary: 'Legendary',
  ultra_rare: 'Ultra Rare',
  super_rare: 'Super Rare',
  rare: 'Rare',
  uncommon: 'Uncommon',
  common: 'Common',
}

export interface CaseBookItem {
  book_id: number
  title: string
  slug: string
  primary_cover_url: string
  authors: AuthorMinimal[]
  rarity: Rarity
  combined_rating: string
  avg_rating: string
  rating_count: number
  readers: number
}

export interface OpenCaseData {
  display_list: CaseBookItem[]
  winning_index: number
  winner: CaseBookItem
  winner_detail: Record<string, any>
}

export type CasePhase = 'idle' | 'opening' | 'spinning' | 'revealing'
