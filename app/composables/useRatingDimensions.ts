export interface RatingDimension {
  key: string
  label: string
  color: string
}

/**
 * Compact labels for the sub-rating chips (e.g. "Emotional", not "Emotional
 * Impact" as used in the full rating dialog) — a computed so it re-translates
 * when the interface language changes.
 */
export function useRatingDimensions() {
  const { t } = useI18n()

  const dimensions = computed<RatingDimension[]>(() => [
    { key: 'emotional_impact', label: t('rating.compactDimensions.emotional'), color: 'red' },
    { key: 'intellectual_depth', label: t('rating.compactDimensions.intellectual'), color: 'purple' },
    { key: 'writing_quality', label: t('rating.compactDimensions.writing'), color: 'teal' },
    { key: 'rereadability', label: t('rating.dimensions.rereadability'), color: 'amber' },
    { key: 'pacing', label: t('rating.dimensions.pacing'), color: 'blue' },
    { key: 'readability', label: t('rating.dimensions.readability'), color: 'green' },
    { key: 'plot_complexity', label: t('rating.compactDimensions.complexity'), color: 'orange' },
    { key: 'humor', label: t('rating.dimensions.humor'), color: 'pink' },
  ])

  return { dimensions }
}
