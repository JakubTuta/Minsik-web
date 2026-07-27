import type { Category } from '~/types/categories'

export const CATEGORY_SLUGS = [
  'fantasy',
  'science-fiction',
  'romance',
  'mystery-thriller',
  'horror',
  'historical-fiction',
  'young-adult',
  'classics',
  'adventure',
  'biography',
  'self-help',
  'business',
  'science-nature',
  'graphic-novels',
] as const

export function useCategories() {
  const { t } = useI18n()

  const categories = computed<Category[]>(() => CATEGORY_SLUGS.map(slug => ({
    slug,
    name: t(`categoryNames.${slug}`),
  })))

  const getCategoryBySlug = (slug: string) => categories.value.find(c => c.slug === slug) ?? null

  return {
    categories,
    getCategoryBySlug,
  }
}
