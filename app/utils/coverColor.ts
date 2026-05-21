// Deterministic hex color from input strings (book title, author, series, etc.)
// Uses FNV-1a 32-bit hash, maps to HSL with constrained S/L for readable backgrounds, returns hex.

function fnv1a(str: string): number {
  let h = 0x811C9DC5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }

  return h >>> 0
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))

    return Math.round(c * 255).toString(16).padStart(2, '0')
  }

  return `#${f(0)}${f(8)}${f(4)}`
}

export function hashColor(...parts: (string | null | undefined)[]): string {
  const key = parts.filter(Boolean).join('::') || 'minsik'
  const h = fnv1a(key)
  const hue = h % 360
  const sat = 0.45 + ((h >>> 9) % 20) / 100
  const light = 0.55 + ((h >>> 17) % 15) / 100

  return hslToHex(hue, sat, light)
}

interface CoverSource {
  title?: string | null
  author_name?: string | null
  authors?: { name?: string | null }[] | null
  series_name?: string | null
  series?: { name?: string | null } | null
}

export function coverColor(src?: CoverSource | null, ...extra: (string | null | undefined)[]): string {
  if (!src)
    return hashColor(...extra)
  const author = src.author_name
    || src.authors?.map(a => a?.name).filter(Boolean).join(',')
    || null
  const series = src.series_name || src.series?.name || null

  return hashColor(src.title, author, series, ...extra)
}
