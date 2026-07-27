import process from 'node:process'
// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify'
import { APP_LOCALES, DEFAULT_LOCALE } from './locales.config'

// Nitro's routeRules match the raw request path — they know nothing about the
// i18n module's routing, so a rule for `/books/**` does not also cover the
// Polish `/pl/books/**`. Generating the locale-prefixed copies here means
// adding a language (a new APP_LOCALES entry) needs no routeRules edit.
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

// Production origin. Also the build-time default behind NUXT_PUBLIC_SITE_URL
// and NUXT_PUBLIC_I18N_BASE_URL, which must always name the same origin.
const SITE_URL = 'https://minsik.jtuta.cloud'

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

  // Runtime configuration
  runtimeConfig: {
    public: {
      // Google requires hreflang and canonical URLs to be fully qualified, and
      // `useLocaleHead()` prefixes its tags with i18n's own baseUrl — left
      // unset it emits path-only hrefs like `/pl/about`, which are ignored.
      // Lives in runtimeConfig so a non-production origin can override it the
      // same way siteUrl does; the two must always agree.
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

  // SSR configuration
  ssr: true,

  // App configuration
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

  // Self-hosted fonts (replaces render-blocking Google Fonts stylesheet)
  fonts: {
    families: [
      { name: 'Montserrat', provider: 'google', weights: [300, 400, 500, 600, 700, 800] },
      { name: 'Source Serif 4', provider: 'google', weights: [300, 400, 500, 600, 700], styles: ['normal', 'italic'] },
    ],
  },

  // Interface language. `prefix_except_default` puts every non-default locale
  // at `/xx/...` (default English stays unprefixed at `/`) so each language
  // has its own crawlable, indexable URL — required for multilingual SEO.
  // This is independent of a book's own content language: `?lang=xx` on a
  // book page still picks which translated edition to render regardless of
  // UI locale (see app/pages/books/[slug].vue), and the UI locale still
  // travels in the `pref_lang` cookie so SSR renders the right language on
  // first paint without waiting on the URL to be parsed.
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: DEFAULT_LOCALE,
    locales: APP_LOCALES,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'pref_lang',
      // A Secure cookie is dropped by the browser over plain http, which would
      // break the switcher on localhost, so only ask for it where TLS exists.
      cookieSecure: process.env.NODE_ENV === 'production',
      fallbackLocale: DEFAULT_LOCALE,
      alwaysRedirect: true,
      // Detect only at the root path — detecting on every path would hijack a
      // deep link a crawler or a shared URL points at, which is bad for SEO
      // and surprises a user who typed/clicked a specific-language URL.
      redirectOn: 'root',
    },
  },

  // Color mode configuration
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },

  // CSS configuration
  css: [
    'vuetify/styles',
    '~/assets/css/main.css',
  ],

  // Components configuration
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
  },

  // Build configuration
  build: {
    transpile: ['vuetify'],
  },

  // Route rules for SEO and caching. Each entry is also generated for every
  // non-default locale's prefixed path (e.g. `/pl/books/**`) — see
  // withLocalizedRouteRules above.
  routeRules: withLocalizedRouteRules({
    // Public content — SSR for SEO and fast first paint.
    //
    // `/` is cacheable only because server/middleware/root-locale-redirect
    // settles the locale ahead of the render handler, leaving nothing but
    // default-locale HTML for the cache to hold. Nitro keys this cache on the
    // path alone and stores 3xx as readily as 200, so a redirect emitted from
    // inside the render handler would be replayed to every later visitor.
    // Read that middleware before changing anything here or in
    // `detectBrowserLanguage`.
    '/': { ssr: true, swr: 300 },
    '/books/**': { ssr: true },
    '/authors/**': { ssr: true },
    '/series/**': { ssr: true },
    '/search': { ssr: true },
    '/categories': { ssr: true },
    '/recommendations/**': { ssr: true },
    '/bookshelf/**': { ssr: true },
    '/about': { ssr: true },
    '/privacy-policy': { ssr: true },
    '/terms-of-service': { ssr: true },

    // Interactive pages — no SEO content, no data fetching
    '/open-case': { ssr: false },
    '/open-pack': { ssr: false },
    '/play-slots': { ssr: false },
    '/discover': { ssr: false },

    // Auth-required pages — skip SSR, client-only, keep out of search results
    '/auth/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/dashboard': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/admin': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/bookshelf': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/favourites': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/ratings': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/comments': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/year-in-review': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  }),

  // Sitemap — static routes + dynamic book/author/series URLs from API
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    cacheMaxAgeSeconds: 3600,
    exclude: [
      '/auth/**',
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
    ],
  },

  nitro: {
    preset: 'bun',
  },
})
