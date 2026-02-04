<script setup lang="ts">
interface Props {
  variant?: 'appbar' | 'full'
  modelValue?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'appbar',
  modelValue: '',
  autofocus: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const router = useRouter()
const searchStore = useSearchStore()

const localQuery = ref(props.modelValue)
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

// Auto-search in both modes with debounce
watch(localQuery, (newQuery) => {
  emit('update:modelValue', newQuery)

  // Trigger auto-search with debounce in both appbar and full modes
  searchStore.setQuery(newQuery)

  // Show results dropdown in appbar mode when there's a query
  if (props.variant === 'appbar' && newQuery.trim()) {
    showResults.value = true
  }
  else {
    showResults.value = false
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

  if (props.variant === 'full') {
    searchStore.clear()
  }
}

const isLoading = computed(() => (props.variant === 'appbar'
  ? searchStore.isLoading
  : searchStore.isLoading))

// Group results by type for appbar dropdown (limit to 10 per category for scrolling)
const groupedResults = computed(() => {
  if (props.variant !== 'appbar')
    return null

  const books = searchStore.results.filter(r => r.type === 'book').slice(0, 10)
  const series = searchStore.results.filter(r => r.type === 'series').slice(0, 10)
  const authors = searchStore.results.filter(r => r.type === 'author').slice(0, 10)

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

const hasResults = computed(() => {
  if (props.variant !== 'appbar')
    return false

  return searchStore.hasData
})

const isEmpty = computed(() => {
  if (props.variant !== 'appbar')
    return false

  return searchStore.isEmpty
})
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
        :style="dropdownStyle"
      >
        <!-- Loading State -->
        <v-card-text v-if="isLoading">
          <v-progress-linear
            indeterminate
            color="primary"
          />

          <div class="text-caption text-secondary mt-2 text-center">
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
                <div class="text-caption text-secondary font-weight-bold mb-2">
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
                    :subtitle="result.authors.join(', ')"
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
                <div class="text-caption text-secondary font-weight-bold mb-2">
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
                    :subtitle="`${result.view_count} views`"
                    :to="`/series/${result.slug}`"
                    @click="showResults = false"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-book-multiple" />
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
                <div class="text-caption text-secondary font-weight-bold mb-2">
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
                    :subtitle="`${result.view_count} views`"
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
  min-width: 350px;
  z-index: 2000;
}

.scrollable-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
