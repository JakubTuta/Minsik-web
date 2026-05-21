// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
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

  // Vite configuration
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },

  // Route rules for SEO and caching
  routeRules: {
    '/': { ssr: true },
    '/books/**': { ssr: true },
    '/authors/**': { ssr: true },
    '/series/**': { ssr: true },
    '/search': { ssr: true },
    '/auth/**': { ssr: false },
    '/dashboard': { ssr: false },
    '/admin': { ssr: false },
    '/bookshelf': { ssr: false },
    '/favourites': { ssr: false },
    '/ratings': { ssr: false },
    '/comments': { ssr: false },
    '/open-case': { ssr: true },
    '/discover': { ssr: true },
  },

  nitro: {
    preset: 'bun',
  },
})
