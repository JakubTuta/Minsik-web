import type { RecommendationSection } from '~/types/recommendations'

type TitledSection = Pick<RecommendationSection, 'key' | 'display_name' | 'title_params'>

/**
 * Recommendation section titles are built server-side in English only (see
 * recommendation service `list_builder.py`/`personal_builder.py`) — the server
 * sends a stable `key` plus `title_params` for any dynamic part, and this
 * resolves the translated title client-side. Falls back to the server's
 * English `display_name` for any key not yet covered by `recSections.*`.
 */
export function useRecommendationTitle() {
  const { t, te } = useI18n()
  const genreLabel = useGenreLabel()

  return (section: TitledSection): string => {
    const params = section.title_params ?? {}
    const key = section.key === 'more_by_author' && !params.author
      ? 'recSections.moreByAuthorGeneric'
      : `recSections.${section.key}`

    if (!te(key))
      return section.display_name

    const resolvedParams = params.genre
      ? { ...params, genre: genreLabel(params.genre) }
      : params

    return t(key, resolvedParams)
  }
}
