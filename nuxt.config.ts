// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  site: {
    url: 'https://minsik.jtuta.cloud',
    name: 'Minsik',
  },

  modules: [
    '@pinia/nuxt',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
    '@nuxt/fonts',
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
      apiBase: 'http://localhost:8040',
      siteUrl: 'https://minsik.jtuta.cloud',
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
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Minsik - Discover Your Next Favorite Book',
      meta: [
        { name: 'description', content: 'Discover books through emotional reading profiles and influence networks.' },
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

  // Route rules for SEO and caching
  routeRules: {
    // Public content — SSR for SEO and fast first paint.
    // Auth is client-only, so SSR HTML is identical for all users — safe to cache with SWR.
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
  },

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
