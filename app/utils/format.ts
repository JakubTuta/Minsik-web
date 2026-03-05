export function weightedRating(avgRating: number, ratingCount: number, olAvgRating?: string | null, olRatingCount?: number): number {
  const olRating = Number(olAvgRating ?? 0)
  const olCount = olRatingCount ?? 0
  const total = ratingCount + olCount
  if (total === 0)
    return 0
  return ((avgRating * ratingCount) + (olRating * olCount)) / total
}

export function totalRatingCount(ratingCount: number, olRatingCount?: number): number {
  return ratingCount + (olRatingCount ?? 0)
}

export function totalReaders(appWantToRead?: number, appReading?: number, appRead?: number, olWantToRead?: number, olCurrentlyReading?: number, olAlreadyRead?: number): number {
  return (appWantToRead ?? 0) + (appReading ?? 0) + (appRead ?? 0)
    + (olWantToRead ?? 0) + (olCurrentlyReading ?? 0) + (olAlreadyRead ?? 0)
}

export function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Converts text to title case (first letter of each word uppercase, rest lowercase)
 * @param text - The text to convert
 * @returns The text in title case
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
