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
      siteUrl: 'http://localhost:3040',
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
      title: 'Minsik - Discover Your Next Favorite Book',
      meta: [
        { name: 'description', content: 'Discover books through emotional reading profiles and influence networks.' },
        { name: 'theme-color', content: '#FF9B71' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://covers.openlibrary.org' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,300;1,8..60,400;1,8..60,500;1,8..60,600&display=swap' },
      ],
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
    '@mdi/font/css/materialdesignicons.css',
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
    // Public content — SSR for SEO and fast first paint
    '/': { ssr: true },
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

    // Auth-required pages — skip SSR, client-only
    '/auth/**': { ssr: false },
    '/dashboard': { ssr: false },
    '/admin': { ssr: false },
    '/bookshelf': { ssr: false },
    '/favourites': { ssr: false },
    '/ratings': { ssr: false },
    '/comments': { ssr: false },
  },

  nitro: {
    preset: 'bun',
  },
})
