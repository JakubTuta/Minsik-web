import type { Book, BookSummary } from '~/types/api'

export type Rarity = 'legendary' | 'ultra_rare' | 'super_rare' | 'rare' | 'uncommon' | 'common'

export const RARITY_ORDER: Record<Rarity, number> = {
  legendary: 6,
  ultra_rare: 5,
  super_rare: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
}

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

export interface OpenCaseData {
  display_list: BookSummary[]
  winning_index: number
  winner: BookSummary
  winner_detail: Book
}

export type CasePhase = 'idle' | 'opening' | 'spinning' | 'revealing'

export interface OpenPackData {
  items: BookSummary[]
}

export type PackPhase = 'idle' | 'opening' | 'glow' | 'spread' | 'done'
