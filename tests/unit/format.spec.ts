import { describe, expect, it } from 'vitest'
import {
  bookRarity,
  formatSeriesPosition,
  rarityFromRating,
  totalRatingCount,
  totalReaders,
  toTitleCase,
  weightedRating,
} from '../../app/utils/format'

describe('weightedRating', () => {
  it('falls back to the OpenLibrary average when the app has no rating', () => {
    expect(weightedRating(undefined, undefined, 4.2, 100)).toBe(4.2)
    expect(weightedRating(undefined, undefined, undefined, undefined)).toBe(0)
  })

  it('uses the app average when OpenLibrary has no rating', () => {
    expect(weightedRating(4.8, 10, undefined, undefined)).toBe(4.8)
  })

  it('weights both averages by their counts', () => {
    expect(weightedRating(5, 1, 4, 3)).toBe(4.25)
  })

  it('returns 0 when both counts are zero', () => {
    expect(weightedRating(5, 0, 4, 0)).toBe(0)
  })
})

describe('totalRatingCount', () => {
  it('treats missing counts as zero', () => {
    expect(totalRatingCount(undefined, 7)).toBe(7)
    expect(totalRatingCount(3, undefined)).toBe(3)
  })
})

describe('totalReaders', () => {
  it('sums app and OpenLibrary shelf counts', () => {
    expect(totalReaders(1, 2, 3, 4, 5, 6)).toBe(21)
    expect(totalReaders()).toBe(0)
  })
})

describe('rarityFromRating', () => {
  it('maps ratings onto tiers at the documented thresholds', () => {
    expect(rarityFromRating(4.8)).toBe('legendary')
    expect(rarityFromRating(4.75)).toBe('ultra_rare')
    expect(rarityFromRating(4.5)).toBe('super_rare')
    expect(rarityFromRating(4)).toBe('rare')
    expect(rarityFromRating(3.25)).toBe('uncommon')
    expect(rarityFromRating(2.25)).toBe('common')
  })
})

describe('bookRarity', () => {
  it('prefers a rarity the server already computed', () => {
    expect(bookRarity({ rarity: 'legendary', avg_rating: 1, rating_count: 100 })).toBe('legendary')
  })

  it('derives the tier from the combined rating otherwise', () => {
    expect(bookRarity({ avg_rating: 5, rating_count: 1, ol_avg_rating: 4, ol_rating_count: 3 })).toBe('super_rare')
  })
})

describe('formatSeriesPosition', () => {
  it('is empty for a missing position', () => {
    expect(formatSeriesPosition(null)).toBe('')
    expect(formatSeriesPosition(undefined)).toBe('')
    expect(formatSeriesPosition(0)).toBe('')
  })

  it('drops the decimal on whole positions and keeps one otherwise', () => {
    expect(formatSeriesPosition(3)).toBe('#3')
    expect(formatSeriesPosition(2.5)).toBe('#2.5')
  })
})

describe('toTitleCase', () => {
  it('upper-cases the first letter of every word', () => {
    expect(toTitleCase('SCIENCE fiction')).toBe('Science Fiction')
  })
})
