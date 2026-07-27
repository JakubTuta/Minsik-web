import type {
  BookLength,
  Era,
  FilterOption,
  Mood,
  Popularity,
  Quality,
  SeriesFilter,
} from '~/types/discover'

export function useDiscoverFilterOptions() {
  const { t } = useI18n()

  const bookLengthOptions = computed<FilterOption<BookLength>[]>(() => [
    { value: 'short', label: t('discover.lengthShort'), icon: 'mdi-book-open-variant', description: t('discover.lengthShortRange') },
    { value: 'medium', label: t('discover.lengthMedium'), icon: 'mdi-book', description: t('discover.lengthMediumRange') },
    { value: 'long', label: t('discover.lengthLong'), icon: 'mdi-book-multiple', description: t('discover.lengthLongRange') },
    { value: 'epic', label: t('discover.lengthEpic'), icon: 'mdi-library', description: t('discover.lengthEpicRange') },
  ])

  const qualityOptions = computed<FilterOption<Quality>[]>(() => [
    { value: 'high', label: t('discover.qualityHigh'), icon: 'mdi-star', description: '>4.0' },
    { value: 'medium', label: t('discover.qualityGood'), icon: 'mdi-star-half-full', description: '3.0-4.0' },
    { value: 'low', label: t('discover.qualityLow'), icon: 'mdi-star-outline', description: '2.0-3.0' },
    { value: 'very_low', label: t('discover.qualityVeryLow'), icon: 'mdi-star-off-outline', description: '≤2.0' },
  ])

  const moodOptions = computed<FilterOption<Mood>[]>(() => [
    { value: 'funny', label: t('discover.moodFunny'), icon: 'mdi-emoticon-happy' },
    { value: 'emotional', label: t('discover.moodEmotional'), icon: 'mdi-heart-pulse' },
    { value: 'intellectual', label: t('discover.moodIntellectual'), icon: 'mdi-brain' },
    { value: 'easy_read', label: t('discover.moodEasyRead'), icon: 'mdi-sofa' },
    { value: 'complex', label: t('discover.moodComplex'), icon: 'mdi-puzzle' },
    { value: 'fast_paced', label: t('discover.moodFastPaced'), icon: 'mdi-lightning-bolt' },
  ])

  const eraOptions = computed<FilterOption<Era>[]>(() => [
    { value: 'classic', label: t('discover.eraClassic'), icon: 'mdi-clock-outline', description: t('discover.eraClassicRange') },
    { value: 'modern', label: t('discover.eraModern'), icon: 'mdi-clock-fast', description: t('discover.eraModernRange') },
    { value: 'contemporary', label: t('discover.eraContemporary'), icon: 'mdi-clock-digital', description: t('discover.eraContemporaryRange') },
  ])

  const seriesOptions = computed<FilterOption<SeriesFilter>[]>(() => [
    { value: 'standalone', label: t('discover.seriesStandalone'), icon: 'mdi-book-open-page-variant' },
    { value: 'series', label: t('discover.seriesSeries'), icon: 'mdi-bookshelf' },
  ])

  const popularityOptions = computed<FilterOption<Popularity>[]>(() => [
    { value: 'popular', label: t('discover.popularityPopular'), icon: 'mdi-fire', description: t('discover.popularityPopularRange') },
    { value: 'hidden_gem', label: t('discover.popularityHiddenGem'), icon: 'mdi-diamond-stone', description: t('discover.popularityHiddenGemRange') },
  ])

  return {
    bookLengthOptions,
    qualityOptions,
    moodOptions,
    eraOptions,
    seriesOptions,
    popularityOptions,
  }
}
