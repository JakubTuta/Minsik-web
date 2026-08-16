<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const { t } = useI18n()

useSeoMeta({
  title: t('discoverPage.seoTitle'),
  description: t('discoverPage.seoDescription'),
})

const discoverStore = useDiscoverStore()

const showError = computed({
  get: () => !!discoverStore.error,
  set: () => { discoverStore.error = null },
})

const fetchMatchingCountDebounced = useDebounceFn(() => {
  discoverStore.fetchMatchingCount()
}, 500)

watch(
  () => discoverStore.filtersPayload,
  () => {
    if (discoverStore.phase === 'filtering') {
      fetchMatchingCountDebounced()
    }
  },
  { deep: true },
)

async function handleDiscover() {
  await discoverStore.discover()
}

async function handleDiscoverAnother() {
  await discoverStore.discoverAnother()
}

function handleBackToFilters() {
  discoverStore.phase = 'filtering'
}

function handleResetFilters() {
  discoverStore.resetFilters()
  discoverStore.phase = 'filtering'
}

onUnmounted(() => {
  discoverStore.reset()
})
</script>

<template>
  <v-container
    fluid
    class="discover-page"
  >
    <!-- Page header -->
    <div class="page-header mb-8 text-center">
      <h1 class="text-h3 font-weight-bold mb-2">
        {{ t('nav.discover') }}
      </h1>

      <p class="text-body-1 text-medium-emphasis">
        {{ t('discoverPage.setPreferences') }}
      </p>

      <p class="text-body-1 text-medium-emphasis">
        {{ t('discoverPage.filtersOptionalHint') }}
      </p>
    </div>

    <!-- Phase transitions -->
    <Transition
      name="phase-fade"
      mode="out-in"
    >
      <!-- Filtering phase -->
      <div
        v-if="discoverStore.phase === 'filtering'"
        key="filtering"
        class="filtering-phase"
      >
        <DiscoverFilters
          v-model:book-length="discoverStore.bookLength"
          v-model:quality="discoverStore.quality"
          v-model:moods="discoverStore.moods"
          v-model:era="discoverStore.era"
          v-model:series-filter="discoverStore.seriesFilter"
          v-model:popularity="discoverStore.popularity"
        />

        <!-- Matching count -->
        <div class="mt-6 text-center">
          <Transition name="count-fade">
            <v-chip
              v-if="discoverStore.matchingCount !== null"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-book-search"
            >
              {{ t('discover.matchingCount', {"count": discoverStore.matchingCount}, discoverStore.matchingCount ?? 0) }}
            </v-chip>
          </Transition>
        </div>

        <!-- Discover button -->
        <div class="mb-4 mt-6 text-center">
          <v-btn
            size="x-large"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-compass"
            :loading="discoverStore.isLoading"
            class="discover-btn"
            @click="handleDiscover"
          >
            {{ t('discoverPage.discoverABook') }}
          </v-btn>
        </div>
      </div>

      <!-- Loading phase -->
      <div
        v-else-if="discoverStore.phase === 'loading'"
        key="loading"
        class="loading-phase text-center"
      >
        <v-progress-circular
          indeterminate
          size="72"
          width="4"
          color="primary"
          class="mb-6"
        />

        <p class="text-body-1 text-medium-emphasis">
          {{ t('discoverPage.findingPerfectBook') }}
        </p>
      </div>

      <!-- Revealing phase -->
      <div
        v-else-if="discoverStore.phase === 'revealing' && discoverStore.discoveredBook"
        key="revealing"
        class="revealing-phase d-flex flex-column align-center"
      >
        <DiscoverBookReveal
          :book="discoverStore.discoveredBook"
          :matching-count="discoverStore.matchingCount"
          @discover-another="handleDiscoverAnother"
          @back-to-filters="handleBackToFilters"
        />
      </div>

      <!-- Empty phase -->
      <div
        v-else-if="discoverStore.phase === 'empty'"
        key="empty"
        class="empty-phase d-flex flex-column align-center"
      >
        <DiscoverEmptyState @reset-filters="handleResetFilters" />
      </div>
    </Transition>

    <!-- Error snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      :timeout="4000"
    >
      {{ discoverStore.error }}

      <template #actions>
        <v-btn
          variant="text"
          @click="discoverStore.error = null"
        >
          {{ t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.discover-page {
  min-height: calc(100vh - var(--app-bar-height));
  padding: 40px 16px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  animation: header-entrance 0.6s ease forwards;
}

.filtering-phase {
  max-width: 820px;
  margin: 0 auto;
}

.loading-phase {
  padding: 80px 0;
}

.revealing-phase,
.empty-phase {
  padding: 20px 0;
}

.discover-btn {
  min-width: 200px;
  letter-spacing: 0.03em;
}

.phase-fade-enter-active,
.phase-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.phase-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.phase-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

.count-fade-enter-active,
.count-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.count-fade-enter-from,
.count-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes header-entrance {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
