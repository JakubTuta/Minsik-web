import type { Category } from '~/types/categories'

export const CATEGORIES: Category[] = [
  { slug: 'fantasy', name: 'Fantasy' },
  { slug: 'science-fiction', name: 'Science Fiction' },
  { slug: 'romance', name: 'Romance' },
  { slug: 'mystery-thriller', name: 'Mystery & Thriller' },
  { slug: 'horror', name: 'Horror' },
  { slug: 'historical-fiction', name: 'Historical Fiction' },
  { slug: 'young-adult', name: 'Young Adult' },
  { slug: 'classics', name: 'Classics' },
  { slug: 'adventure', name: 'Adventure' },
  { slug: 'biography', name: 'Biography & Memoir' },
  { slug: 'self-help', name: 'Self-Help' },
  { slug: 'business', name: 'Business & Economics' },
  { slug: 'science-nature', name: 'Science & Nature' },
  { slug: 'graphic-novels', name: 'Graphic Novels & Comics' },
]

export function useCategories() {
  const getCategoryBySlug = (slug: string) => CATEGORIES.find(c => c.slug === slug) ?? null

  return {
    categories: CATEGORIES,
    getCategoryBySlug,
  }
}
