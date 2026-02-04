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
      apiBase: process.env.API_BASE_URL || 'http://localhost:8040',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      siteName: 'Minsik',
      siteDescription: 'Discover your next favorite book through emotional reading profiles and book influence networks.',
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
    '/': { prerender: true },
    '/books/**': { swr: 3600 },
    '/authors/**': { swr: 3600 },
    '/series/**': { swr: 3600 },
    '/search': { ssr: true },
  },
})
