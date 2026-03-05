<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeo({ title: 'Admin Panel', description: 'Admin panel for managing book ingestion.' })

const adminStore = useAdminStore()

const currentTab = ref(0)
const ingestionParams = ref({
  total_books: 100,
  source: 'both' as 'open_library' | 'google_books' | 'both',
  language: 'en',
})
const searchParams = ref({
  title: '',
  author: '',
  source: 'both' as 'open_library' | 'google_books' | 'both',
  limit: 10,
})
const importConfirmDialog = ref(false)

const sourceOptions = [
  { title: 'Open Library', value: 'open_library' },
  { title: 'Google Books', value: 'google_books' },
  { title: 'Both', value: 'both' },
]

function triggerIngestion() {
  adminStore.triggerIngestion(
    ingestionParams.value.total_books,
    ingestionParams.value.source,
    ingestionParams.value.language,
  )
}

function searchBooks() {
  adminStore.searchBooks(
    searchParams.value.title,
    searchParams.value.author,
    searchParams.value.source,
    searchParams.value.limit,
  )
}

async function confirmImportDump() {
  importConfirmDialog.value = false
  await adminStore.importDump()
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

      <v-tab>Trigger Ingestion</v-tab>

      <v-tab>Book Search</v-tab>

      <v-tab>Import Dump</v-tab>
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

            <v-divider class="my-4" />

            <div>
              <div class="text-body-2 font-weight-bold mb-2">
                Coverage vs Open Library
              </div>

              <v-progress-linear
                :value="adminStore.coverage.coverage_percent * 100"
                class="mb-2"
              />

              <div class="text-secondary">
                {{ (adminStore.coverage.coverage_percent * 100).toFixed(2) }}% of {{ adminStore.coverage.ol_english_total.toLocaleString() }} Open Library English books
              </div>
            </div>
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

      <!-- Tab 2: Trigger Ingestion -->
      <v-window-item :key="1">
        <v-card class="pa-6">
          <h2 class="text-h6 mb-4">
            Trigger Book Ingestion
          </h2>

          <v-alert
            type="warning"
            variant="tonal"
            class="mb-6"
          >
            ⏱️ This operation blocks until completion and may take several minutes to complete.
          </v-alert>

          <v-form @submit.prevent="triggerIngestion">
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model.number="ingestionParams.total_books"
                  label="Total Books to Ingest"
                  type="number"
                  :min="1"
                  required
                  outlined
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-select
                  v-model="ingestionParams.source"
                  label="Data Source"
                  :items="sourceOptions"
                  outlined
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="ingestionParams.language"
                  label="Language Code"
                  placeholder="en"
                  outlined
                />
              </v-col>
            </v-row>

            <v-btn
              color="primary"
              type="submit"
              :loading="adminStore.isIngestionLoading"
              class="mb-6"
            >
              Trigger Ingestion
            </v-btn>
          </v-form>

          <div
            v-if="adminStore.ingestionResult"
            class="space-y-4"
          >
            <v-divider />

            <h3 class="text-subtitle-1 font-weight-bold mt-4">
              Result
            </h3>

            <v-row>
              <v-col
                cols="12"
                sm="6"
              >
                <div class="text-secondary">
                  Job ID
                </div>

                <div class="text-body-2 font-monospace">
                  {{ adminStore.ingestionResult.job_id }}
                </div>
              </v-col>

              <v-col
                cols="12"
                sm="6"
              >
                <div class="text-secondary">
                  Status
                </div>

                <v-chip
                  :color="adminStore.ingestionResult.status === 'completed'
                    ? 'success'
                    : 'info'"
                  size="small"
                >
                  {{ adminStore.ingestionResult.status }}
                </v-chip>
              </v-col>

              <v-col
                cols="12"
                sm="3"
              >
                <v-card
                  variant="tonal"
                  color="info"
                  class="pa-4 text-center"
                >
                  <div class="text-h5 font-weight-bold">
                    {{ adminStore.ingestionResult.total_books }}
                  </div>

                  <div class="text-secondary">
                    Total
                  </div>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="3"
              >
                <v-card
                  variant="tonal"
                  color="primary"
                  class="pa-4 text-center"
                >
                  <div class="text-h5 font-weight-bold">
                    {{ adminStore.ingestionResult.processed }}
                  </div>

                  <div class="text-secondary">
                    Processed
                  </div>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="3"
              >
                <v-card
                  variant="tonal"
                  color="success"
                  class="pa-4 text-center"
                >
                  <div class="text-h5 font-weight-bold">
                    {{ adminStore.ingestionResult.successful }}
                  </div>

                  <div class="text-secondary">
                    Successful
                  </div>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="3"
              >
                <v-card
                  variant="tonal"
                  color="error"
                  class="pa-4 text-center"
                >
                  <div class="text-h5 font-weight-bold">
                    {{ adminStore.ingestionResult.failed }}
                  </div>

                  <div class="text-secondary">
                    Failed
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div
            v-if="adminStore.errors.ingestion"
            class="mt-4"
          >
            <v-alert
              type="error"
              variant="tonal"
            >
              {{ adminStore.errors.ingestion }}
            </v-alert>
          </div>
        </v-card>
      </v-window-item>

      <!-- Tab 3: Book Search -->
      <v-window-item :key="2">
        <v-card class="pa-6">
          <h2 class="text-h6 mb-4">
            Search Books in External APIs
          </h2>

          <v-form @submit.prevent="searchBooks">
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="searchParams.title"
                  label="Book Title"
                  placeholder="e.g., 1984"
                  required
                  outlined
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="searchParams.author"
                  label="Author (Optional)"
                  placeholder="e.g., George Orwell"
                  outlined
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="searchParams.source"
                  label="Data Source"
                  :items="sourceOptions"
                  outlined
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model.number="searchParams.limit"
                  label="Results Limit"
                  type="number"
                  :min="1"
                  :max="40"
                  outlined
                />
              </v-col>
            </v-row>

            <v-btn
              color="primary"
              type="submit"
              :loading="adminStore.isSearchLoading"
              class="mb-6"
            >
              Search
            </v-btn>
          </v-form>

          <div
            v-if="adminStore.searchResults.length > 0"
            class="space-y-2"
          >
            <v-divider />

            <h3 class="text-subtitle-1 font-weight-bold mt-4">
              Results ({{ adminStore.searchResults.length }})
            </h3>

            <v-list class="mt-4">
              <v-list-item
                v-for="(book, index) in adminStore.searchResults"
                :key="index"
              >
                <template #prepend>
                  <v-avatar
                    v-if="book.cover_url"
                    :image="book.cover_url"
                    size="40"
                  />
                </template>

                <v-list-item-title>{{ book.title }}</v-list-item-title>

                <v-list-item-subtitle>
                  <div>{{ book.authors?.join(', ') || 'Unknown author' }}</div>

                  <div class="">
                    {{ book.source || 'Unknown source' }} • ID: {{ book.id }}
                  </div>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <div
            v-else-if="!adminStore.isSearchLoading && (searchParams.title || adminStore.errors.search)"
            class="py-6 text-center"
          >
            <v-icon
              icon="mdi-magnify"
              size="48"
              class="text-secondary mb-2"
            />

            <p
              v-if="adminStore.errors.search"
              class="text-error"
            >
              {{ adminStore.errors.search }}
            </p>

            <p
              v-else
              class="text-secondary"
            >
              No books found
            </p>
          </div>
        </v-card>
      </v-window-item>

      <!-- Tab 4: Import Dump -->
      <v-window-item :key="3">
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
  </v-container>
</template>
