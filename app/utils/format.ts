export function weightedRating(avgRating: number | undefined, ratingCount: number | undefined, olAvgRating: number | undefined, olRatingCount: number | undefined): number {
  if (avgRating === undefined || ratingCount === undefined)
    return olAvgRating ?? 0

  if (olAvgRating === undefined || olRatingCount === undefined)
    return avgRating ?? 0

  const total = ratingCount + olRatingCount
  if (total === 0)
    return 0

  return ((avgRating * ratingCount) + (olAvgRating * olRatingCount)) / total
}

export function totalRatingCount(ratingCount: number | undefined, olRatingCount: number | undefined): number {
  return (ratingCount ?? 0) + (olRatingCount ?? 0)
}

export function totalReaders(appWantToRead?: number, appReading?: number, appRead?: number, olWantToRead?: number, olCurrentlyReading?: number, olAlreadyRead?: number): number {
  return (appWantToRead ?? 0) + (appReading ?? 0) + (appRead ?? 0)
    + (olWantToRead ?? 0) + (olCurrentlyReading ?? 0) + (olAlreadyRead ?? 0)
}

export function formatDisplayDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatRelativeTime(dateStr: string, t: (key: string, named?: Record<string, unknown>) => string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1)
    return t('time.justNow')
  if (minutes < 60)
    return t('time.minutesAgoCompact', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return t('time.hoursAgoCompact', { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 30)
    return t('time.daysAgoCompact', { n: days })

  return formatDisplayDate(dateStr, locale)
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
