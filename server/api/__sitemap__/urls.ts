import type { SitemapUrlInput } from '#sitemap/types'
import axios from 'axios'
import { APP_LOCALES, DEFAULT_LOCALE } from '~~/locales.config'
import { serializeQueryParams } from '~~/shared/utils/queryParams'

const LOCALE_BY_CODE = new Map(APP_LOCALES.map(entry => [entry.code, entry]))
const SITEMAP_LANGUAGES = APP_LOCALES.map(entry => entry.code)

const SITEMAP_ENTITIES = ['books', 'authors', 'series'] as const
type SitemapEntity = typeof SITEMAP_ENTITIES[number]

interface APIResponse<T> {
  success: boolean
  data: T | null
}

interface SitemapSlugsData {
  items: {
    slug: string
    updated_at: string | null
    language: string | null
    work_id: string | null
  }[]
  total_count: number
}

const SLUGS_PAGE_SIZE = 10000

/**
 * How far down each entity's popularity ranking the sitemap reaches. The
 * catalogue is far larger than these (462k works, 35k authors, 20k series) and
 * the caps are deliberately a small slice of it.
 *
 * Two reasons, and neither is the catalogue's size. Every URL listed here is
 * held in the Nitro cache for a day and materialised again — times five, for
 * the locale variants — whenever a sitemap file is rendered, so the cap is what
 * bounds this container's memory. And a domain this young is granted a crawl
 * budget of a few thousand URLs a day: a sitemap of every work spends that
 * budget on pages nobody searches for. Everything omitted here is still
 * reachable through category, author and series links, so it stays crawlable —
 * a sitemap ranks discovery, it does not gate it.
 *
 * Raise these only alongside a memory measurement.
 */
const ENTITY_CAPS: Record<SitemapEntity, number> = {
  books: 10000,
  authors: 5000,
  series: 2000,
}

/**
 * Path an edition is served at: the default locale unprefixed, every other
 * configured locale under its own prefix, matching `prefix_except_default`
 * and how the book page takes its content language from the UI locale.
 */
function editionPath(slug: string, language: string | null): string | null {
  if (!language || language === DEFAULT_LOCALE)
    return `/books/${slug}`

  return LOCALE_BY_CODE.has(language)
    ? `/${language}/books/${slug}`
    : null
}

/**
 * Books: one URL per edition, each carrying the other editions of the same work
 * as `alternatives`.
 *
 * A translation is only indexable if it has a URL of its own, and search
 * engines only understand two URLs as the same work in different languages if
 * each one points at the other. The module cannot infer this pairing itself:
 * every edition has its own slug, so swapping the locale prefix — which is all
 * `_i18nTransform` can do — would produce URLs that do not exist.
 */
function buildBookUrls(items: SitemapSlugsData['items']): SitemapUrlInput[] {
  const byWork = new Map<string, { path: string, language: string, lastmod: string | null }[]>()

  for (const item of items) {
    const path = editionPath(item.slug, item.language)
    if (!path)
      continue

    const work = item.work_id || item.slug
    const editions = byWork.get(work) ?? []
    // Two editions of one work can slugify identically; at the same path they
    // are one page, not two entries.
    if (editions.some(edition => edition.path === path))
      continue

    editions.push({
      path,
      language: item.language || DEFAULT_LOCALE,
      lastmod: item.updated_at,
    })
    byWork.set(work, editions)
  }

  const urls: SitemapUrlInput[] = []

  for (const editions of byWork.values()) {
    const alternatives = editions.flatMap((edition) => {
      const locale = LOCALE_BY_CODE.get(edition.language)

      return locale
        ? [{ hreflang: locale.language, href: edition.path }]
        : []
    })

    for (const edition of editions) {
      urls.push({
        loc: edition.path,
        ...(edition.lastmod
          ? { lastmod: edition.lastmod }
          : {}),
        ...(alternatives.length > 1
          ? { alternatives }
          : {}),
      })
    }
  }

  return urls
}

/**
 * Authors and series share one slug across languages, so each is a single page
 * that exists under every locale prefix — exactly what `_i18nTransform` expands,
 * alternates included.
 */
function buildSharedSlugUrls(
  items: SitemapSlugsData['items'],
  prefix: string,
): SitemapUrlInput[] {
  const seen = new Set<string>()
  const urls: SitemapUrlInput[] = []

  for (const item of items) {
    if (seen.has(item.slug))
      continue
    seen.add(item.slug)

    urls.push({
      loc: `${prefix}${item.slug}`,
      _i18nTransform: true,
      ...(item.updated_at
        ? { lastmod: item.updated_at }
        : {}),
    })
  }

  return urls
}

function buildUrls(entity: SitemapEntity, items: SitemapSlugsData['items']): SitemapUrlInput[] {
  if (entity === 'books')
    return buildBookUrls(items)

  return buildSharedSlugUrls(items, entity === 'authors'
    ? '/authors/'
    : '/series/')
}

/**
 * axios, not `$fetch`: under the bun preset `$fetch` resolves an absolute URL
 * through Bun's own fetch, which cannot reach the Docker service name the
 * in-cluster gateway is published under — it fails with a bare "Unable to
 * connect" while axios, on the Node compatibility layer, resolves it fine.
 * Every other SSR fetch already goes through axios for this reason.
 */
async function fetchEntityUrls(apiBase: string, entity: SitemapEntity): Promise<SitemapUrlInput[]> {
  const urls: SitemapUrlInput[] = []
  const cap = ENTITY_CAPS[entity]

  let offset = 0
  let total = Number.POSITIVE_INFINITY

  while (offset < Math.min(cap, total)) {
    const limit = Math.min(SLUGS_PAGE_SIZE, cap - offset)

    // eslint-disable-next-line no-await-in-loop
    const response = await axios.get<APIResponse<SitemapSlugsData>>(
      `${apiBase}/api/v1/sitemap/slugs`,
      {
        params: { entity, limit, offset, languages: SITEMAP_LANGUAGES },
        paramsSerializer: serializeQueryParams,
        timeout: 60000,
      },
    )
    const data = response.data.data
    if (!data || data.items.length === 0)
      break

    if (offset === 0 && data.total_count > 0)
      total = data.total_count

    urls.push(...buildUrls(entity, data.items))

    // A books page holds every edition of the works it covers, so it returns
    // more rows than it was asked for. Paging follows the page size requested,
    // never the row count.
    offset += limit
  }

  return urls
}

export default defineCachedEventHandler(async (event) => {
  const entity = String(getQuery(event).entity ?? '')

  if (!SITEMAP_ENTITIES.includes(entity as SitemapEntity)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unknown sitemap entity: ${entity}`,
    })
  }

  const config = useRuntimeConfig()
  const apiBase = (config.apiBaseInternal || config.public.apiBase) as string

  try {
    return await fetchEntityUrls(apiBase, entity as SitemapEntity)
  }
  catch (error) {
    // Never degrade quietly: a swallowed failure here publishes a sitemap that
    // is missing an entire entity, which looks like a working sitemap.
    console.error(`[sitemap] failed to build ${entity} URLs`, error)
    throw error
  }
}, {
  name: 'sitemap-urls',
  getKey: event => String(getQuery(event).entity ?? ''),
  maxAge: 60 * 60,
  staleMaxAge: 60 * 60 * 24,
})
