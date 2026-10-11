import type { RouteLocationNormalizedLoaded } from 'vue-router'

type SluggedRoute = 'books-slug' | 'authors-slug' | 'series-slug'

/**
 * Permanently redirects a request for a retired slug to the entity's current one.
 * The API resolves old slugs (a renamed edition, an author renamed by the importer)
 * and answers with the slug it serves; if that differs from the URL, the URL is the
 * stale copy and search engines should learn the new address.
 */
export function useCanonicalSlug() {
  const localePath = useLocalePath()
  const route = useRoute()

  return (name: SluggedRoute, requested: string, served: string | undefined, query: RouteLocationNormalizedLoaded['query'] = route.query) => {
    if (!served || served === requested)
      return

    return navigateTo(localePath({ name, params: { slug: served }, query }), { redirectCode: 301, replace: true })
  }
}
