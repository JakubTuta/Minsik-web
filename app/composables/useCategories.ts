import type { Category } from '~/types/categories'
import { CATEGORY_SLUGS } from '~~/categories.config'

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
