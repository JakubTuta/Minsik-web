<script setup lang="ts">
import type { SuggestItem } from '~/types/api'

const props = withDefaults(defineProps<Props>(), {
  variant: 'appbar',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

interface Props {
  variant?: 'appbar' | 'full'
  modelValue?: string
  autofocus?: boolean
}

const LISTBOX_ID = 'search-suggest-listbox'

const { modelValue } = toRefs(props)

const router = useRouter()
const searchStore = useSearchStore()
const quickSearchStore = useQuickSearchStore()

// eslint-disable-next-line vue/no-ref-object-reactivity-loss -- seeds an editable local copy; kept in step by the watcher below
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

// Group results by type for the appbar dropdown. The server already caps
// each bucket (books/authors/series), so no further slicing is needed here.
const groupedResults = computed(() => {
  if (props.variant !== 'appbar')
    return null

  const results = quickSearchStore.results

  return {
    books: results.filter(r => r.type === 'book'),
    series: results.filter(r => r.type === 'series'),
    authors: results.filter(r => r.type === 'author'),
  }
})

const resultGroups = computed(() => {
  const groups = groupedResults.value
  if (!groups)
    return []

  return [
    { key: 'books', title: t('search.groupBooks'), results: groups.books },
    { key: 'series', title: t('search.groupSeries'), results: groups.series },
    { key: 'authors', title: t('search.groupAuthors'), results: groups.authors },
  ].filter(group => group.results.length > 0)
})

// 12 grid columns split evenly between the groups that have results.
const columnWidth = computed(() => 12 / Math.max(1, resultGroups.value.length))

// 400px per column, but never wider than the viewport.
const dropdownWidth = computed(() => `min(${Math.max(1, resultGroups.value.length) * 400}px, calc(100vw - 16px))`)

const hasResults = computed(() => props.variant === 'appbar' && quickSearchStore.hasResults)
const isEmpty = computed(() => props.variant === 'appbar' && quickSearchStore.isEmpty)
const isLoading = computed(() => (props.variant === 'appbar'
  ? quickSearchStore.isLoading
  : searchStore.isLoading))

const isDropdownOpen = computed(() => props.variant === 'appbar' && showResults.value && localQuery.value.trim().length > 0)

function optionId(result: SuggestItem): string {
  return `suggest-${result.type}-${result.id}`
}

const SECTION_BY_TYPE = { book: 'books', series: 'series', author: 'authors' } as const

function pathFor(result: SuggestItem): string {
  return localePath(`/${SECTION_BY_TYPE[result.type]}/${result.slug}`)
}

// Visual order of the columns, which is also the order the arrow keys walk.
const orderedResults = computed<SuggestItem[]>(() => resultGroups.value.flatMap(group => group.results))

const activeIndex = ref(-1)
const activeResult = computed<SuggestItem | undefined>(() => orderedResults.value[activeIndex.value])
const activeId = computed(() => (activeResult.value
  ? optionId(activeResult.value)
  : null))

watch(orderedResults, () => {
  activeIndex.value = -1
})

function moveActive(step: 1 | -1) {
  const count = orderedResults.value.length
  if (count === 0)
    return

  activeIndex.value = activeIndex.value === -1
    ? (step === 1
        ? 0
        : count - 1)
    : (activeIndex.value + step + count) % count
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    showResults.value = false
    activeIndex.value = -1

    return
  }

  if (props.variant !== 'appbar' || !localQuery.value.trim())
    return

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    showResults.value = true
    moveActive(event.key === 'ArrowDown'
      ? 1
      : -1)
  }
  else if (event.key === 'Enter') {
    const target = activeResult.value
    const isbn = isbnFromQuery(localQuery.value)
    showResults.value = false

    router.push(target
      ? pathFor(target)
      : isbn
        ? localePath(`/isbn/${isbn}`)
        : { path: localePath('/search'), query: { q: localQuery.value } })
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
      :aria-label="variant === 'appbar'
        ? t('search.placeholderFull')
        : t('search.placeholderShort')"
      :role="variant === 'appbar'
        ? 'combobox'
        : undefined"
      :aria-expanded="variant === 'appbar'
        ? String(isDropdownOpen)
        : undefined"
      :aria-controls="variant === 'appbar'
        ? LISTBOX_ID
        : undefined"
      :aria-activedescendant="activeId ?? undefined"
      :aria-autocomplete="variant === 'appbar'
        ? 'list'
        : undefined"
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
        v-if="isDropdownOpen"
        :id="LISTBOX_ID"
        ref="resultsCardRef"
        class="search-results-dropdown"
        elevation="8"
        role="listbox"
        :aria-label="t('search.placeholderFull')"
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
          v-else-if="hasResults"
          class="pa-0"
        >
          <v-row no-gutters>
            <v-col
              v-for="group in resultGroups"
              :key="group.key"
              cols="12"
              :md="columnWidth"
            >
              <SearchSuggestGroup
                :title="group.title"
                :results="group.results"
                :active-id="activeId"
                :option-id="optionId"
                :path-for="pathFor"
                @select="showResults = false"
              />
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
}
</style>
