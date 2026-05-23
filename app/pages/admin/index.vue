<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeo({ title: 'Admin Panel', description: 'Admin panel for managing book ingestion.' })

const adminStore = useAdminStore()

const currentTab = ref(0)
const importConfirmDialog = ref(false)
const cleanupConfirmDialog = ref(false)
const reindexConfirmDialog = ref(false)

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
  </v-container>
</template>
