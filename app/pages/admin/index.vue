<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeo({ title: 'Admin Panel', description: 'Admin panel for managing book ingestion.' })

const adminStore = useAdminStore()

const currentTab = ref(0)
const importConfirmDialog = ref(false)
const cleanupConfirmDialog = ref(false)
const reindexConfirmDialog = ref(false)
const recommendationsRefreshConfirmDialog = ref(false)
const personalRecommendationsRefreshConfirmDialog = ref(false)
const userPersonalRecommendationsRefreshConfirmDialog = ref(false)
const userPersonalRefreshUsername = ref('')
const contextualRecommendationsRefreshConfirmDialog = ref(false)
const contextualInvalidateConfirmDialog = ref(false)
const contextualInvalidateEntityType = ref<'book' | 'author' | 'series'>('book')
const contextualInvalidateSlug = ref('')
const bookOfTheWeekRefreshConfirmDialog = ref(false)

async function confirmImportDump() {
  importConfirmDialog.value = false
  await adminStore.importDump()
}

async function confirmCleanup() {
  cleanupConfirmDialog.value = false
  await adminStore.runCleanup()
}

async function confirmReindex() {
  reindexConfirmDialog.value = false
  await adminStore.runReindex()
}

async function confirmRecommendationsRefresh() {
  recommendationsRefreshConfirmDialog.value = false
  await adminStore.refreshRecommendations()
}

async function confirmBookOfTheWeekRefresh() {
  bookOfTheWeekRefreshConfirmDialog.value = false
  await adminStore.refreshBookOfTheWeek()
}

async function confirmPersonalRecommendationsRefresh() {
  personalRecommendationsRefreshConfirmDialog.value = false
  await adminStore.refreshPersonalRecommendations()
}

async function confirmUserPersonalRecommendationsRefresh() {
  userPersonalRecommendationsRefreshConfirmDialog.value = false
  await adminStore.refreshUserPersonalRecommendations(
    userPersonalRefreshUsername.value.trim(),
  )
}

async function confirmContextualRecommendationsRefresh() {
  contextualRecommendationsRefreshConfirmDialog.value = false
  await adminStore.refreshContextualRecommendations()
}

async function confirmContextualInvalidate() {
  contextualInvalidateConfirmDialog.value = false
  await adminStore.invalidateContextualCache(
    contextualInvalidateEntityType.value,
    contextualInvalidateSlug.value.trim(),
  )
}

onMounted(() => {
  adminStore.fetchCoverage()
})
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center mb-6 gap-3">
      <v-icon
        icon="mdi-shield-crown"
        size="32"
      />

      <div>
        <h1 class="text-h4">
          Admin Panel
        </h1>

        <p class="text-secondary mb-0">
          Manage book ingestion and database operations
        </p>
      </div>
    </div>

    <v-tabs
      v-model="currentTab"
      class="mb-6"
    >
      <v-tab>Coverage</v-tab>

      <v-tab>Import Dump</v-tab>

      <v-tab>Scheduled Jobs</v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
      <!-- Tab 1: Coverage -->
      <v-window-item :key="0">
        <v-card class="pa-6">
          <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h6">
              Database Coverage
            </h2>

            <v-btn
              icon="mdi-refresh"
              size="small"
              variant="text"
              :loading="adminStore.isCoverageLoading"
              @click="adminStore.fetchCoverage()"
            />
          </div>

          <v-progress-linear
            v-if="adminStore.isCoverageLoading"
            indeterminate
            class="mb-6"
          />

          <div
            v-else-if="adminStore.coverage"
            class="space-y-4"
          >
            <v-row class="mb-4">
              <v-col
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  variant="tonal"
                  color="info"
                  class="h-100 pa-4 text-center"
                >
                  <div class="text-h4 font-weight-bold">
                    {{ adminStore.coverage.db_books_count.toLocaleString() }}
                  </div>

                  <div class="text-secondary">
                    Books in Database
                  </div>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  variant="tonal"
                  color="success"
                  class="h-100 pa-4 text-center"
                >
                  <div class="text-h4 font-weight-bold">
                    {{ adminStore.coverage.db_authors_count.toLocaleString() }}
                  </div>

                  <div class="text-secondary">
                    Authors
                  </div>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  variant="tonal"
                  color="primary"
                  class="h-100 pa-4 text-center"
                >
                  <div class="text-h4 font-weight-bold">
                    {{ adminStore.coverage.db_series_count.toLocaleString() }}
                  </div>

                  <div class="text-secondary">
                    Series
                  </div>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  v-if="adminStore.coverage.cached"
                  variant="tonal"
                  color="warning"
                  class="d-flex align-center h-100 justify-center pa-4 text-center"
                >
                  <v-chip
                    label
                    size="small"
                  >
                    Cached
                  </v-chip>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div
            v-else
            class="py-6 text-center"
          >
            <v-icon
              icon="mdi-alert-circle"
              size="48"
              class="mb-2"
            />

            <p
              v-if="adminStore.errors.coverage"
              class="text-error"
            >
              {{ adminStore.errors.coverage }}
            </p>

            <p
              v-else
              class="text-secondary"
            >
              No coverage data available
            </p>
          </div>
        </v-card>
      </v-window-item>

      <!-- Tab 2: Import Dump -->
      <v-window-item :key="1">
        <v-card class="pa-6">
          <h2 class="text-h6 mb-4">
            Import Open Library Data Dump
          </h2>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Trigger an import of Open Library's monthly data dump. This is a heavy operation that runs asynchronously in the background. Check service logs for detailed progress.
          </v-alert>

          <v-alert
            type="warning"
            variant="tonal"
            class="mb-6"
          >
            ⚠️ This operation can take a long time to complete. It runs in the background and does not block the API.
          </v-alert>

          <v-btn
            color="primary"
            @click="importConfirmDialog = true"
          >
            Start Dump Import
          </v-btn>

          <div
            v-if="adminStore.importResult"
            class="mt-6"
          >
            <v-divider class="mb-4" />

            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              Result
            </h3>

            <v-chip
              :color="adminStore.importResult.status === 'started'
                ? 'success'
                : 'info'"
              size="small"
              class="mb-3"
            >
              {{ adminStore.importResult.status }}
            </v-chip>

            <p class="text-body-2 mt-3">
              {{ adminStore.importResult.message }}
            </p>
          </div>

          <div
            v-if="adminStore.errors.import"
            class="mt-6"
          >
            <v-alert
              type="error"
              variant="tonal"
            >
              {{ adminStore.errors.import }}
            </v-alert>
          </div>
        </v-card>
      </v-window-item>

      <!-- Tab 3: Scheduled Jobs -->
      <v-window-item :key="2">
        <v-row>
          <!-- Data Cleansing -->
          <v-col cols="12">
            <v-card class="pa-6">
              <h2 class="text-h6 mb-4">
                Data Cleansing
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Runs a full cleanup cycle: removes low-quality books, orphan authors, underrepresented series, orphan genres, and genres with invalid names.
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                ⚠️ This operation permanently deletes data and may take several minutes. It runs in the background.
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isCleanupLoading"
                @click="cleanupConfirmDialog = true"
              >
                Run Data Cleansing
              </v-btn>

              <div
                v-if="adminStore.cleanupResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Result
                </h3>

                <v-chip
                  :color="adminStore.cleanupResult.status === 'started'
                    ? 'success'
                    : adminStore.cleanupResult.status === 'already_running'
                      ? 'warning'
                      : 'info'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.cleanupResult.status }}
                </v-chip>

                <p class="text-body-2 mt-3">
                  {{ adminStore.cleanupResult.message }}
                </p>
              </div>

              <div
                v-if="adminStore.errors.cleanup"
                class="mt-6"
              >
                <v-alert
                  type="error"
                  variant="tonal"
                >
                  {{ adminStore.errors.cleanup }}
                </v-alert>
              </div>
            </v-card>
          </v-col>

          <!-- Full ES Reindex -->
          <v-col cols="12">
            <v-card class="pa-6">
              <h2 class="text-h6 mb-4">
                Full Elasticsearch Reindex
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Rebuilds all three Elasticsearch indexes (books, authors, series) from scratch. Useful after large data imports or index corruption.
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                ⚠️ This is a heavy operation that may take a long time. Search quality may be slightly degraded while indexing runs in the background.
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isReindexLoading"
                @click="reindexConfirmDialog = true"
              >
                Run Full Reindex
              </v-btn>

              <div
                v-if="adminStore.reindexResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Result
                </h3>

                <v-chip
                  :color="adminStore.reindexResult.status === 'started'
                    ? 'success'
                    : adminStore.reindexResult.status === 'already_running'
                      ? 'warning'
                      : 'info'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.reindexResult.status }}
                </v-chip>

                <p class="text-body-2 mt-3">
                  {{ adminStore.reindexResult.message }}
                </p>
              </div>

              <div
                v-if="adminStore.errors.reindex"
                class="mt-6"
              >
                <v-alert
                  type="error"
                  variant="tonal"
                >
                  {{ adminStore.errors.reindex }}
                </v-alert>
              </div>
            </v-card>
          </v-col>

          <!-- Home Recommendations Cache Rebuild -->
          <v-col cols="12">
            <v-card class="pa-6">
              <h2 class="text-h6 mb-4">
                Rebuild Home Recommendations
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Flushes <code>rec:{category}</code> Redis keys for each home category, then re-runs the home recommendation list builder (24h TTL).
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                ⚠️ Synchronous operation. May take several seconds. Home recommendations will be briefly unavailable until rebuild completes.
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isRecommendationsRefreshLoading"
                @click="recommendationsRefreshConfirmDialog = true"
              >
                Flush Cache & Rebuild
              </v-btn>

              <div
                v-if="adminStore.recommendationsRefreshResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Result
                </h3>

                <v-chip
                  :color="adminStore.recommendationsRefreshResult.success ? 'success' : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.recommendationsRefreshResult.success ? 'success' : 'failed' }}
                </v-chip>

                <p class="text-body-2 mt-3">
                  {{ adminStore.recommendationsRefreshResult.message }}
                </p>
              </div>

              <div
                v-if="adminStore.errors.recommendationsRefresh"
                class="mt-6"
              >
                <v-alert
                  type="error"
                  variant="tonal"
                >
                  {{ adminStore.errors.recommendationsRefresh }}
                </v-alert>
              </div>
            </v-card>
          </v-col>

          <!-- Personal Recommendations Refresh -->
          <v-col cols="12">
            <v-card class="pa-6">
              <h2 class="text-h6 mb-4">
                Rebuild Personal Recommendations
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Flushes <code>rec:profile:*</code> and <code>rec:personal:*</code> Redis keys, then re-runs personal refresher for active users.
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                ⚠️ Synchronous operation. Personal recommendations briefly unavailable until rebuild completes.
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isPersonalRecommendationsRefreshLoading"
                @click="personalRecommendationsRefreshConfirmDialog = true"
              >
                Flush & Rebuild
              </v-btn>

              <div
                v-if="adminStore.personalRecommendationsRefreshResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Result
                </h3>

                <v-chip
                  :color="adminStore.personalRecommendationsRefreshResult.success ? 'success' : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.personalRecommendationsRefreshResult.success ? 'success' : 'failed' }}
                </v-chip>

                <p class="text-body-2 mt-3">
                  {{ adminStore.personalRecommendationsRefreshResult.message }}
                </p>
              </div>

              <div
                v-if="adminStore.errors.personalRecommendationsRefresh"
                class="mt-6"
              >
                <v-alert
                  type="error"
                  variant="tonal"
                >
                  {{ adminStore.errors.personalRecommendationsRefresh }}
                </v-alert>
              </div>

              <v-divider class="my-6" />

              <h3 class="text-subtitle-1 font-weight-bold mb-3">
                Refresh For Specific User
              </h3>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Flushes and rebuilds only the listed user's personal recommendation cache (profile, personal home, personal book/author sections).
              </v-alert>

              <div class="d-flex gap-3 align-start">
                <v-text-field
                  v-model="userPersonalRefreshUsername"
                  label="User nickname"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  clearable
                  style="max-width: 320px;"
                />

                <v-btn
                  color="primary"
                  size="large"
                  :disabled="!userPersonalRefreshUsername.trim()"
                  :loading="adminStore.isUserPersonalRecommendationsRefreshLoading"
                  @click="userPersonalRecommendationsRefreshConfirmDialog = true"
                >
                  Flush & Rebuild
                </v-btn>
              </div>

              <div
                v-if="adminStore.userPersonalRecommendationsRefreshResult"
                class="mt-6"
              >
                <v-chip
                  :color="adminStore.userPersonalRecommendationsRefreshResult.success ? 'success' : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.userPersonalRecommendationsRefreshResult.success ? 'success' : 'failed' }}
                </v-chip>

                <p class="text-body-2 mt-3">
                  {{ adminStore.userPersonalRecommendationsRefreshResult.message }}
                </p>
              </div>

              <div
                v-if="adminStore.errors.userPersonalRecommendationsRefresh"
                class="mt-6"
              >
                <v-alert
                  type="error"
                  variant="tonal"
                >
                  {{ adminStore.errors.userPersonalRecommendationsRefresh }}
                </v-alert>
              </div>
            </v-card>
          </v-col>

          <!-- Contextual Recommendations Refresh -->
          <v-col cols="12">
            <v-card class="pa-6">
              <h2 class="text-h6 mb-4">
                Rebuild Contextual Recommendations
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Flushes <code>rec:book:*</code>, <code>rec:author:*</code>, and <code>rec:series:*</code> Redis keys, then re-runs the contextual precompute job.
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                ⚠️ Synchronous operation. Contextual recommendations briefly unavailable until rebuild completes.
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isContextualRecommendationsRefreshLoading"
                @click="contextualRecommendationsRefreshConfirmDialog = true"
              >
                Flush & Rebuild
              </v-btn>

              <div
                v-if="adminStore.contextualRecommendationsRefreshResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Result
                </h3>

                <v-chip
                  :color="adminStore.contextualRecommendationsRefreshResult.success ? 'success' : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.contextualRecommendationsRefreshResult.success ? 'success' : 'failed' }}
                </v-chip>

                <p class="text-body-2 mt-3">
                  {{ adminStore.contextualRecommendationsRefreshResult.message }}
                </p>
              </div>

              <div
                v-if="adminStore.errors.contextualRecommendationsRefresh"
                class="mt-6"
              >
                <v-alert
                  type="error"
                  variant="tonal"
                >
                  {{ adminStore.errors.contextualRecommendationsRefresh }}
                </v-alert>
              </div>

              <v-divider class="my-6" />

              <h3 class="text-subtitle-1 font-weight-bold mb-3">
                Invalidate Single Entity By Slug
              </h3>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Deletes the cached <code>rec:{type}:{id}</code> key for one book, author, or series. Cache will be lazily rebuilt on the next request.
              </v-alert>

              <div class="d-flex flex-wrap gap-3 align-start">
                <v-select
                  v-model="contextualInvalidateEntityType"
                  :items="['book', 'author', 'series']"
                  label="Entity type"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  style="max-width: 180px;"
                />

                <v-text-field
                  v-model="contextualInvalidateSlug"
                  label="Slug"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  clearable
                  style="max-width: 320px;"
                />

                <v-btn
                  color="primary"
                  size="large"
                  :disabled="!contextualInvalidateSlug.trim()"
                  :loading="adminStore.isContextualInvalidateLoading"
                  @click="contextualInvalidateConfirmDialog = true"
                >
                  Invalidate
                </v-btn>
              </div>

              <div
                v-if="adminStore.contextualInvalidateResult"
                class="mt-6"
              >
                <v-chip
                  :color="adminStore.contextualInvalidateResult.success ? 'success' : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.contextualInvalidateResult.success ? 'success' : 'failed' }}
                </v-chip>

                <p class="text-body-2 mt-3">
                  {{ adminStore.contextualInvalidateResult.message }}
                </p>
              </div>

              <div
                v-if="adminStore.errors.contextualInvalidate"
                class="mt-6"
              >
                <v-alert
                  type="error"
                  variant="tonal"
                >
                  {{ adminStore.errors.contextualInvalidate }}
                </v-alert>
              </div>
            </v-card>
          </v-col>

          <!-- Book of the Week Refresh -->
          <v-col cols="12">
            <v-card class="pa-6">
              <h2 class="text-h6 mb-4">
                Refresh Book of the Week
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Deletes the <code>bow:current</code> Redis key, then re-runs the selection logic and caches the new pick (7d TTL).
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                ⚠️ Synchronous operation. Book of the week will be briefly unavailable until re-selection completes.
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isBookOfTheWeekRefreshLoading"
                @click="bookOfTheWeekRefreshConfirmDialog = true"
              >
                Flush & Re-select
              </v-btn>

              <div
                v-if="adminStore.bookOfTheWeekRefreshResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Result
                </h3>

                <v-chip
                  :color="adminStore.bookOfTheWeekRefreshResult.success ? 'success' : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.bookOfTheWeekRefreshResult.success ? 'success' : 'failed' }}
                </v-chip>

                <p class="text-body-2 mt-3">
                  {{ adminStore.bookOfTheWeekRefreshResult.message }}
                </p>
              </div>

              <div
                v-if="adminStore.errors.bookOfTheWeekRefresh"
                class="mt-6"
              >
                <v-alert
                  type="error"
                  variant="tonal"
                >
                  {{ adminStore.errors.bookOfTheWeekRefresh }}
                </v-alert>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <!-- Import Dump Confirmation Dialog -->
    <v-dialog
      v-model="importConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Dump Import?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will start importing Open Library's monthly data dump asynchronously in the background.
          </div>

          <div>
            The import process is heavy and may take several hours to complete. Check service logs for progress.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isImportLoading"
            @click="importConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isImportLoading"
            @click="confirmImportDump"
          >
            Confirm Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cleanup Confirmation Dialog -->
    <v-dialog
      v-model="cleanupConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Data Cleansing?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will permanently delete low-quality books, orphan authors, underrepresented series, and invalid genres from the database.
          </div>

          <div>
            This action cannot be undone. Check service logs for progress.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isCleanupLoading"
            @click="cleanupConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="error"
            variant="elevated"
            :loading="adminStore.isCleanupLoading"
            @click="confirmCleanup"
          >
            Confirm Cleanup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reindex Confirmation Dialog -->
    <v-dialog
      v-model="reindexConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Full Reindex?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will rebuild all Elasticsearch indexes from scratch. The process is heavy and runs in the background.
          </div>

          <div>
            Search quality may be slightly degraded while indexing is in progress. Check service logs for progress.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isReindexLoading"
            @click="reindexConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isReindexLoading"
            @click="confirmReindex"
          >
            Confirm Reindex
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Recommendations Refresh Confirmation Dialog -->
    <v-dialog
      v-model="recommendationsRefreshConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Cache Rebuild?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will flush all recommendation Redis keys, then rebuild home recommendation lists and the book of the week synchronously.
          </div>

          <div>
            Recommendations will be briefly unavailable until the rebuild completes.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isRecommendationsRefreshLoading"
            @click="recommendationsRefreshConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isRecommendationsRefreshLoading"
            @click="confirmRecommendationsRefresh"
          >
            Confirm Rebuild
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Personal Recommendations Refresh Confirmation Dialog -->
    <v-dialog
      v-model="personalRecommendationsRefreshConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Personal Rebuild?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will delete all cached personal taste profiles and personal recommendation lists, then rebuild them for active users.
          </div>

          <div>
            Personal recommendations will be briefly unavailable until the rebuild completes.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isPersonalRecommendationsRefreshLoading"
            @click="personalRecommendationsRefreshConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isPersonalRecommendationsRefreshLoading"
            @click="confirmPersonalRecommendationsRefresh"
          >
            Confirm Rebuild
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Per-User Personal Recommendations Refresh Confirmation Dialog -->
    <v-dialog
      v-model="userPersonalRecommendationsRefreshConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Per-User Rebuild?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will flush cached personal recommendations for user
            <strong>{{ userPersonalRefreshUsername.trim() }}</strong>
            and rebuild them synchronously.
          </div>

          <div>
            That user's personal recommendations will be briefly unavailable until the rebuild completes.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isUserPersonalRecommendationsRefreshLoading"
            @click="userPersonalRecommendationsRefreshConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isUserPersonalRecommendationsRefreshLoading"
            @click="confirmUserPersonalRecommendationsRefresh"
          >
            Confirm Rebuild
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Contextual Recommendations Refresh Confirmation Dialog -->
    <v-dialog
      v-model="contextualRecommendationsRefreshConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Contextual Rebuild?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will delete all cached book, author, and series contextual recommendations, then re-run the contextual precompute job.
          </div>

          <div>
            Contextual recommendations will be briefly unavailable until the rebuild completes.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isContextualRecommendationsRefreshLoading"
            @click="contextualRecommendationsRefreshConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isContextualRecommendationsRefreshLoading"
            @click="confirmContextualRecommendationsRefresh"
          >
            Confirm Rebuild
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Contextual Invalidate Confirmation Dialog -->
    <v-dialog
      v-model="contextualInvalidateConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Invalidate?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will delete the cached contextual recommendations for
            <strong>{{ contextualInvalidateEntityType }}</strong> with slug
            <strong>{{ contextualInvalidateSlug.trim() }}</strong>.
          </div>

          <div>
            The cache will be lazily rebuilt on the next request for this entity.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isContextualInvalidateLoading"
            @click="contextualInvalidateConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isContextualInvalidateLoading"
            @click="confirmContextualInvalidate"
          >
            Confirm Invalidate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Book of the Week Refresh Confirmation Dialog -->
    <v-dialog
      v-model="bookOfTheWeekRefreshConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-warning">
          Confirm Book of the Week Refresh?
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            This will delete the cached book of the week and re-run selection synchronously.
          </div>

          <div>
            Book of the week will be briefly unavailable until re-selection completes.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isBookOfTheWeekRefreshLoading"
            @click="bookOfTheWeekRefreshConfirmDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isBookOfTheWeekRefreshLoading"
            @click="confirmBookOfTheWeekRefresh"
          >
            Confirm Refresh
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
