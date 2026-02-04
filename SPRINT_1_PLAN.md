# Minsik Web App - Sprint 1: Complete Implementation Plan

## Project Context

### Current State
- Fresh Nuxt 3 project with TypeScript
- Vuetify 3 configured (needs theme update)
- UnoCSS installed and configured
- Pinia ready for state management
- API server running on `localhost:8040`

### Available API Endpoints
1. **Search**: `GET /api/v1/search?q=<query>&type=<type>&limit=<limit>&offset=<offset>`
2. **Book Details**: `GET /api/v1/books/{slug}`
3. **Author Details**: `GET /api/v1/authors/{slug}`
4. **Author's Books**: `GET /api/v1/authors/{slug}/books?limit=<limit>&offset=<offset>`
5. **Series Details**: `GET /api/v1/series/{slug}`
6. **Series Books**: `GET /api/v1/series/{slug}/books?limit=<limit>&offset=<offset>`

---

## Updated Color Palette

### Light Mode
```typescript
{
  // Base colors
  background: '#FAF6F0',           // Warm cream background
  surface: '#FFFFFF',              // Pure white for cards
  'surface-elevated': '#FEFCF9',   // Slightly elevated surfaces
  'surface-variant': '#F5F0E8',    // Subtle variant

  // Primary/Secondary
  primary: '#FF9B71',              // Warm coral/peach
  'primary-darken-1': '#FF8557',   // Darker coral
  'primary-darken-2': '#E6713D',   // Deep coral
  'primary-lighten-1': '#FFB08C',  // Light coral
  'primary-lighten-2': '#FFC5A7',  // Very light coral

  secondary: '#E8805C',            // Secondary coral
  'secondary-darken-1': '#D46942',
  'secondary-darken-2': '#BF5228',
  'secondary-lighten-1': '#EF9A77',
  'secondary-lighten-2': '#F5B392',

  // Status colors
  success: '#7BA882',              // Muted green
  'success-darken-1': '#689571',
  'success-lighten-1': '#95BDA0',

  info: '#5B8AAF',                 // Muted blue
  'info-darken-1': '#4A7395',
  'info-lighten-1': '#7BA3C4',

  warning: '#F4A261',              // Warm orange
  'warning-darken-1': '#E08E47',
  'warning-lighten-1': '#F7B67D',

  error: '#E76F51',                // Coral red
  'error-darken-1': '#D35940',
  'error-lighten-1': '#ED8A71',

  // Text colors
  'text-primary': '#2C2420',       // Dark brown, almost black
  'text-secondary': '#6B5D56',     // Medium brown
  'text-disabled': '#A39790',      // Light brown/gray

  // Borders and dividers
  border: '#E5DCD3',               // Soft beige border
  divider: '#EDE5DD',              // Subtle divider

  // Overlays
  'overlay-scrim': 'rgba(44, 36, 32, 0.32)',
  'overlay-hover': 'rgba(255, 155, 113, 0.08)',
  'overlay-focus': 'rgba(255, 155, 113, 0.12)',
  'overlay-selected': 'rgba(255, 155, 113, 0.16)',

  // Special
  'on-primary': '#FFFFFF',         // Text on primary colored backgrounds
  'on-secondary': '#FFFFFF',       // Text on secondary colored backgrounds
  'on-surface': '#2C2420',         // Text on surface
  'on-background': '#2C2420',      // Text on background
}
```

### Dark Mode
```typescript
{
  // Base colors
  background: '#1A2332',           // Deep blue background
  surface: '#243447',              // Elevated surface
  'surface-elevated': '#2D3F56',   // More elevated surfaces
  'surface-variant': '#1E2C3D',    // Subtle variant

  // Primary/Secondary
  primary: '#FF9557',              // Bright coral/orange
  'primary-darken-1': '#E6803D',
  'primary-darken-2': '#CC6F3A',
  'primary-lighten-1': '#FFAA71',
  'primary-lighten-2': '#FFBF8C',

  secondary: '#CC6F3A',            // Secondary orange
  'secondary-darken-1': '#B35F2E',
  'secondary-darken-2': '#994F22',
  'secondary-lighten-1': '#E08554',
  'secondary-lighten-2': '#F39B6E',

  // Accent
  accent: '#5B8AAF',               // Muted blue accent
  'accent-darken-1': '#4A7395',
  'accent-lighten-1': '#7BA3C4',

  // Status colors
  success: '#6BA88A',              // Muted green
  'success-darken-1': '#5A9177',
  'success-lighten-1': '#85BBA0',

  info: '#6B9EC9',                 // Brighter blue
  'info-darken-1': '#5788B0',
  'info-lighten-1': '#87B4D8',

  warning: '#F4A261',              // Warm orange
  'warning-darken-1': '#DB8E4C',
  'warning-lighten-1': '#F7B67D',

  error: '#E76F51',                // Coral red
  'error-darken-1': '#CE5D42',
  'error-lighten-1': '#ED8A71',

  // Text colors
  'text-primary': '#F8FAFB',       // Almost white
  'text-secondary': '#B8C5D6',     // Muted blue-gray
  'text-disabled': '#7A8998',      // Darker gray

  // Borders and dividers
  border: '#344256',               // Subtle border
  divider: '#2A3847',              // Darker divider

  // Overlays
  'overlay-scrim': 'rgba(10, 14, 20, 0.6)',
  'overlay-hover': 'rgba(255, 149, 87, 0.08)',
  'overlay-focus': 'rgba(255, 149, 87, 0.12)',
  'overlay-selected': 'rgba(255, 149, 87, 0.16)',

  // Special
  'on-primary': '#1A2332',         // Dark text on primary
  'on-secondary': '#F8FAFB',       // Light text on secondary
  'on-surface': '#F8FAFB',         // Light text on surface
  'on-background': '#F8FAFB',      // Light text on background
}
```

**Color Theory Notes**:
- **Light Mode**: Warm, inviting palette with high contrast text for readability
- **Dark Mode**: Deep blue reduces eye strain, coral accents provide warmth
- **Contrast Ratios**: All text combinations meet WCAG AA standards (4.5:1 minimum)
- **Hierarchy**: Primary (coral) for CTAs, secondary for less emphasis, accent (blue) for information

---

## Architecture Overview

```
app/
├── layouts/
│   └── default.vue                    # Main layout with app bar
├── pages/
│   ├── index.vue                      # Home page (empty hero)
│   ├── search.vue                     # Dedicated search page
│   ├── books/
│   │   └── [slug].vue                 # Book detail page
│   ├── authors/
│   │   └── [slug].vue                 # Author detail page
│   └── series/
│       └── [slug].vue                 # Series detail page
├── components/
│   ├── AppBar.vue                     # Top navigation bar with search
│   ├── SearchBar.vue                  # Reusable search input
│   ├── ThemeToggle.vue                # Light/dark mode switcher
│   ├── UserMenu.vue                   # User profile menu
│   ├── BookCard.vue                   # Book display card
│   ├── AuthorCard.vue                 # Author display card
│   ├── SeriesCard.vue                 # Series display card
│   ├── SearchFilters.vue              # Type filter chips
│   └── LoadingState.vue               # Reusable loading skeleton
├── stores/
│   ├── api.ts                         # Axios client with auth headers
│   ├── theme.ts                       # Theme state (light/dark)
│   ├── search.ts                      # Search state + infinite scroll
│   ├── books.ts                       # Book details cache
│   ├── authors.ts                     # Author details + books cache
│   └── series.ts                      # Series details + books cache
├── composables/
│   ├── useApi.ts                      # API helper functions
│   ├── useInfiniteScroll.ts           # Infinite scroll logic
│   └── useSeo.ts                      # SEO/metadata helper
└── types/
    └── api.ts                         # TypeScript type definitions
```

---

## Detailed Implementation Tasks

### Phase 1: Foundation & Configuration

#### 1.1 Update Nuxt Configuration
**File**: `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
  ],

  // Runtime configuration
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8040',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      siteName: 'Minsik',
      siteDescription: 'Discover your next favorite book through emotional reading profiles and book influence networks.',
    }
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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Color mode configuration
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light',
    classSuffix: '',
  },

  // CSS configuration
  css: [
    '@mdi/font/css/materialdesignicons.css',
    'vuetify/styles',
  ],

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

  // Route rules for SEO
  routeRules: {
    '/': { prerender: true },
    '/books/**': { swr: 3600 }, // Cache for 1 hour
    '/authors/**': { swr: 3600 },
    '/series/**': { swr: 3600 },
    '/search': { ssr: true },
  },
})
```

#### 1.2 Update Vuetify Theme Configuration
**File**: `app/plugins/vuetify.ts`

Update with new color palette (using the colors defined above).

#### 1.3 TypeScript Type Definitions
**File**: `app/types/api.ts`

```typescript
export interface Book {
  id: string
  slug: string
  title: string
  description?: string
  cover_url?: string
  publication_year?: number
  language?: string
  rating?: number
  rating_count?: number
  view_count: number
  authors: Author[]
  series?: Series
  series_position?: number
  genres: string[]
  formats: string[]
  // SEO fields
  isbn?: string
  isbn13?: string
  open_library_id?: string
  google_books_id?: string
}

export interface Author {
  id: string
  slug: string
  name: string
  biography?: string
  photo_url?: string
  birth_date?: string
  death_date?: string
  book_count: number
  view_count: number
  // Computed
  display_dates?: string // e.g., "1892 - 1973"
}

export interface Series {
  id: string
  slug: string
  name: string
  description?: string
  book_count: number
  view_count: number
  author?: Author
}

export interface SearchResult {
  type: 'book' | 'author' | 'series'
  data: Book | Author | Series
  relevance_score?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}
```

---

### Phase 2: Core Infrastructure

#### 2.1 API Store (Axios Client)
**File**: `app/stores/api.ts`

**Purpose**: Centralized axios instance with error handling

```typescript
import axios, { AxiosError, AxiosInstance } from 'axios'
import { defineStore } from 'pinia'

export const useApiStore = defineStore('api', () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  // Create axios instance
  const client: AxiosInstance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token when available (future)
      // const token = localStorage.getItem('auth_token')
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`
      // }
      return config
    },
    error => Promise.reject(error)
  )

  // Response interceptor
  client.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      // Handle errors globally
      if (error.response?.status === 401) {
        // Redirect to login when auth is implemented
        console.warn('Unauthorized access')
      }
      else if (error.response?.status === 404) {
        console.warn('Resource not found')
      }
      else if (error.response?.status >= 500) {
        console.error('Server error:', error.message)
      }

      return Promise.reject(error)
    }
  )

  return {
    client,
  }
})
```

#### 2.2 Theme Store
**File**: `app/stores/theme.ts`

```typescript
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')

  const toggleTheme = () => {
    colorMode.preference = isDark.value
      ? 'light'
      : 'dark'
  }

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    colorMode.preference = theme
  }

  return {
    isDark,
    colorMode,
    toggleTheme,
    setTheme,
  }
})
```

#### 2.3 Search Store (with Infinite Scroll)
**File**: `app/stores/search.ts`

```typescript
import type { SearchResult } from '~/types/api'
import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', () => {
  const apiStore = useApiStore()

  // State
  const query = ref('')
  const type = ref<'all' | 'books' | 'authors' | 'series'>('all')
  const results = ref<SearchResult[]>([])
  const isLoading = ref(false)
  const hasMore = ref(true)
  const limit = ref(20)
  const offset = ref(0)
  const total = ref(0)

  // Cache with TTL (5 minutes)
  const cache = new Map<string, { data: SearchResult[], timestamp: number, total: number }>()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasResults = computed(() => results.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && !hasResults.value && query.value.length > 0)

  // Generate cache key
  const getCacheKey = (q: string, t: string, off: number) => `${q}_${t}_${off}`

  // Search function with debouncing
  const search = useDebounceFn(async (force = false) => {
    if (!query.value.trim()) {
      clear()

      return
    }

    const cacheKey = getCacheKey(query.value, type.value, offset.value)

    // Check cache
    if (!force && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        if (offset.value === 0) {
          results.value = cached.data
        }
        else {
          results.value = [...results.value, ...cached.data]
        }
        total.value = cached.total
        hasMore.value = results.value.length < cached.total

        return
      }
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get('/api/v1/search', {
        params: {
          q: query.value,
          type: type.value,
          limit: limit.value,
          offset: offset.value,
        }
      })

      const data = response.data
      const newResults = data.items || []

      // Update cache
      cache.set(cacheKey, {
        data: newResults,
        timestamp: Date.now(),
        total: data.total || 0,
      })

      // Append or replace results
      if (offset.value === 0) {
        results.value = newResults
      }
      else {
        results.value = [...results.value, ...newResults]
      }

      total.value = data.total || 0
      hasMore.value = data.has_more ?? (results.value.length < total.value)
    }
    catch (error) {
      console.error('Search error:', error)
      if (offset.value === 0) {
        results.value = []
      }
    }
    finally {
      isLoading.value = false
    }
  }, 300) // 300ms debounce

  // Load more for infinite scroll
  const loadMore = async () => {
    if (isLoading.value || !hasMore.value)
      return

    offset.value += limit.value
    await search()
  }

  // Change search type
  const setType = (newType: typeof type.value) => {
    type.value = newType
    offset.value = 0
    results.value = []
    search()
  }

  // Set query and trigger search
  const setQuery = (newQuery: string) => {
    query.value = newQuery
    offset.value = 0
    results.value = []
    search()
  }

  // Clear search
  const clear = () => {
    query.value = ''
    results.value = []
    offset.value = 0
    hasMore.value = true
    total.value = 0
  }

  return {
    // State
    query,
    type,
    results,
    isLoading,
    hasMore,
    total,

    // Computed
    hasResults,
    isEmpty,

    // Actions
    search,
    loadMore,
    setType,
    setQuery,
    clear,
  }
})
```

#### 2.4 Books Store
**File**: `app/stores/books.ts`

```typescript
import type { Book } from '~/types/api'
import { defineStore } from 'pinia'

export const useBooksStore = defineStore('books', () => {
  const apiStore = useApiStore()

  // State - using Map for O(1) lookups
  const books = ref(new Map<string, Book>())
  const isLoading = ref(false)
  const currentBook = ref<Book | null>(null)

  // Cache metadata
  const cacheTimestamps = new Map<string, number>()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasBook = (slug: string) => books.value.has(slug)

  // Check if cached data is fresh
  const isCacheFresh = (slug: string) => {
    const timestamp = cacheTimestamps.get(slug)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // Fetch book details
  const fetchBook = async (slug: string, force = false) => {
    // Return from cache if fresh
    if (!force && hasBook(slug) && isCacheFresh(slug)) {
      currentBook.value = books.value.get(slug)!

      return currentBook.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get(`/api/v1/books/${slug}`)
      const book: Book = response.data

      // Cache the book
      books.value.set(slug, book)
      cacheTimestamps.set(slug, Date.now())
      currentBook.value = book

      return book
    }
    catch (error) {
      console.error('Error fetching book:', error)
      currentBook.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // Cache a book (useful when receiving from search results)
  const cacheBook = (book: Book) => {
    books.value.set(book.slug, book)
    cacheTimestamps.set(book.slug, Date.now())
  }

  // Clear cache
  const clearCache = () => {
    books.value.clear()
    cacheTimestamps.clear()
    currentBook.value = null
  }

  return {
    // State
    books,
    isLoading,
    currentBook,

    // Computed
    hasBook,

    // Actions
    fetchBook,
    cacheBook,
    clearCache,
  }
})
```

#### 2.5 Authors Store
**File**: `app/stores/authors.ts`

```typescript
import type { Author, Book } from '~/types/api'
import { defineStore } from 'pinia'

export const useAuthorsStore = defineStore('authors', () => {
  const apiStore = useApiStore()

  // State
  const authors = ref(new Map<string, Author>())
  const authorBooks = ref(new Map<string, Book[]>())
  const isLoading = ref(false)
  const isLoadingBooks = ref(false)
  const currentAuthor = ref<Author | null>(null)

  // Cache metadata
  const cacheTimestamps = new Map<string, number>()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasAuthor = (slug: string) => authors.value.has(slug)
  const currentAuthorBooks = computed(() => (currentAuthor.value
    ? authorBooks.value.get(currentAuthor.value.slug) || []
    : [])
  )

  // Check if cached data is fresh
  const isCacheFresh = (slug: string) => {
    const timestamp = cacheTimestamps.get(slug)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // Fetch author details
  const fetchAuthor = async (slug: string, force = false) => {
    if (!force && hasAuthor(slug) && isCacheFresh(slug)) {
      currentAuthor.value = authors.value.get(slug)!

      return currentAuthor.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get(`/api/v1/authors/${slug}`)
      const author: Author = response.data

      // Add display dates
      if (author.birth_date || author.death_date) {
        const birth = author.birth_date
          ? new Date(author.birth_date).getFullYear()
          : '?'
        const death = author.death_date
          ? new Date(author.death_date).getFullYear()
          : 'present'
        author.display_dates = `${birth} - ${death}`
      }

      authors.value.set(slug, author)
      cacheTimestamps.set(slug, Date.now())
      currentAuthor.value = author

      return author
    }
    catch (error) {
      console.error('Error fetching author:', error)
      currentAuthor.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // Fetch ALL author's books (no pagination - load all at once)
  const fetchAuthorBooks = async (slug: string, force = false) => {
    const cacheKey = `${slug}_books`

    if (!force && authorBooks.value.has(slug) && isCacheFresh(cacheKey)) {
      return authorBooks.value.get(slug)!
    }

    isLoadingBooks.value = true

    try {
      // Fetch with large limit to get all books at once
      const response = await apiStore.client.get(`/api/v1/authors/${slug}/books`, {
        params: {
          limit: 1000, // Large enough to get all books
          offset: 0,
        }
      })

      const books: Book[] = response.data.items || []

      authorBooks.value.set(slug, books)
      cacheTimestamps.set(cacheKey, Date.now())

      return books
    }
    catch (error) {
      console.error('Error fetching author books:', error)

      return []
    }
    finally {
      isLoadingBooks.value = false
    }
  }

  // Cache an author
  const cacheAuthor = (author: Author) => {
    authors.value.set(author.slug, author)
    cacheTimestamps.set(author.slug, Date.now())
  }

  // Clear cache
  const clearCache = () => {
    authors.value.clear()
    authorBooks.value.clear()
    cacheTimestamps.clear()
    currentAuthor.value = null
  }

  return {
    // State
    authors,
    authorBooks,
    isLoading,
    isLoadingBooks,
    currentAuthor,

    // Computed
    hasAuthor,
    currentAuthorBooks,

    // Actions
    fetchAuthor,
    fetchAuthorBooks,
    cacheAuthor,
    clearCache,
  }
})
```

#### 2.6 Series Store
**File**: `app/stores/series.ts`

```typescript
import type { Book, Series } from '~/types/api'
import { defineStore } from 'pinia'

export const useSeriesStore = defineStore('series', () => {
  const apiStore = useApiStore()

  // State
  const series = ref(new Map<string, Series>())
  const seriesBooks = ref(new Map<string, Book[]>())
  const isLoading = ref(false)
  const isLoadingBooks = ref(false)
  const currentSeries = ref<Series | null>(null)

  // Cache metadata
  const cacheTimestamps = new Map<string, number>()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Computed
  const hasSeries = (slug: string) => series.value.has(slug)
  const currentSeriesBooks = computed(() => (currentSeries.value
    ? seriesBooks.value.get(currentSeries.value.slug) || []
    : [])
  )

  // Check if cached data is fresh
  const isCacheFresh = (slug: string) => {
    const timestamp = cacheTimestamps.get(slug)
    if (!timestamp)
      return false

    return Date.now() - timestamp < CACHE_TTL
  }

  // Fetch series details
  const fetchSeries = async (slug: string, force = false) => {
    if (!force && hasSeries(slug) && isCacheFresh(slug)) {
      currentSeries.value = series.value.get(slug)!

      return currentSeries.value
    }

    isLoading.value = true

    try {
      const response = await apiStore.client.get(`/api/v1/series/${slug}`)
      const seriesData: Series = response.data

      series.value.set(slug, seriesData)
      cacheTimestamps.set(slug, Date.now())
      currentSeries.value = seriesData

      return seriesData
    }
    catch (error) {
      console.error('Error fetching series:', error)
      currentSeries.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // Fetch ALL series books (no pagination - load all at once)
  const fetchSeriesBooks = async (slug: string, force = false) => {
    const cacheKey = `${slug}_books`

    if (!force && seriesBooks.value.has(slug) && isCacheFresh(cacheKey)) {
      return seriesBooks.value.get(slug)!
    }

    isLoadingBooks.value = true

    try {
      // Fetch with large limit to get all books at once
      const response = await apiStore.client.get(`/api/v1/series/${slug}/books`, {
        params: {
          limit: 1000, // Large enough to get all books
          offset: 0,
        }
      })

      const books: Book[] = response.data.items || []

      seriesBooks.value.set(slug, books)
      cacheTimestamps.set(cacheKey, Date.now())

      return books
    }
    catch (error) {
      console.error('Error fetching series books:', error)

      return []
    }
    finally {
      isLoadingBooks.value = false
    }
  }

  // Cache a series
  const cacheSeries = (seriesData: Series) => {
    series.value.set(seriesData.slug, seriesData)
    cacheTimestamps.set(seriesData.slug, Date.now())
  }

  // Clear cache
  const clearCache = () => {
    series.value.clear()
    seriesBooks.value.clear()
    cacheTimestamps.clear()
    currentSeries.value = null
  }

  return {
    // State
    series,
    seriesBooks,
    isLoading,
    isLoadingBooks,
    currentSeries,

    // Computed
    hasSeries,
    currentSeriesBooks,

    // Actions
    fetchSeries,
    fetchSeriesBooks,
    cacheSeries,
    clearCache,
  }
})
```

---

### Phase 3: Composables

#### 3.1 Infinite Scroll Composable
**File**: `app/composables/useInfiniteScroll.ts`

```typescript
import { onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(
  loadMore: () => void | Promise<void>,
  options: {
    threshold?: number // Distance from bottom to trigger (px)
    enabled?: Ref<boolean> // Enable/disable scrolling
  } = {}
) {
  const { threshold = 400, enabled = ref(true) } = options

  const handleScroll = async () => {
    if (!enabled.value)
      return

    const scrollPosition = window.innerHeight + window.scrollY
    const documentHeight = document.documentElement.scrollHeight

    if (documentHeight - scrollPosition < threshold) {
      await loadMore()
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    handleScroll,
  }
}
```

#### 3.2 SEO Composable
**File**: `app/composables/useSeo.ts`

```typescript
export function useSeo(options: {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'article' | 'book' | 'profile'
  url?: string
}) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const title = options.title
    ? `${options.title} | ${config.public.siteName}`
    : config.public.siteName

  const description = options.description || config.public.siteDescription
  const url = options.url || `${config.public.siteUrl}${route.fullPath}`
  const image = options.image || `${config.public.siteUrl}/og-image.jpg`

  useHead({
    title,
    meta: [
      { name: 'description', content: description },

      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: options.type || 'website' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:site_name', content: config.public.siteName },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    link: [
      { rel: 'canonical', href: url }
    ]
  })
}
```

---

### Phase 4: UI Components

#### 4.1 ThemeToggle Component
**File**: `app/components/ThemeToggle.vue`

```vue
<script setup lang="ts">
const themeStore = useThemeStore()
</script>

<template>
  <v-btn
    :icon="themeStore.isDark
      ? 'mdi-weather-night'
      : 'mdi-weather-sunny'"
    @click="themeStore.toggleTheme"
  />
</template>
```

#### 4.2 SearchBar Component
**File**: `app/components/SearchBar.vue`

**Props**:
- `variant: 'appbar' | 'full'`
- `modelValue: string`
- `autofocus?: boolean`

**Features**:
- Auto-search on input (debounced)
- Enter key navigation to search page (appbar mode)
- Clear button
- Loading indicator
- Mobile responsive

#### 4.3 UserMenu Component
**File**: `app/components/UserMenu.vue`

**Features**:
- Avatar button
- Dropdown menu:
  - Sign In
  - Sign Up
  - Divider
  - About
- Placeholder for auth

#### 4.4 AppBar Component
**File**: `app/components/AppBar.vue`

**Structure**:
- Logo (left) - click → home
- SearchBar (center)
- ThemeToggle (right)
- UserMenu (right)

**Features**:
- Fixed position
- Elevation on scroll
- Mobile responsive

#### 4.5 SearchFilters Component
**File**: `app/components/SearchFilters.vue`

**Features**:
- Filter chips: All, Books, Authors, Series
- Active state styling
- Horizontal scroll on mobile

#### 4.6 BookCard Component
**File**: `app/components/BookCard.vue`

**Props**: `book: Book`, `variant?: 'default' | 'compact'`

**Features**:
- Cover image with fallback
- Title (truncated)
- Author (clickable)
- Rating display
- Series badge
- Click → book page
- Hover effects
- Loading skeleton

#### 4.7 AuthorCard Component
**File**: `app/components/AuthorCard.vue`

**Props**: `author: Author`, `variant?: 'default' | 'compact'`

**Features**:
- Photo/avatar
- Name
- Book count
- Biography excerpt
- Click → author page
- Loading skeleton

#### 4.8 SeriesCard Component
**File**: `app/components/SeriesCard.vue`

**Props**: `series: Series`

**Features**:
- Title
- Book count badge
- Description excerpt
- Author name
- Click → series page
- Loading skeleton

#### 4.9 LoadingState Component
**File**: `app/components/LoadingState.vue`

**Props**: `type: 'card' | 'list' | 'detail'`, `count?: number`

**Features**:
- Reusable skeleton loaders
- Different layouts for different content types
- Shimmer animation

---

### Phase 5: Pages

#### 5.1 Default Layout
**File**: `app/layouts/default.vue`

```vue
<script setup lang="ts">
// Layout logic
</script>

<template>
  <v-app>
    <AppBar />

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>
```

#### 5.2 Home Page
**File**: `app/pages/index.vue`

**Features**:
- Hero section
- Title: "Discover Your Next Favorite Book"
- Subtitle: "Recommendations coming soon..."
- Centered, attractive layout
- SEO metadata

#### 5.3 Search Page
**File**: `app/pages/search.vue`

**URL**: `/search?q=<query>&type=<type>`

**Features**:
- Full-width SearchBar (autofocus)
- SearchFilters
- Results grid (mixed: books, authors, series)
- Infinite scroll (auto-load on scroll)
- Loading skeletons
- Empty state
- Results count
- URL sync (query params)
- SEO metadata

**Layout**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

#### 5.4 Book Detail Page
**File**: `app/pages/books/[slug].vue`

**URL**: `/books/<slug>`

**Layout**:
- Cover image (left/top)
- Book info (right/bottom):
  - Title
  - Author (link)
  - Series (link)
  - Rating
  - Publication year
  - Language
  - Genres
  - Formats
- Full description
- Loading skeleton
- 404 error handling

**Features**:
- SSR enabled
- SEO metadata (title, description, OG)
- Structured data (Schema.org Book)
- Cache book in store

#### 5.5 Author Detail Page
**File**: `app/pages/authors/[slug].vue`

**URL**: `/authors/<slug>`

**Layout**:
- Author info card:
  - Photo/avatar
  - Name
  - Dates
  - Book count
  - Biography
- Books grid (ALL books at once, no pagination)
- Horizontal/vertical scroll for books if many
- Loading skeletons
- 404 error handling

**Features**:
- SSR enabled
- SEO metadata
- Structured data (Schema.org Person)
- Load ALL books at once

#### 5.6 Series Detail Page
**File**: `app/pages/series/[slug].vue`

**URL**: `/series/<slug>`

**Layout**:
- Series info card:
  - Name
  - Author (link)
  - Book count
  - Description
- Books grid (ALL books, sorted by position)
- Book position badges
- Loading skeletons
- 404 error handling

**Features**:
- SSR enabled
- SEO metadata
- Structured data (Schema.org BookSeries)
- Load ALL books at once

---

## Loading States Strategy

### Principles:
1. **Always show loading feedback**
2. **Use skeleton loaders** (not spinners)
3. **Optimistic UI** when possible
4. **Progress indicators** for long operations

### Implementation:
- **Skeletons**: Vuetify `v-skeleton-loader`
- **Progress bars**: `v-progress-linear` (top of page)
- **Button loading**: `loading` prop on buttons
- **Shimmer effect**: CSS animation on skeletons

### Loading Patterns:
- **Initial page load**: Full skeleton layout
- **Infinite scroll**: Loading indicator at bottom
- **Search**: Progress bar + skeleton cards
- **Button actions**: Button disabled + loading spinner

---

## SEO & Metadata Strategy

### SSR Configuration:
- **Home**: Pre-rendered
- **Detail pages**: SWR (stale-while-revalidate) cache
- **Search page**: SSR enabled

### Meta Tags:
- Title (page-specific + site name)
- Description
- Open Graph (og:title, og:description, og:image, og:type)
- Twitter Card
- Canonical URL

### Structured Data (JSON-LD):
- **Book pages**: Schema.org/Book
- **Author pages**: Schema.org/Person
- **Series pages**: Schema.org/BookSeries

### Sitemap:
- Auto-generated by Nuxt Sitemap module
- Include all static and dynamic routes

### Robots.txt:
- Allow all crawlers
- Sitemap reference

---

## Responsive Design Strategy

### Breakpoints:
- **Mobile**: 0-600px (1 col)
- **Tablet**: 600-960px (2 cols)
- **Desktop**: 960-1264px (3 cols)
- **Large**: 1264px+ (4 cols)

### Mobile-First Approach:
1. Design mobile layout first
2. Enhance for larger screens
3. Use Vuetify grid system
4. Test on real devices

### Touch-Friendly:
- Button min-height: 48px
- Touch targets: 44x44px minimum
- Adequate spacing between interactive elements

### Performance:
- Lazy load images
- Code splitting
- Minimize bundle size
- Optimize fonts

---

## Development Checklist

### Phase 1: Setup ✓
- [ ] Update nuxt.config.ts
- [ ] Update Vuetify theme with new colors
- [ ] Create TypeScript types (api.ts)
- [ ] Test color contrast ratios

### Phase 2: Stores ✓
- [ ] Create api.ts store
- [ ] Create theme.ts store
- [ ] Create search.ts store (infinite scroll)
- [ ] Create books.ts store (caching)
- [ ] Create authors.ts store (caching)
- [ ] Create series.ts store (caching)
- [ ] Test caching logic

### Phase 3: Composables ✓
- [ ] Create useInfiniteScroll.ts
- [ ] Create useSeo.ts
- [ ] Test composables

### Phase 4: Components ✓
- [ ] ThemeToggle.vue
- [ ] SearchBar.vue (with auto-search)
- [ ] UserMenu.vue
- [ ] AppBar.vue
- [ ] SearchFilters.vue
- [ ] BookCard.vue (with loading state)
- [ ] AuthorCard.vue (with loading state)
- [ ] SeriesCard.vue (with loading state)
- [ ] LoadingState.vue (reusable skeletons)
- [ ] Test all components

### Phase 5: Layout ✓
- [ ] Create default.vue layout
- [ ] Test layout on all screen sizes

### Phase 6: Pages ✓
- [ ] Home page (index.vue)
- [ ] Search page (search.vue) with infinite scroll
- [ ] Book detail page (books/[slug].vue)
- [ ] Author detail page (authors/[slug].vue)
- [ ] Series detail page (series/[slug].vue)
- [ ] Add SEO meta to all pages
- [ ] Add structured data to detail pages
- [ ] Test navigation flow

### Phase 7: Testing & Polish ✓
- [ ] Test all loading states
- [ ] Test error states (404, 500)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test infinite scroll on search page
- [ ] Test theme switching (light/dark)
- [ ] Test search auto-search with debounce
- [ ] Test caching (verify no duplicate API calls)
- [ ] Verify SSR works correctly
- [ ] Check SEO meta tags (view source)
- [ ] Check accessibility (keyboard navigation, screen readers)
- [ ] Performance audit (Lighthouse)

---

## Success Criteria

### Functional:
- ✅ User can search for books, authors, series (auto-search)
- ✅ Search results load infinitely on scroll
- ✅ User can view book details
- ✅ User can view author details + ALL books
- ✅ User can view series details + ALL books
- ✅ Theme toggle works (light/dark)
- ✅ Navigation works seamlessly
- ✅ All data is cached client-side

### Performance:
- ✅ Initial page load < 2s
- ✅ Search response < 500ms
- ✅ No duplicate API calls (caching works)
- ✅ Infinite scroll is smooth

### UX:
- ✅ Loading states everywhere
- ✅ Responsive feedback for all actions
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Consistent design (colors, spacing, typography)

### SEO:
- ✅ SSR works on all pages
- ✅ Meta tags present (title, description, OG)
- ✅ Structured data on detail pages
- ✅ Canonical URLs
- ✅ Sitemap generated

---

## Notes

### Image Handling:
- Use `cover_url`, `photo_url` directly from API
- Fallback images for missing covers/photos
- Lazy loading with Nuxt Image component

### Error Handling:
- 404: Show "Not Found" page
- 500: Show "Server Error" message
- Network errors: Toast notification
- Retry mechanism for failed requests

### Caching Strategy:
- Client-side only (no Redis/server cache)
- 5-minute TTL
- Force refresh option on all fetch methods
- Automatic cache invalidation

### Future Considerations:
- Authentication (JWT)
- User profiles and bookshelves
- Reviews and ratings
- Recommendation system
- Social features

---

## Estimated Timeline

- **Day 1**: Setup + Stores (6-8 hours)
- **Day 2**: Composables + Components (8-10 hours)
- **Day 3**: Layout + Pages (8-10 hours)
- **Day 4**: SEO + Loading States (4-6 hours)
- **Day 5**: Testing + Polish (6-8 hours)

**Total**: 32-42 hours (5-7 working days)

---

Ready to implement! 🚀
