// Covers and author photos are stored as covers.openlibrary.org URLs, which
// answer every request with a 302 to archive.org and a second 302 to a storage
// node that extracts the file out of a ZIP — three HTTP/1.1 origins per image,
// 3-8s each, and a 502 often enough to matter. `/covers/` is the reverse proxy
// on our own origin that walks that chain once and caches the bytes, so the
// browser sees one same-origin HTTP/2 request instead.
const OPEN_LIBRARY_COVER = /^https?:\/\/covers\.openlibrary\.org\/([ab])\/id\/(\d+)-[SML]\.jpg$/i

export type CoverSize = 'S' | 'M' | 'L'

// OpenLibrary renders S at ~45px wide, M at ~180px and L at ~500px. Thresholds
// are half the largest size each tier covers acceptably on a 2x display.
function sizeForWidth(width: number): CoverSize {
  if (width <= 40)
    return 'S'
  if (width <= 110)
    return 'M'

  return 'L'
}

export function useCoverUrl() {
  function coverUrl(src: string | null | undefined, renderedWidth: number): string | undefined {
    if (!src)
      return undefined

    const match = OPEN_LIBRARY_COVER.exec(src)
    if (!match)
      return src

    const [, kind, id] = match

    return `/covers/${kind}/id/${id}-${sizeForWidth(renderedWidth)}.jpg`
  }

  return { coverUrl }
}
