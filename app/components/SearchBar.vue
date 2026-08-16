<script setup lang="ts">
import type { SuggestItem } from '~/types/api'
import { hashColor } from '~/utils/coverColor'
import { totalRatingCount, weightedRating } from '~/utils/format'

const props = withDefaults(defineProps<Props>(), {
  variant: 'appbar',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

interface Props {
  variant?: 'appbar' | 'full'
  modelValue?: string
  autofocus?: boolean
}

const { modelValue } = toRefs(props)

const router = useRouter()
const searchStore = useSearchStore()
const quickSearchStore = useQuickSearchStore()

const localQuery = ref(modelValue.value)
const showResults = ref(false)
const searchFieldRef = ref()
const resultsCardRef = ref()
const dropdownStyle = ref({ top: '0px', left: '0px', width: '0px' })

let positionRaf = 0
function updateDropdownPosition() {
  if (props.variant !== 'appbar' || !searchFieldRef.value)
    return

  cancelAnimationFrame(positionRaf)
  positionRaf = requestAnimationFrame(() => {
    const rect = searchFieldRef.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      left: `${centerX}px`,
      width: 'auto',
    }
  })
}

function handleClickOutside(event: MouseEvent) {
  if (props.variant !== 'appbar' || !showResults.value)
    return

  const target = event.target as Node
  const clickedInsideSearch = searchFieldRef.value?.contains(target)
  const clickedInsideResults = resultsCardRef.value?.$el?.contains(target)

  if (!clickedInsideSearch && !clickedInsideResults) {
    showResults.value = false
  }
}

// The scroll listener only needs to run while the dropdown is open — attaching
// it for the component's whole lifetime meant every scroll of every nested
// scroller on every page (each home-page carousel included) forced a layout
// read and a reactive write, even when there was nothing to reposition.
// `capture: true` still catches scrolls on nested scrollable ancestors, which
// don't bubble to `window` by default.
if (import.meta.client) {
  watch(showResults, (isOpen) => {
    if (props.variant !== 'appbar')
      return

    if (isOpen) {
      nextTick(() => updateDropdownPosition())
      window.addEventListener('scroll', updateDropdownPosition, { capture: true, passive: true })
      window.addEventListener('resize', updateDropdownPosition, { passive: true })
    }
    else {
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  })

  onMounted(() => {
    document.addEventListener('click', handleClickOutside, true)
  })

  onUnmounted(() => {
    cancelAnimationFrame(positionRaf)
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
    document.removeEventListener('click', handleClickOutside, true)
  })
}

watch(() => props.modelValue, (newVal) => {
  localQuery.value = newVal
})

const debouncedSearch = useDebounceFn(async (query: string) => {
  if (props.variant === 'appbar') {
    await quickSearchStore.search(query)
  }
  else {
    searchStore.setQuery(query)
  }
}, 200)

watch(localQuery, (newQuery) => {
  emit('update:modelValue', newQuery)

  if (props.variant === 'appbar' && newQuery.trim()) {
    showResults.value = true
    debouncedSearch(newQuery)
  }
  else if (props.variant === 'appbar') {
    showResults.value = false
    quickSearchStore.clear()
  }
  else {
    debouncedSearch(newQuery)
  }
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && props.variant === 'appbar' && localQuery.value.trim()) {
    showResults.value = false
    router.push({
      path: localePath('/search'),
      query: { q: localQuery.value },
    })
  }
  else if (event.key === 'Escape') {
    showResults.value = false
  }
}

function clearSearch() {
  localQuery.value = ''
  emit('update:modelValue', '')
  showResults.value = false

  if (props.variant === 'appbar') {
    quickSearchStore.clear()
  }
  else {
    searchStore.clear()
  }
}

const isLoading = computed(() => (props.variant === 'appbar'
  ? quickSearchStore.isLoading
  : searchStore.isLoading))

// Group results by type for the appbar dropdown. The server already caps
// each bucket (books/authors/series), so no further slicing is needed here.
const groupedResults = computed(() => {
  if (props.variant !== 'appbar')
    return null

  const results = quickSearchStore.results

  const books = results.filter(r => r.type === 'book')
  const series = results.filter(r => r.type === 'series')
  const authors = results.filter(r => r.type === 'author')

  return { books, series, authors }
})

const columnWidth = computed(() => {
  if (props.variant !== 'appbar' || !groupedResults.value)
    return 12

  const activeCategories = [
    groupedResults.value.books.length > 0,
    groupedResults.value.series.length > 0,
    groupedResults.value.authors.length > 0,
  ].filter(Boolean).length

  // 1 category: full width, 2 categories: half width each, 3 categories: third width each
  if (activeCategories === 1)
    return 12
  if (activeCategories === 2)
    return 6

  return 4
})

const dropdownWidth = computed(() => {
  if (props.variant !== 'appbar' || !groupedResults.value)
    return '400px'

  const activeCategories = [
    groupedResults.value.books.length > 0,
    groupedResults.value.series.length > 0,
    groupedResults.value.authors.length > 0,
  ].filter(Boolean).length

  // Always at least 400px (1 column), even for loading/empty states
  // 1 column: 400px, 2 columns: 800px, 3 columns: 1200px
  return `${Math.max(1, activeCategories) * 400}px`
})

const hasResults = computed(() => {
  if (props.variant !== 'appbar')
    return false

  return quickSearchStore.hasResults
})

const isEmpty = computed(() => {
  if (props.variant !== 'appbar')
    return false

  return quickSearchStore.isEmpty
})

// Format subtitle for each suggest result type
interface SubtitlePart {
  text: string
  type: 'authors' | 'rating' | 'readers' | 'separator'
}

function getSubtitleParts(result: SuggestItem): SubtitlePart[] {
  const compactFmt = new Intl.NumberFormat(locale.value, { notation: 'compact', maximumFractionDigits: 1 })
  const parts: SubtitlePart[] = []
  const ratingCount = totalRatingCount(result.app_rating_count, result.ol_rating_count)
  const avg = weightedRating(result.app_avg_rating, result.app_rating_count, result.ol_avg_rating, result.ol_rating_count)

  if (result.authors && result.authors.length > 0) {
    parts.push({ text: result.authors.join(', '), type: 'authors' })
  }

  if (ratingCount > 0) {
    if (parts.length > 0)
      parts.push({ text: '', type: 'separator' })
    parts.push({ text: `${avg.toFixed(1)} (${compactFmt.format(ratingCount)})`, type: 'rating' })
  }

  if (result.readers > 0) {
    if (parts.length > 0)
      parts.push({ text: '', type: 'separator' })
    parts.push({ text: compactFmt.format(result.readers), type: 'readers' })
  }

  return parts
}
</script>

<template>
  <div
    ref="searchFieldRef"
    class="search-bar-wrapper"
  >
    <v-text-field
      v-model="localQuery"
      :autofocus="autofocus"
      :placeholder="variant === 'appbar'
        ? t('search.placeholderFull')
        : t('search.placeholderShort')"
      prepend-inner-icon="mdi-magnify"
      :clearable="localQuery.length > 0"
      :density="variant === 'appbar'
        ? 'compact'
        : 'comfortable'"
      hide-details
      single-line
      variant="solo"
      :flat="variant === 'appbar'"
      @keydown="handleKeydown"
      @click:clear="clearSearch"
      @focus="showResults = variant === 'appbar' && localQuery.trim().length > 0"
    />

    <!-- Results Dropdown for AppBar -->
    <Teleport to="body">
      <v-card
        v-if="variant === 'appbar' && showResults && localQuery.trim()"
        ref="resultsCardRef"
        class="search-results-dropdown"
        elevation="8"
        :style="{...dropdownStyle,
                 'min-width': dropdownWidth}"
      >
        <!-- Loading State -->
        <v-card-text v-if="isLoading">
          <v-progress-linear
            indeterminate
            color="primary"
          />

          <div class="text-secondary mt-2 text-center">
            {{ t('search.searching') }}
          </div>
        </v-card-text>

        <!-- Empty State -->
        <v-card-text v-else-if="isEmpty">
          <div class="py-4 text-center">
            <v-icon
              icon="mdi-magnify-remove-outline"
              size="48"
              color="secondary"
              class="mb-2"
            />

            <div class="text-body-2 text-secondary">
              {{ t('search.noResultsFor', {"query": localQuery}) }}
            </div>
          </div>
        </v-card-text>

        <!-- Results Grid -->
        <v-card-text
          v-else-if="hasResults && groupedResults"
          class="pa-0"
        >
          <v-row no-gutters>
            <!-- Books Column -->
            <v-col
              v-if="groupedResults.books.length > 0"
              cols="12"
              :md="columnWidth"
            >
              <div class="pa-3">
                <div class="text-secondary font-weight-bold mb-2">
                  {{ t('search.groupBooks') }}
                </div>

                <v-list
                  density="comfortable"
                  class="scrollable-list pa-0"
                >
                  <v-list-item
                    v-for="result in groupedResults.books"
                    :key="result.id"
                    :title="result.title"
                    :to="localePath(`/books/${result.slug}`)"
                    class="mb-1 rounded"
                    @click="showResults = false"
                  >
                    <template #prepend>
                      <v-avatar
                        size="40"
                        rounded="lg"
                      >
                        <v-img
                          v-if="result.cover_url"
                          :src="result.cover_url"
                          :alt="result.title"
                          eager
                        >
                          <template #placeholder>
                            <HashedFill :color="hashColor(result.title)" />
                          </template>
                        </v-img>

                        <v-icon
                          v-else
                          icon="mdi-book"
                        />
                      </v-avatar>
                    </template>

                    <template #subtitle>
                      <span class="d-inline-flex align-center flex-wrap">
                        <template
                          v-for="(part, index) in getSubtitleParts(result)"
                          :key="index"
                        >
                          <v-icon
                            v-if="part.type === 'separator'"
                            icon="mdi-circle-small"
                            color="secondary"
                            size="small"
                          />

                          <span
                            v-else-if="part.type === 'rating'"
                            class="d-inline-flex align-center"
                          >
                            <v-icon
                              icon="mdi-star"
                              color="amber"
                              size="x-small"
                              class="mr-1"
                            />
                            {{ part.text }}
                          </span>

                          <span
                            v-else-if="part.type === 'readers'"
                            class="d-inline-flex align-center"
                          >
                            <v-icon
                              icon="mdi-account-multiple"
                              color="info"
                              size="x-small"
                              class="mr-1"
                            />
                            {{ part.text }}
                          </span>

                          <span v-else>{{ part.text }}</span>
                        </template>
                      </span>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-col>

            <!-- Series Column -->
            <v-col
              v-if="groupedResults.series.length > 0"
              cols="12"
              :md="columnWidth"
            >
              <div class="pa-3">
                <div class="text-secondary font-weight-bold mb-2">
                  {{ t('search.groupSeries') }}
                </div>

                <v-list
                  density="comfortable"
                  class="scrollable-list pa-0"
                >
                  <v-list-item
                    v-for="result in groupedResults.series"
                    :key="result.id"
                    :title="result.title"
                    :to="localePath(`/series/${result.slug}`)"
                    class="mb-1 rounded"
                    @click="showResults = false"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-book-multiple" />
                    </template>

                    <template #subtitle>
                      <span class="d-inline-flex align-center flex-wrap">
                        <template
                          v-for="(part, index) in getSubtitleParts(result)"
                          :key="index"
                        >
                          <v-icon
                            v-if="part.type === 'separator'"
                            icon="mdi-circle-small"
                            color="secondary"
                            size="small"
                          />

                          <span
                            v-else-if="part.type === 'rating'"
                            class="d-inline-flex align-center"
                          >
                            <v-icon
                              icon="mdi-star"
                              color="amber"
                              size="x-small"
                              class="mr-1"
                            />
                            {{ part.text }}
                          </span>

                          <span
                            v-else-if="part.type === 'readers'"
                            class="d-inline-flex align-center"
                          >
                            <v-icon
                              icon="mdi-account-multiple"
                              color="info"
                              size="x-small"
                              class="mr-1"
                            />
                            {{ part.text }}
                          </span>

                          <span v-else>{{ part.text }}</span>
                        </template>
                      </span>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-col>

            <!-- Authors Column -->
            <v-col
              v-if="groupedResults.authors.length > 0"
              cols="12"
              :md="columnWidth"
            >
              <div class="pa-3">
                <div class="text-secondary font-weight-bold mb-2">
                  {{ t('search.groupAuthors') }}
                </div>

                <v-list
                  density="comfortable"
                  class="scrollable-list pa-0"
                >
                  <v-list-item
                    v-for="result in groupedResults.authors"
                    :key="result.id"
                    :title="result.title"
                    :to="localePath(`/authors/${result.slug}`)"
                    class="mb-1 rounded"
                    @click="showResults = false"
                  >
                    <template #prepend>
                      <v-avatar
                        size="40"
                      >
                        <v-img
                          v-if="result.cover_url"
                          :src="result.cover_url"
                          :alt="result.title"
                          eager
                        >
                          <template #placeholder>
                            <HashedFill :color="hashColor(result.title)" />
                          </template>
                        </v-img>

                        <v-icon
                          v-else
                          icon="mdi-account"
                        />
                      </v-avatar>
                    </template>

                    <template #subtitle>
                      <span class="d-inline-flex align-center flex-wrap">
                        <template
                          v-for="(part, index) in getSubtitleParts(result)"
                          :key="index"
                        >
                          <v-icon
                            v-if="part.type === 'separator'"
                            icon="mdi-circle-small"
                            color="secondary"
                            size="small"
                          />

                          <span
                            v-else-if="part.type === 'rating'"
                            class="d-inline-flex align-center"
                          >
                            <v-icon
                              icon="mdi-star"
                              color="amber"
                              size="x-small"
                              class="mr-1"
                            />
                            {{ part.text }}
                          </span>

                          <span
                            v-else-if="part.type === 'readers'"
                            class="d-inline-flex align-center"
                          >
                            <v-icon
                              icon="mdi-account-multiple"
                              color="info"
                              size="x-small"
                              class="mr-1"
                            />
                            {{ part.text }}
                          </span>

                          <span v-else>{{ part.text }}</span>
                        </template>
                      </span>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </Teleport>
  </div>
</template>

<style scoped>
.search-bar-wrapper {
  position: relative;
  width: 100%;
}

.search-results-dropdown {
  position: fixed;
  transform: translateX(-50%);
  z-index: 2000;
}

@media (max-width: 599px) {
  .search-results-dropdown {
    top: calc(var(--app-bar-height, 56px) + 8px) !important;
    left: 8px !important;
    right: 8px !important;
    transform: none !important;
    min-width: unset !important;
    width: calc(100vw - 16px) !important;
    max-height: calc(100dvh - var(--app-bar-height, 56px) - 16px);
    overflow-y: auto;
  }

  .search-results-dropdown .scrollable-list {
    max-height: none;
    overflow-y: visible;
  }
}

.scrollable-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
