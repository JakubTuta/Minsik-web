export function formatReadingTime(pages: number | null | undefined): string | null {
  if (!pages || pages <= 0)
    return null

  const minutes = pages
  if (minutes < 60)
    return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  return remainder > 0
    ? `${hours}h ${remainder}min`
    : `${hours}h`
}
