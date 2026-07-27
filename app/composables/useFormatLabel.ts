/**
 * Translates a book format into a display label.
 *
 * The ingestion fetchers normalise to a small closed set (hardcover,
 * paperback, ebook, audiobook), but the OpenLibrary dump also writes
 * `physical_format` through verbatim, so arbitrary values like "mass market
 * paperback" reach the UI. Known formats get a translation; anything else
 * falls back to a title-cased version of the raw value, the same shape
 * [[useGenreLabel]] uses for the long tail of genres.
 */
export function useFormatLabel() {
  const { t, te } = useI18n()

  return (format: string): string => {
    const key = `bookFormats.${format}`

    return te(key)
      ? t(key)
      : toTitleCase(format)
  }
}
