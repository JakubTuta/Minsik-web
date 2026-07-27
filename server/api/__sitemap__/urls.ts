import type { SitemapUrlInput } from '#sitemap/types'
import { APP_LOCALES, DEFAULT_LOCALE } from '~~/locales.config'

const SUPPORTED_LOCALES = new Set(APP_LOCALES.map(entry => entry.code))

interface APIResponse<T> {
  success: boolean
  data: T | null
}

interface SitemapSlugsData {
  items: { slug: string, updated_at: string | null, language: string | null }[]
  total_count: number
}

interface HomeSection {
  book_items: { slug: string, author_slugs: string[] }[] | null
  author_items: { slug: string }[] | null
}

interface CategoryBook {
  slug: string
  authors: { slug: string }[]
}

// Category books endpoint rejects limit > 50. Only offset 0 is served from the
// API's Redis cache — deeper pages hit heavy DB queries that time out, so the
// fallback harvests just the first page per category.
const HARVEST_PAGES_PER_CATEGORY = 1
const PAGE_SIZE = 50
const CONCURRENCY = 7

// Backend slugs endpoint pagination — entities ordered by popularity, capped to keep the sitemap sane
const SLUGS_PAGE_SIZE = 10000
const ENTITY_CAPS: Record<string, number> = {
  books: 50000,
  authors: 50000,
  series: 10000,
}

async function fetchEntitySlugs(apiBase: string, entity: string): Promise<SitemapUrlInput[]> {
  const urls: SitemapUrlInput[] = []
  const seen = new Set<string>()
  const cap = ENTITY_CAPS[entity] ?? SLUGS_PAGE_SIZE
  const prefix = entity === 'books'
    ? '/books/'
    : entity === 'authors'
      ? '/authors/'
      : '/series/'

  let offset = 0
  let total = Number.POSITIVE_INFINITY

  while (offset < Math.min(cap, total)) {
    // eslint-disable-next-line no-await-in-loop
    const response = await $fetch<APIResponse<SitemapSlugsData>>(
      `${apiBase}/api/v1/sitemap/slugs`,
      { params: { entity, limit: SLUGS_PAGE_SIZE, offset }, timeout: 30000 },
    )
    const data = response.data
    if (!data || data.items.length === 0)
      break

    if (offset === 0 && data.total_count > 0)
      total = data.total_count

    for (const item of data.items) {
      // Each language edition lives at its own path: the default locale is
      // unprefixed, every other configured locale is UI-locale-prefixed —
      // matching the `prefix_except_default` i18n routing strategy, and
      // matching how the book/author/series pages default their content
      // language from the UI locale (see app/pages/books/[slug].vue).
      //
      // The catalogue holds editions in languages the app ships no locale for.
      // Those have no prefixed route, so they are served at the unprefixed
      // path; prefixing them anyway would fill the sitemap with 404s.
      const localePrefix = item.language
        && item.language !== DEFAULT_LOCALE
        && SUPPORTED_LOCALES.has(item.language)
        ? `/${item.language}`
        : ''
      // Dedupe on the resulting URL, not the slug: two editions of one work
      // often slugify identically, and whether that is a duplicate depends on
      // the locale prefix. Same path (two unconfigured-locale editions) is one
      // entry; `/books/x` and `/pl/books/x` are two distinct pages.
      const loc = `${localePrefix}${prefix}${item.slug}`
      if (seen.has(loc))
        continue
      seen.add(loc)

      urls.push({
        loc,
        ...(item.updated_at
          ? { lastmod: item.updated_at }
          : {}),
      })
    }

    offset += data.items.length
  }

  return urls
}

// Preferred path: dedicated backend endpoint exposing all public slugs ordered by popularity.
async function fetchFromSitemapEndpoint(apiBase: string): Promise<SitemapUrlInput[] | null> {
  try {
    const [books, authors, series] = await Promise.all([
      fetchEntitySlugs(apiBase, 'books'),
      fetchEntitySlugs(apiBase, 'authors'),
      fetchEntitySlugs(apiBase, 'series'),
    ])

    const urls = [...books, ...authors, ...series]

    return urls.length > 0
      ? urls
      : null
  }
  catch {
    return null
  }
}

// Fallback: harvest popular content from public endpoints (home sections + top of each category).
async function harvestPopularContent(apiBase: string): Promise<SitemapUrlInput[]> {
  const bookSlugs = new Set<string>()
  const authorSlugs = new Set<string>()

  try {
    const home = await $fetch<APIResponse<{ sections: HomeSection[] }>>(
      `${apiBase}/api/v1/recommendations/home`,
      { params: { items_per_category: 10 }, timeout: 15000 },
    )

    for (const section of home.data?.sections ?? []) {
      for (const book of section.book_items ?? []) {
        bookSlugs.add(book.slug)
        book.author_slugs.forEach(slug => authorSlugs.add(slug))
      }
      for (const author of section.author_items ?? []) {
        authorSlugs.add(author.slug)
      }
    }
  }
  catch { /* Section unavailable — continue with categories */ }

  try {
    const categoriesResponse = await $fetch<APIResponse<{ categories: { slug: string }[] }>>(
      `${apiBase}/api/v1/categories`,
      { timeout: 15000 },
    )
    const categories = categoriesResponse.data?.categories ?? []

    const pages = categories.flatMap(category => Array.from({ length: HARVEST_PAGES_PER_CATEGORY }, (_, page) => ({ category: category.slug, offset: page * PAGE_SIZE })),
    )

    // Limited concurrency — full parallel fan-out gets rate-limited by the API
    for (let i = 0; i < pages.length; i += CONCURRENCY) {
      const batch = pages.slice(i, i + CONCURRENCY)
      // eslint-disable-next-line no-await-in-loop
      const results = await Promise.allSettled(
        batch.map(({ category, offset }) => $fetch<APIResponse<{ books: CategoryBook[] }>>(
          `${apiBase}/api/v1/categories/${category}/books`,
          { params: { limit: PAGE_SIZE, offset, sort_by: 'popularity', order: 'desc' }, timeout: 30000 },
        ),
        ),
      )

      for (const result of results) {
        if (result.status !== 'fulfilled')
          continue
        for (const book of result.value.data?.books ?? []) {
          bookSlugs.add(book.slug)
          book.authors?.forEach(author => authorSlugs.add(author.slug))
        }
      }
    }
  }
  catch { /* Categories unavailable — return what we have */ }

  return [
    ...Array.from(bookSlugs, slug => ({ loc: `/books/${slug}` })),
    ...Array.from(authorSlugs, slug => ({ loc: `/authors/${slug}` })),
  ]
}

// Cached with SWR — the harvest takes seconds, so serve stale data and refresh in the background
export default defineCachedEventHandler(async () => {
  const apiBase = useRuntimeConfig().public.apiBase as string

  const fromEndpoint = await fetchFromSitemapEndpoint(apiBase)
  if (fromEndpoint && fromEndpoint.length > 0)
    return fromEndpoint

  return await harvestPopularContent(apiBase)
}, {
  name: 'sitemap-urls',
  maxAge: 60 * 60,
  staleMaxAge: 60 * 60 * 24,
})
