<script setup lang="ts">
import type { SearchResult } from '~/types/api'
import { totalRatingCount, weightedRating } from '~/utils/format'

interface Props {
  variant?: 'appbar' | 'full'
  modelValue?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'appbar',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const { modelValue } = toRefs(props)

const router = useRouter()
const searchStore = useSearchStore()
const quickSearchStore = useQuickSearchStore()

const localQuery = ref(modelValue.value)
const showResults = ref(false)
const searchFieldRef = ref()
const resultsCardRef = ref()
const dropdownStyle = ref({ top: '0px', left: '0px', width: '0px' })

// Update dropdown position when it shows (centered below search field)
function updateDropdownPosition() {
  if (props.variant !== 'appbar' || !searchFieldRef.value)
    return

  const rect = searchFieldRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  dropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${centerX}px`,
    width: 'auto',
  }
}

// Watch showResults to update position
watch(showResults, (newVal) => {
  if (newVal && props.variant === 'appbar') {
    nextTick(() => {
      updateDropdownPosition()
    })
  }
})

// Hide results when clicking outside both search field and results card
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

// Update position on scroll/resize and handle outside clicks
if (import.meta.client) {
  onMounted(() => {
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
    document.addEventListener('click', handleClickOutside, true)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
    document.removeEventListener('click', handleClickOutside, true)
  })
}

// Sync with prop
watch(() => props.modelValue, (newVal) => {
  localQuery.value = newVal
})

// Auto-search with debounce
const debouncedSearch = useDebounceFn(async (query: string) => {
  if (props.variant === 'appbar') {
    // AppBar: use quick search store
    await quickSearchStore.search(query)
  }
  else {
    // Full mode: use the search store (for search page)
    searchStore.setQuery(query)
  }
}, 500)

watch(localQuery, (newQuery) => {
  emit('update:modelValue', newQuery)

  // Show results dropdown in appbar mode when there's a query
  if (props.variant === 'appbar' && newQuery.trim()) {
    showResults.value = true
    debouncedSearch(newQuery)
  }
  else if (props.variant === 'appbar') {
    showResults.value = false
    quickSearchStore.clear()
  }
  else {
    // Full mode
    debouncedSearch(newQuery)
  }
})

// Handle Enter key in appbar mode
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && props.variant === 'appbar' && localQuery.value.trim()) {
    showResults.value = false
    router.push({
      path: '/search',
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

// Group results by type for appbar dropdown (limit to 10 per category for scrolling)
const groupedResults = computed(() => {
  if (props.variant !== 'appbar')
    return null

  const results = quickSearchStore.results

  const books = results.filter(r => r.type === 'book').slice(0, 10)
  const series = results.filter(r => r.type === 'series').slice(0, 10)
  const authors = results.filter(r => r.type === 'author').slice(0, 10)

  return { books, series, authors }
})

// Calculate column width based on number of active categories
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

// Calculate dropdown width based on number of active categories
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

// Format subtitle parts for each result type
interface SubtitlePart {
  text: string
  type: 'authors' | 'rating' | 'rating_count' | 'books' | 'separator'
}

function getSubtitleParts(result: SearchResult): SubtitlePart[] {
  const parts: SubtitlePart[] = []
  const avg = weightedRating(Number(result.app_avg_rating ?? 0), result.app_rating_count, result.ol_avg_rating, result.ol_rating_count)
  const count = totalRatingCount(result.app_rating_count, result.ol_rating_count)

  if (result.type === 'book') {
    // Book: author name · average rating (amount of ratings)
    if (result.authors && result.authors.length > 0) {
      parts.push({ text: result.authors.join(', '), type: 'authors' })
    }
    if (count > 0) {
      if (parts.length > 0)
        parts.push({ text: '', type: 'separator' })
      parts.push({ text: avg.toFixed(1), type: 'rating' })
      parts.push({ text: ` (${count})`, type: 'rating_count' })
    }
  }
  else if (result.type === 'series') {
    // Series: author name · average rating (amount of ratings) · amount of books
    if (result.authors && result.authors.length > 0) {
      parts.push({ text: result.authors.join(', '), type: 'authors' })
    }
    if (count > 0) {
      if (parts.length > 0)
        parts.push({ text: '', type: 'separator' })
      parts.push({ text: avg.toFixed(1), type: 'rating' })
      parts.push({ text: ` (${count})`, type: 'rating_count' })
    }
    if (result.book_count != null) {
      if (parts.length > 0)
        parts.push({ text: '', type: 'separator' })
      parts.push({
        text: `${result.book_count} ${result.book_count === 1
          ? 'book'
          : 'books'}`,
        type: 'books',
      })
    }
  }
  else if (result.type === 'author') {
    // Author: average rating (amount of ratings) · amount of books
    if (count > 0) {
      parts.push({ text: avg.toFixed(1), type: 'rating' })
      parts.push({ text: ` (${count})`, type: 'rating_count' })
    }
    if (result.book_count != null) {
      if (parts.length > 0)
        parts.push({ text: '', type: 'separator' })
      parts.push({
        text: `${result.book_count} ${result.book_count === 1
          ? 'book'
          : 'books'}`,
        type: 'books',
      })
    }
  }

  return parts
}

function getPartStyle(partType: SubtitlePart['type']) {
  if (partType === 'rating') {
    return { 'font-size': '1.1em' }
  }

  return {}
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
        ? 'Search books, authors, series...'
        : 'Search...'"
      prepend-inner-icon="mdi-magnify"
      :clearable="localQuery.length > 0"
      density="comfortable"
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
            Searching...
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
              No results found for "{{ localQuery }}"
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
                  BOOKS
                </div>

                <v-list
                  density="compact"
                  class="scrollable-list pa-0"
                >
                  <v-list-item
                    v-for="result in groupedResults.books"
                    :key="result.id"
                    :title="result.title"
                    :to="`/books/${result.slug}`"
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
                        />

                        <v-icon
                          v-else
                          icon="mdi-book"
                        />
                      </v-avatar>
                    </template>

                    <template #subtitle>
                      <template
                        v-for="(part, index) in getSubtitleParts(result)"
                        :key="index"
                      >
                        <v-icon
                          v-if="part.type === 'separator'"
                          icon="mdi-dots-vertical"
                          color="secondary"
                          size="small"
                          class="mx-1"
                        />

                        <span
                          v-else
                          :class="{'text-amber font-weight-bold': part.type === 'rating'}"
                          :style="getPartStyle(part.type)"
                        >
                          {{ part.text }}
                        </span>
                      </template>
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
                  SERIES
                </div>

                <v-list
                  density="compact"
                  class="scrollable-list pa-0"
                >
                  <v-list-item
                    v-for="result in groupedResults.series"
                    :key="result.id"
                    :title="result.title"
                    :to="`/series/${result.slug}`"
                    @click="showResults = false"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-book-multiple" />
                    </template>

                    <template #subtitle>
                      <template
                        v-for="(part, index) in getSubtitleParts(result)"
                        :key="index"
                      >
                        <v-icon
                          v-if="part.type === 'separator'"
                          icon="mdi-dots-vertical"
                          color="secondary"
                          size="small"
                          class="mx-1"
                        />

                        <span
                          v-else
                          :class="{'text-amber font-weight-bold': part.type === 'rating'}"
                          :style="getPartStyle(part.type)"
                        >
                          {{ part.text }}
                        </span>
                      </template>
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
                  AUTHORS
                </div>

                <v-list
                  density="compact"
                  class="scrollable-list pa-0"
                >
                  <v-list-item
                    v-for="result in groupedResults.authors"
                    :key="result.id"
                    :title="result.title"
                    :to="`/authors/${result.slug}`"
                    @click="showResults = false"
                  >
                    <template #prepend>
                      <v-avatar size="40">
                        <v-img
                          v-if="result.cover_url"
                          :src="result.cover_url"
                          :alt="result.title"
                        />

                        <v-icon
                          v-else
                          icon="mdi-account"
                        />
                      </v-avatar>
                    </template>

                    <template #subtitle>
                      <template
                        v-for="(part, index) in getSubtitleParts(result)"
                        :key="index"
                      >
                        <v-icon
                          v-if="part.type === 'separator'"
                          icon="mdi-dots-vertical"
                          color="secondary"
                          size="small"
                          class="mx-1"
                        />

                        <span
                          v-else
                          :class="{'text-amber font-weight-bold': part.type === 'rating'}"
                          :style="getPartStyle(part.type)"
                        >
                          {{ part.text }}
                        </span>
                      </template>
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
    left: 8px !important;
    right: 8px !important;
    transform: none !important;
    min-width: unset !important;
    width: calc(100vw - 16px) !important;
    max-height: 80dvh;
    overflow-y: auto;
  }
}

.scrollable-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
