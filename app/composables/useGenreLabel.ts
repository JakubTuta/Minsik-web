const DASH_RE = /-/g
const WORD_START_RE = /\b\w/g

/**
 * Translates a genre/category slug (e.g. "high-fantasy") into a display label.
 * `books.genres` is far more granular than the curated `categoryNames.*` set
 * (14 browse categories), so most slugs fall back to a humanized version of
 * the slug itself rather than a translation — expected until more keys are added.
 */
export function useGenreLabel() {
  const { t, te } = useI18n()

  return (slug: string): string => {
    const key = `categoryNames.${slug}`

    return te(key)
      ? t(key)
      : slug.replace(DASH_RE, ' ').replace(WORD_START_RE, c => c.toUpperCase())
  }
}
