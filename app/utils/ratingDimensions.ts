export interface RatingDimension {
  key: string
  label: string
  color: string
}

export const RATING_DIMENSIONS: RatingDimension[] = [
  { key: 'emotional_impact', label: 'Emotional', color: 'red' },
  { key: 'intellectual_depth', label: 'Intellectual', color: 'purple' },
  { key: 'writing_quality', label: 'Writing', color: 'teal' },
  { key: 'rereadability', label: 'Rereadability', color: 'amber' },
  { key: 'pacing', label: 'Pacing', color: 'blue' },
  { key: 'readability', label: 'Readability', color: 'green' },
  { key: 'plot_complexity', label: 'Complexity', color: 'orange' },
  { key: 'humor', label: 'Humor', color: 'pink' },
]
