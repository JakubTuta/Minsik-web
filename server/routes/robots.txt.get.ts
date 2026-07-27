import { APP_LOCALES, DEFAULT_LOCALE } from '~~/locales.config'

/**
 * robots.txt, generated so that every locale is covered.
 *
 * A private area lives at `/dashboard` in the default locale and at
 * `/xx/dashboard` in every other one. A static file would list only the
 * default-locale paths, and each added language would silently open its
 * translated copies to crawlers — the `X-Robots-Tag` headers in
 * `nuxt.config.ts` keep them out of the index either way, but only after they
 * have been crawled.
 */
const PRIVATE_PATHS = [
  '/auth/',
  '/dashboard',
  '/admin',
  '/bookshelf',
  '/favourites',
  '/ratings',
  '/comments',
  '/year-in-review',
  '/open-case',
  '/open-pack',
  '/play-slots',
]

// Public profiles live under `/bookshelf/<username>`; only the signed-in user's
// own shelf at `/bookshelf` stays out.
const PUBLIC_PATHS = ['/bookshelf/']

// Bots that train on or resell content rather than sending readers back.
const BLOCKED_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'anthropic-ai',
  'ClaudeBot',
  'Claude-Web',
  'Google-Extended',
  'Bytespider',
  'Amazonbot',
  'Applebot-Extended',
  'meta-externalagent',
]

function localizedPaths(paths: string[]): string[] {
  return paths.flatMap(path => [
    path,
    ...APP_LOCALES
      .filter(locale => locale.code !== DEFAULT_LOCALE)
      .map(locale => `/${locale.code}${path}`),
  ])
}

export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig().public.siteUrl as string

  const lines = [
    'User-Agent: *',
    ...localizedPaths(PRIVATE_PATHS).map(path => `Disallow: ${path}`),
    ...localizedPaths(PUBLIC_PATHS).map(path => `Allow: ${path}`),
    '',
    ...BLOCKED_AGENTS.flatMap(agent => [`User-agent: ${agent}`, 'Disallow: /', '']),
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ]

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  return lines.join('\n')
})
