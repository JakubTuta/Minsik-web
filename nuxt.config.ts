import process from 'node:process'
import vuetify from 'vite-plugin-vuetify'
import { APP_LOCALES, DEFAULT_LOCALE } from './locales.config'

function withLocalizedRouteRules<T>(rules: Record<string, T>): Record<string, T> {
  const localized: Record<string, T> = { ...rules }
  for (const entry of APP_LOCALES) {
    if (entry.code === DEFAULT_LOCALE)
      continue
    for (const [path, rule] of Object.entries(rules)) {
      localized[path === '/'
        ? `/${entry.code}`
        : `/${entry.code}${path}`] = rule
    }
  }

  return localized
}

const SITE_URL = 'https://minsik.jtuta.cloud'

// Entity pages are cached by the reverse proxy, not by Nitro's `swr`. Nitro's
// cache storage defaults to the in-process memory driver — a Map with no size
// cap and no eviction — so a catalogue this size, crawled across every locale,
// grows it until the container is OOM-killed. `s-maxage` hands the same
// stale-while-revalidate behaviour to nginx, which bounds it on disk by LRU.
const ENTITY_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

// @nuxtjs/sitemap aborts an internal source after 5s unless the source carries
// its own timeout, and a cold build pages the whole capped slice out of the
// API. Losing that race publishes an index of nothing but an error string.
function sitemapSource(entity: string): [string, { timeout: number }] {
  return [`/api/__sitemap__/urls?entity=${entity}`, { timeout: 120000 }]
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  site: {
    url: SITE_URL,
    name: 'Minsik',
  },

  modules: [
    '@pinia/nuxt',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins = config.plugins || []
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],

  runtimeConfig: {
    apiBaseInternal: '',
    public: {
      i18n: {
        baseUrl: SITE_URL,
      },
      apiBase: 'http://localhost:8040',
      siteUrl: SITE_URL,
      siteName: 'Minsik',
      siteDescription: 'Discover your next favorite book through emotional reading profiles and book influence networks.',
      googleClientId: '',
    },
  },

  ssr: true,

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#FF9B71' },
        { property: 'og:site_name', content: 'Minsik' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://covers.openlibrary.org' },
      ],
    },
  },

  fonts: {
    defaults: {
      subsets: ['latin', 'latin-ext'],
      preload: true,
    },
    families: [
      { name: 'Montserrat', provider: 'google', weights: [400, 500, 700, 800], styles: ['normal'] },
      { name: 'Roboto', provider: 'none' },
    ],
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: DEFAULT_LOCALE,
    locales: APP_LOCALES,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'pref_lang',
      cookieSecure: process.env.NODE_ENV === 'production',
      fallbackLocale: DEFAULT_LOCALE,
      alwaysRedirect: true,
      redirectOn: 'root',
    },
    bundle: { fullInstall: false },
    experimental: {
      preload: false,
      compactRoutes: true,
      prerenderMessages: true,
      cacheLifetime: 86400,
      httpCacheDuration: 86400,
    },
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    disableTransition: true,
    storage: 'cookie',
  },

  css: [
    'vuetify/styles',
    '~/assets/css/main.css',
  ],

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
  },

  build: {
    transpile: ['vuetify'],
  },

  routeRules: withLocalizedRouteRules({
    '/': { ssr: true, swr: 600 },
    '/categories': { ssr: true, swr: 600 },
    '/books/**': { ssr: true, headers: { 'cache-control': ENTITY_CACHE_CONTROL } },
    '/authors/**': { ssr: true, headers: { 'cache-control': ENTITY_CACHE_CONTROL } },
    '/series/**': { ssr: true, headers: { 'cache-control': ENTITY_CACHE_CONTROL } },
    '/search': { ssr: true },
    '/recommendations/**': { ssr: true },
    '/bookshelf/**': { ssr: true },
    '/about': { ssr: true },
    '/privacy-policy': { ssr: true },
    '/terms-of-service': { ssr: true },
    '/discover': { ssr: true },
    '/open-case': { ssr: true },
    '/open-pack': { ssr: true },
    '/play-slots': { ssr: true },
    '/_i18n/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },

    '/auth/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/dashboard': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/admin': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/bookshelf': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/favourites': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/ratings': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/comments': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/year-in-review': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  }),

  sitemap: {
    cacheMaxAgeSeconds: 3600,
    defaultSitemapsChunkSize: 10000,
    sitemaps: {
      pages: { includeAppSources: true },
      books: { sources: [sitemapSource('books')], chunks: true },
      authors: { sources: [sitemapSource('authors')], chunks: true },
      series: { sources: [sitemapSource('series')], chunks: true },
    },
    exclude: [
      '/auth/**',
      '/dashboard',
      '/admin',
      '/admin/**',
      '/bookshelf',
      '/favourites',
      '/ratings',
      '/comments',
      '/year-in-review',
    ],
  },

  nitro: {
    preset: 'bun',
    compressPublicAssets: { gzip: true, brotli: true },
  },
})
