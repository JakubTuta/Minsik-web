import type { MaybeRef } from 'vue'

interface SeoOptions {
  title?: MaybeRef<string>
  description?: MaybeRef<string>
  image?: string
  type?: 'website' | 'article' | 'book' | 'profile'
  url?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  keywords?: string[]
}

export function useSeo(options: SeoOptions = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()

  // Use a getter function so useHead re-evaluates when reactive refs change
  useHead(() => {
    const titleStr = unref(options.title)
    const descStr = unref(options.description)

    const fullTitle = titleStr
      ? `${titleStr} | ${config.public.siteName}`
      : config.public.siteName as string

    const description = descStr || config.public.siteDescription as string

    // Use route.path (no query params) for canonical URL
    const canonicalUrl = options.url || `${config.public.siteUrl}${route.path}`

    const imageUrl = options.image || `${config.public.siteUrl}/og-image.jpg`

    const metaTags: { name?: string, property?: string, content: string }[] = [
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: options.type || 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { property: 'og:site_name', content: config.public.siteName as string },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ]

    if (options.author) {
      metaTags.push({ name: 'author', content: options.author })
      metaTags.push({ property: 'article:author', content: options.author })
    }

    if (options.publishedTime) {
      metaTags.push({ property: 'article:published_time', content: options.publishedTime })
    }

    if (options.modifiedTime) {
      metaTags.push({ property: 'article:modified_time', content: options.modifiedTime })
    }

    if (options.keywords && options.keywords.length > 0) {
      metaTags.push({ name: 'keywords', content: options.keywords.join(', ') })
    }

    return {
      title: fullTitle,
      meta: metaTags,
      link: [{ rel: 'canonical', href: canonicalUrl }],
    }
  })
}

// Helper for structured data (JSON-LD)
// Unhead v2 removed `children` — use `innerHTML` so the JSON renders as script content
export function useStructuredData(data: Record<string, any>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data),
      },
    ],
  })
}

// Book structured data helper
export function useBookStructuredData(book: {
  name: string
  author: string | string[]
  isbn?: string
  description?: string
  image?: string
  url: string
  datePublished?: string
  inLanguage?: string
  numberOfPages?: number
  publisher?: string
  genres?: string[]
  ratingValue?: number
  ratingCount?: number
}) {
  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    'name': book.name,
    'author': Array.isArray(book.author)
      ? book.author.map(name => ({
          '@type': 'Person',
          'name': name,
        }))
      : {
          '@type': 'Person',
          'name': book.author,
        },
    'url': book.url,
  }

  if (book.isbn) {
    structuredData.isbn = book.isbn
  }

  if (book.description) {
    structuredData.description = book.description
  }

  if (book.image) {
    structuredData.image = book.image
  }

  if (book.datePublished) {
    structuredData.datePublished = book.datePublished
  }

  if (book.inLanguage) {
    structuredData.inLanguage = book.inLanguage
  }

  if (book.numberOfPages) {
    structuredData.numberOfPages = book.numberOfPages
  }

  if (book.publisher) {
    structuredData.publisher = { '@type': 'Organization', 'name': book.publisher }
  }

  if (book.genres && book.genres.length > 0) {
    structuredData.genre = book.genres
  }

  if (book.ratingValue && book.ratingCount) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': book.ratingValue,
      'ratingCount': book.ratingCount,
      'bestRating': 5,
      'worstRating': 1,
    }
  }

  useStructuredData(structuredData)
}

// Breadcrumb structured data helper
export function useBreadcrumbStructuredData(items: { name: string, url?: string }[]) {
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      ...(item.url
        ? { item: item.url }
        : {}),
    })),
  })
}

// Author structured data helper
export function useAuthorStructuredData(author: {
  name: string
  description?: string
  image?: string
  url: string
  birthDate?: string
  deathDate?: string
}) {
  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': author.name,
    'url': author.url,
  }

  if (author.description) {
    structuredData.description = author.description
  }

  if (author.image) {
    structuredData.image = author.image
  }

  if (author.birthDate) {
    structuredData.birthDate = author.birthDate
  }

  if (author.deathDate) {
    structuredData.deathDate = author.deathDate
  }

  useStructuredData(structuredData)
}

// Series structured data helper
export function useSeriesStructuredData(series: {
  name: string
  description?: string
  url: string
}) {
  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'BookSeries',
    'name': series.name,
    'url': series.url,
  }

  if (series.description) {
    structuredData.description = series.description
  }

  useStructuredData(structuredData)
}
