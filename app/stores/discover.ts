import type { APIResponse, BookSummary } from '~/types/api'
import type { BookLength, DiscoverBookData, DiscoverBookFilters, DiscoverPhase, Era, Mood, Popularity, Quality, SeriesFilter } from '~/types/discover'
import { defineStore } from 'pinia'

export const useDiscoverStore = defineStore('discover', () => {
  const { t } = useNuxtApp().$i18n
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)
  const { language } = useUserLanguage()

  // Filter state
  const bookLength = ref<BookLength | null>(null)
  const quality = ref<Quality | null>(null)
  const moods = ref<Mood[]>([])
  const era = ref<Era | null>(null)
  const seriesFilter = ref<SeriesFilter | null>(null)
  const popularity = ref<Popularity | null>(null)

  // Discovery state
  const phase = ref<DiscoverPhase>('filtering')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const discoveredBook = ref<BookSummary | null>(null)
  const matchingCount = ref<number | null>(null)
  const excludeIds = ref<number[]>([])

  const filtersPayload = computed<DiscoverBookFilters>(() => {
    const filters: DiscoverBookFilters = { language: language.value }
    if (bookLength.value)
      filters.book_length = bookLength.value
    if (quality.value)
      filters.quality = quality.value
    if (moods.value.length)
      filters.moods = [...moods.value]
    if (era.value)
      filters.era = era.value
    if (seriesFilter.value)
      filters.series_filter = seriesFilter.value
    if (popularity.value)
      filters.popularity = popularity.value
    if (excludeIds.value.length)
      filters.exclude_ids = excludeIds.value.slice(0, 500)

    return filters
  })

  const hasActiveFilters = computed(() => bookLength.value !== null
    || quality.value !== null
    || moods.value.length > 0
    || era.value !== null
    || seriesFilter.value !== null
    || popularity.value !== null,
  )

  const discover = async () => {
    if (isLoading.value)
      return

    isLoading.value = true
    error.value = null
    phase.value = 'loading'

    try {
      const response = await client.value.post<APIResponse<DiscoverBookData>>(
        '/api/v1/discover',
        filtersPayload.value,
      )

      if (!response.data.data) {
        phase.value = 'empty'
        matchingCount.value = 0

        return
      }

      discoveredBook.value = response.data.data.book
      matchingCount.value = response.data.data.matching_count
      excludeIds.value = [...excludeIds.value, response.data.data.book.book_id].slice(-500)
      phase.value = 'revealing'
    }
    catch (err: any) {
      error.value = err.response?.data?.message || err.response?.data?.detail || t('storeErrors.discoverFailed')
      phase.value = 'filtering'
    }
    finally {
      isLoading.value = false
    }
  }

  const discoverAnother = async () => {
    await discover()
  }

  const fetchMatchingCount = async () => {
    try {
      const response = await client.value.post<APIResponse<{ matching_count: number }>>(
        '/api/v1/discover/count',
        filtersPayload.value,
      )
      matchingCount.value = response.data.data?.matching_count ?? 0
    }
    catch {
      matchingCount.value = null
    }
  }

  const resetFilters = () => {
    bookLength.value = null
    quality.value = null
    moods.value = []
    era.value = null
    seriesFilter.value = null
    popularity.value = null
    matchingCount.value = null
  }

  const reset = () => {
    resetFilters()
    phase.value = 'filtering'
    isLoading.value = false
    error.value = null
    discoveredBook.value = null
    excludeIds.value = []
  }

  return {
    bookLength,
    quality,
    moods,
    era,
    seriesFilter,
    popularity,
    phase,
    isLoading,
    error,
    discoveredBook,
    matchingCount,
    excludeIds,
    hasActiveFilters,
    filtersPayload,
    discover,
    discoverAnother,
    fetchMatchingCount,
    resetFilters,
    reset,
  }
})
