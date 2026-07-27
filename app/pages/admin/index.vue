<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t, n } = useI18n()
useSeo({ title: t('adminPage.title'), description: t('adminPage.seoDescription') })

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
          {{ t('adminPage.title') }}
        </h1>

        <p class="text-secondary mb-0">
          {{ t('adminPage.subtitle') }}
        </p>
      </div>
    </div>

    <v-tabs
      v-model="currentTab"
      class="mb-6"
    >
      <v-tab>{{ t('adminPage.tabCoverage') }}</v-tab>

      <v-tab>{{ t('adminPage.tabImportDump') }}</v-tab>

      <v-tab>{{ t('adminPage.tabScheduledJobs') }}</v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
      <!-- Tab 1: Coverage -->
      <v-window-item :key="0">
        <v-card class="pa-6">
          <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h6">
              {{ t('adminPage.databaseCoverage') }}
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
                    {{ n(adminStore.coverage.db_books_count) }}
                  </div>

                  <div class="text-secondary">
                    {{ t('adminPage.booksInDatabase') }}
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
                    {{ n(adminStore.coverage.db_authors_count) }}
                  </div>

                  <div class="text-secondary">
                    {{ t('adminPage.authorsLabel') }}
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
                    {{ n(adminStore.coverage.db_series_count) }}
                  </div>

                  <div class="text-secondary">
                    {{ t('adminPage.seriesLabel') }}
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
                    {{ t('adminPage.cached') }}
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
              {{ t('adminPage.noCoverageData') }}
            </p>
          </div>
        </v-card>
      </v-window-item>

      <!-- Tab 2: Import Dump -->
      <v-window-item :key="1">
        <v-card class="pa-6">
          <h2 class="text-h6 mb-4">
            {{ t('adminPage.importTitle') }}
          </h2>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            {{ t('adminPage.importInfo') }}
          </v-alert>

          <v-alert
            type="warning"
            variant="tonal"
            class="mb-6"
          >
            {{ t('adminPage.importWarning') }}
          </v-alert>

          <v-btn
            color="primary"
            @click="importConfirmDialog = true"
          >
            {{ t('adminPage.startDumpImport') }}
          </v-btn>

          <div
            v-if="adminStore.importResult"
            class="mt-6"
          >
            <v-divider class="mb-4" />

            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              {{ t('adminPage.result') }}
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
                {{ t('adminPage.cleansingTitle') }}
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                {{ t('adminPage.cleansingInfo') }}
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                {{ t('adminPage.cleansingWarning') }}
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isCleanupLoading"
                @click="cleanupConfirmDialog = true"
              >
                {{ t('adminPage.runDataCleansing') }}
              </v-btn>

              <div
                v-if="adminStore.cleanupResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  {{ t('adminPage.result') }}
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
                {{ t('adminPage.reindexTitle') }}
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                {{ t('adminPage.reindexInfo') }}
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                {{ t('adminPage.reindexWarning') }}
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isReindexLoading"
                @click="reindexConfirmDialog = true"
              >
                {{ t('adminPage.runFullReindex') }}
              </v-btn>

              <div
                v-if="adminStore.reindexResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  {{ t('adminPage.result') }}
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
                {{ t('adminPage.rebuildHomeRecs') }}
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <i18n-t
                  keypath="adminPage.homeRecsInfo"
                  tag="span"
                >
                  <template #code>
                    <code>rec:{category}</code>
                  </template>
                </i18n-t>
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                {{ t('adminPage.homeRecsWarning') }}
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isRecommendationsRefreshLoading"
                @click="recommendationsRefreshConfirmDialog = true"
              >
                {{ t('adminPage.flushCacheRebuild') }}
              </v-btn>

              <div
                v-if="adminStore.recommendationsRefreshResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  {{ t('adminPage.result') }}
                </h3>

                <v-chip
                  :color="adminStore.recommendationsRefreshResult.success
                    ? 'success'
                    : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.recommendationsRefreshResult.success
                    ? t('adminPage.statusSuccess')
                    : t('adminPage.statusFailed') }}
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
                {{ t('adminPage.rebuildPersonalRecs') }}
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <i18n-t
                  keypath="adminPage.personalRecsInfo"
                  tag="span"
                >
                  <template #code1>
                    <code>rec:profile:*</code>
                  </template>

                  <template #code2>
                    <code>rec:personal:*</code>
                  </template>
                </i18n-t>
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                {{ t('adminPage.personalRecsWarning') }}
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isPersonalRecommendationsRefreshLoading"
                @click="personalRecommendationsRefreshConfirmDialog = true"
              >
                {{ t('adminPage.flushRebuild') }}
              </v-btn>

              <div
                v-if="adminStore.personalRecommendationsRefreshResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  {{ t('adminPage.result') }}
                </h3>

                <v-chip
                  :color="adminStore.personalRecommendationsRefreshResult.success
                    ? 'success'
                    : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.personalRecommendationsRefreshResult.success
                    ? t('adminPage.statusSuccess')
                    : t('adminPage.statusFailed') }}
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
                {{ t('adminPage.refreshForUser') }}
              </h3>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                {{ t('adminPage.refreshForUserInfo') }}
              </v-alert>

              <div class="d-flex gap-3 align-start">
                <v-text-field
                  v-model="userPersonalRefreshUsername"
                  :label="t('adminPage.userNickname')"
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
                  {{ t('adminPage.flushRebuild') }}
                </v-btn>
              </div>

              <div
                v-if="adminStore.userPersonalRecommendationsRefreshResult"
                class="mt-6"
              >
                <v-chip
                  :color="adminStore.userPersonalRecommendationsRefreshResult.success
                    ? 'success'
                    : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.userPersonalRecommendationsRefreshResult.success
                    ? t('adminPage.statusSuccess')
                    : t('adminPage.statusFailed') }}
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
                {{ t('adminPage.rebuildContextualRecs') }}
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <i18n-t
                  keypath="adminPage.contextualRecsInfo"
                  tag="span"
                >
                  <template #code1>
                    <code>rec:book:*</code>
                  </template>

                  <template #code2>
                    <code>rec:author:*</code>
                  </template>

                  <template #code3>
                    <code>rec:series:*</code>
                  </template>
                </i18n-t>
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                {{ t('adminPage.contextualRecsWarning') }}
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isContextualRecommendationsRefreshLoading"
                @click="contextualRecommendationsRefreshConfirmDialog = true"
              >
                {{ t('adminPage.flushRebuild') }}
              </v-btn>

              <div
                v-if="adminStore.contextualRecommendationsRefreshResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  {{ t('adminPage.result') }}
                </h3>

                <v-chip
                  :color="adminStore.contextualRecommendationsRefreshResult.success
                    ? 'success'
                    : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.contextualRecommendationsRefreshResult.success
                    ? t('adminPage.statusSuccess')
                    : t('adminPage.statusFailed') }}
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
                {{ t('adminPage.invalidateEntityTitle') }}
              </h3>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <i18n-t
                  keypath="adminPage.invalidateEntityInfo"
                  tag="span"
                >
                  <template #code>
                    <code>rec:{type}:{id}</code>
                  </template>
                </i18n-t>
              </v-alert>

              <div class="d-flex flex-wrap gap-3 align-start">
                <v-select
                  v-model="contextualInvalidateEntityType"
                  :items="[
                    'book',
                    'author',
                    'series',
                  ]"
                  :label="t('adminPage.entityType')"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  style="max-width: 180px;"
                />

                <v-text-field
                  v-model="contextualInvalidateSlug"
                  :label="t('adminPage.slug')"
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
                  {{ t('adminPage.invalidate') }}
                </v-btn>
              </div>

              <div
                v-if="adminStore.contextualInvalidateResult"
                class="mt-6"
              >
                <v-chip
                  :color="adminStore.contextualInvalidateResult.success
                    ? 'success'
                    : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.contextualInvalidateResult.success
                    ? t('adminPage.statusSuccess')
                    : t('adminPage.statusFailed') }}
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
                {{ t('adminPage.rebuildBookOfTheWeek') }}
              </h2>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <i18n-t
                  keypath="adminPage.bowInfo"
                  tag="span"
                >
                  <template #code>
                    <code>bow:current</code>
                  </template>
                </i18n-t>
              </v-alert>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                {{ t('adminPage.bowWarning') }}
              </v-alert>

              <v-btn
                color="primary"
                :loading="adminStore.isBookOfTheWeekRefreshLoading"
                @click="bookOfTheWeekRefreshConfirmDialog = true"
              >
                {{ t('adminPage.flushReselect') }}
              </v-btn>

              <div
                v-if="adminStore.bookOfTheWeekRefreshResult"
                class="mt-6"
              >
                <v-divider class="mb-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  {{ t('adminPage.result') }}
                </h3>

                <v-chip
                  :color="adminStore.bookOfTheWeekRefreshResult.success
                    ? 'success'
                    : 'error'"
                  size="small"
                  class="mb-3"
                >
                  {{ adminStore.bookOfTheWeekRefreshResult.success
                    ? t('adminPage.statusSuccess')
                    : t('adminPage.statusFailed') }}
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
          {{ t('adminPage.confirmDumpImportTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmDumpImportBody1') }}
          </div>

          <div>
            {{ t('adminPage.confirmDumpImportBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isImportLoading"
            @click="importConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isImportLoading"
            @click="confirmImportDump"
          >
            {{ t('adminPage.confirmImport') }}
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
          {{ t('adminPage.confirmCleanupTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmCleanupBody1') }}
          </div>

          <div>
            {{ t('adminPage.confirmCleanupBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isCleanupLoading"
            @click="cleanupConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="error"
            variant="elevated"
            :loading="adminStore.isCleanupLoading"
            @click="confirmCleanup"
          >
            {{ t('adminPage.confirmCleanupBtn') }}
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
          {{ t('adminPage.confirmReindexTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmReindexBody1') }}
          </div>

          <div>
            {{ t('adminPage.confirmReindexBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isReindexLoading"
            @click="reindexConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isReindexLoading"
            @click="confirmReindex"
          >
            {{ t('adminPage.confirmReindexBtn') }}
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
          {{ t('adminPage.confirmCacheRebuildTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmCacheRebuildBody1') }}
          </div>

          <div>
            {{ t('adminPage.confirmCacheRebuildBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isRecommendationsRefreshLoading"
            @click="recommendationsRefreshConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isRecommendationsRefreshLoading"
            @click="confirmRecommendationsRefresh"
          >
            {{ t('adminPage.confirmRebuild') }}
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
          {{ t('adminPage.confirmPersonalRebuildTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmPersonalRebuildBody1') }}
          </div>

          <div>
            {{ t('adminPage.confirmPersonalRebuildBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isPersonalRecommendationsRefreshLoading"
            @click="personalRecommendationsRefreshConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isPersonalRecommendationsRefreshLoading"
            @click="confirmPersonalRecommendationsRefresh"
          >
            {{ t('adminPage.confirmRebuild') }}
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
          {{ t('adminPage.confirmPerUserRebuildTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmPerUserRebuildBody1Prefix') }}
            <strong>{{ userPersonalRefreshUsername.trim() }}</strong>
            {{ t('adminPage.confirmPerUserRebuildBody1Suffix') }}
          </div>

          <div>
            {{ t('adminPage.confirmPerUserRebuildBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isUserPersonalRecommendationsRefreshLoading"
            @click="userPersonalRecommendationsRefreshConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isUserPersonalRecommendationsRefreshLoading"
            @click="confirmUserPersonalRecommendationsRefresh"
          >
            {{ t('adminPage.confirmRebuild') }}
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
          {{ t('adminPage.confirmContextualRebuildTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmContextualRebuildBody1') }}
          </div>

          <div>
            {{ t('adminPage.confirmContextualRebuildBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isContextualRecommendationsRefreshLoading"
            @click="contextualRecommendationsRefreshConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isContextualRecommendationsRefreshLoading"
            @click="confirmContextualRecommendationsRefresh"
          >
            {{ t('adminPage.confirmRebuild') }}
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
          {{ t('adminPage.confirmInvalidateTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmInvalidateBody1Prefix') }}
            <strong>{{ contextualInvalidateEntityType }}</strong>
            {{ t('adminPage.confirmInvalidateBody1Middle') }}
            <strong>{{ contextualInvalidateSlug.trim() }}</strong>.
          </div>

          <div>
            {{ t('adminPage.confirmInvalidateBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isContextualInvalidateLoading"
            @click="contextualInvalidateConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isContextualInvalidateLoading"
            @click="confirmContextualInvalidate"
          >
            {{ t('adminPage.confirmInvalidateBtn') }}
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
          {{ t('adminPage.confirmBowRefreshTitle') }}
        </v-card-title>

        <v-card-text class="text-body-2">
          <div class="mb-2">
            {{ t('adminPage.confirmBowRefreshBody1') }}
          </div>

          <div>
            {{ t('adminPage.confirmBowRefreshBody2') }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="adminStore.isBookOfTheWeekRefreshLoading"
            @click="bookOfTheWeekRefreshConfirmDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :loading="adminStore.isBookOfTheWeekRefreshLoading"
            @click="confirmBookOfTheWeekRefresh"
          >
            {{ t('adminPage.confirmRefresh') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
