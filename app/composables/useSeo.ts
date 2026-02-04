interface SeoOptions {
  title?: string
  description?: string
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

  // Build full title
  const fullTitle = options.title
    ? `${options.title} | ${config.public.siteName}`
    : config.public.siteName as string

  // Use provided or default description
  const description = options.description || config.public.siteDescription as string

  // Build canonical URL
  const canonicalUrl = options.url || `${config.public.siteUrl}${route.fullPath}`

  // Use provided or default image
  const imageUrl = options.image || `${config.public.siteUrl}/og-image.jpg`

  // Build meta tags array
  const metaTags = [
    // Basic meta tags
    { name: 'description', content: description },

    // Open Graph
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:type', content: options.type || 'website' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: imageUrl },
    { property: 'og:site_name', content: config.public.siteName },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ]

  // Add author if provided
  if (options.author) {
    metaTags.push({ name: 'author', content: options.author })
    metaTags.push({ property: 'article:author', content: options.author })
  }

  // Add published time if provided
  if (options.publishedTime) {
    metaTags.push({ property: 'article:published_time', content: options.publishedTime })
  }

  // Add modified time if provided
  if (options.modifiedTime) {
    metaTags.push({ property: 'article:modified_time', content: options.modifiedTime })
  }

  // Add keywords if provided
  if (options.keywords && options.keywords.length > 0) {
    metaTags.push({ name: 'keywords', content: options.keywords.join(', ') })
  }

  // Set head metadata
  useHead({
    title: fullTitle,
    meta: metaTags,
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
  })

  return {
    title: fullTitle,
    description,
    canonicalUrl,
    imageUrl,
  }
}

// Helper for structured data (JSON-LD)
export function useStructuredData(data: Record<string, any>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(data),
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
}) {
  const structuredData = {
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
    Object.assign(structuredData, { isbn: book.isbn })
  }

  if (book.description) {
    Object.assign(structuredData, { description: book.description })
  }

  if (book.image) {
    Object.assign(structuredData, { image: book.image })
  }

  if (book.datePublished) {
    Object.assign(structuredData, { datePublished: book.datePublished })
  }

  if (book.inLanguage) {
    Object.assign(structuredData, { inLanguage: book.inLanguage })
  }

  useStructuredData(structuredData)
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
