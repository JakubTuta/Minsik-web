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
    // Server-only. In-cluster gateway address for SSR data fetches, so they
    // stay on the internal Docker network instead of hairpinning out over
    // public TLS to the public apiBase and back in. Empty default falls back
    // to public.apiBase for local dev where there is no internal network.
    apiBaseInternal: '',
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

  // Self-hosted fonts (replaces render-blocking Google Fonts stylesheet).
  // One family app-wide — `latin`/`latin-ext` cover every shipped locale
  // (en/pl/de/es/fr), so the other 5 default subsets are dead weight.
  // Weights match actual usage (font-weight-bold/medium/black classes);
  // Vuetify declares `Roboto` internally but nothing renders it, so it's
  // pinned to `none` rather than silently downloaded.
  // `styles: ['normal']` drops the italic faces — the default fetches both,
  // and Nuxt's preload heuristic picked the latin-ext ITALIC face (72KB) over
  // the normal one. The only italic usage in the app is one decorative quote
  // line (BookOfTheWeekCard's `.bow-quote`), not worth a dedicated face; the
  // browser's synthetic-oblique fallback covers it.
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
    // Composition-API-only build tree-shakes vue-i18n's Options API glue and
    // built-in components/directives we never use.
    bundle: { fullInstall: false },
    experimental: {
      // OFF. `preload: true` used to fan out ALL 5 locales into every SSR
      // response (5 internal fetches + ~265KB parse/merge + 306KB inlined
      // devalue blob), on every request, regardless of active locale — measured
      // as the single largest cost in the app's TTFB. With this off, SSR loads
      // only the active locale via loadMessagesFromServer (one Nitro-cached
      // fetch); client fetches its own locale from the prerendered static file
      // below. Net: one cacheable ~50KB fetch instead of 306KB inlined + 5
      // server round-trips.
      preload: false,
      // One regex route per page instead of one per (page x locale).
      compactRoutes: true,
      // Static hashed messages.json instead of the Nitro /_i18n route, so a
      // locale switch after the first load is a cached static-asset fetch.
      prerenderMessages: true,
      cacheLifetime: 86400,
      httpCacheDuration: 86400,
    },
  },

  // Color mode configuration. `disableTransition` stops the browser from
  // animating every `transition:` rule in the app at once during the class
  // swap on toggle — Vuetify's own theme.change() handles the swap itself.
  // `storage: 'cookie'` (default is `localStorage`) is what lets the SERVER
  // render the user's actual last-picked theme instead of always guessing
  // `fallback` — `localStorage` is invisible to SSR, so with `preference:
  // 'system'` the server can never resolve it and always ships light-mode
  // HTML, correcting to the real theme only after client JS runs.
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    disableTransition: true,
    storage: 'cookie',
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
    // `/` and `/categories` are swr-cached. Nitro keys the cache on request
    // path alone, so this only works because the HTML is now visitor-
    // independent: theme is pinned to a fixed default in the compiled
    // stylesheet (app/plugins/vuetify.ts) rather than stamped from the
    // reader's colour-mode cookie, and locale already has its own path
    // (server/middleware/root-locale-redirect settles it before the render
    // handler runs). Any component that still renders theme- or user-
    // specific markup into SSR HTML breaks this cache — see "Impact on the
    // rest of the app" in the perf plan for the full audit.
    '/': { ssr: true, swr: 600 },
    '/categories': { ssr: true, swr: 600 },
    '/books/**': { ssr: true, swr: 3600 },
    '/authors/**': { ssr: true, swr: 3600 },
    '/series/**': { ssr: true, swr: 3600 },
    '/search': { ssr: true },
    '/recommendations/**': { ssr: true },
    '/bookshelf/**': { ssr: true },
    '/about': { ssr: true },
    '/privacy-policy': { ssr: true },
    '/terms-of-service': { ssr: true },
    '/_i18n/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },

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
    compressPublicAssets: { gzip: true, brotli: true },
  },
})
