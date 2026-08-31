<script setup lang="ts">
import type { AuthorStats } from '~/types/api'

interface Props {
  authorName: string
  stats?: AuthorStats | null
}

const props = defineProps<Props>()

const { t, n } = useI18n()
const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()

const RING_RADIUS = 45
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const worksCount = computed(() => props.stats?.works_count ?? 0)
const worksRead = computed(() => props.stats?.progress.works_read ?? 0)
const worksShelved = computed(() => props.stats?.progress.works_shelved ?? 0)

const percentRead = computed(() => (worksCount.value > 0
  ? Math.round((worksRead.value / worksCount.value) * 100)
  : 0))

const dashOffset = computed(() => RING_CIRCUMFERENCE * (1 - percentRead.value / 100))
</script>

<template>
  <v-card v-if="authStore.isAuthenticated">
    <v-card-text>
      <div class="text-overline text-medium-emphasis mb-5">
        {{ t('authorPage.yourProgress') }}
      </div>

      <div class="d-flex align-center gap-6">
        <svg
          width="104"
          height="104"
          viewBox="0 0 104 104"
          class="flex-shrink-0"
          aria-hidden="true"
        >
          <circle
            cx="52"
            cy="52"
            :r="RING_RADIUS"
            fill="none"
            stroke="rgba(var(--v-theme-on-surface), 0.12)"
            stroke-width="10"
          />

          <circle
            cx="52"
            cy="52"
            :r="RING_RADIUS"
            fill="none"
            stroke="rgb(var(--v-theme-primary))"
            stroke-width="10"
            stroke-linecap="round"
            :stroke-dasharray="RING_CIRCUMFERENCE"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 52 52)"
          />

          <text
            x="52"
            y="50"
            text-anchor="middle"
            class="font-display"
            font-size="26"
            font-weight="700"
            fill="currentColor"
          >{{ percentRead }}%</text>

          <text
            x="52"
            y="69"
            text-anchor="middle"
            font-size="9"
            font-weight="800"
            letter-spacing="1.5"
            fill="rgba(var(--v-theme-on-surface), 0.6)"
          >{{ t('bookshelf.read').toUpperCase() }}</text>
        </svg>

        <div class="d-flex flex-column gap-4">
          <div>
            <div class="text-overline text-medium-emphasis">
              {{ t('authorPage.worksRead') }}
            </div>

            <div class="tabular text-h6 font-weight-bold">
              {{ n(worksRead) }}

              <span class="text-body-2 text-medium-emphasis font-weight-regular">
                {{ t('authorPage.worksReadOf', {'total': n(worksCount)}) }}
              </span>
            </div>
          </div>

          <div>
            <div class="text-overline text-medium-emphasis">
              {{ t('authorPage.onYourShelves') }}
            </div>

            <div class="tabular text-h6 font-weight-bold">
              {{ n(worksShelved) }}
            </div>
          </div>
        </div>
      </div>

      <v-divider class="my-5" />

      <div class="text-caption text-medium-emphasis">
        {{ t('authorPage.progressFootnote', {'name': authorName,
                                             'count': n(worksCount)}) }}
      </div>
    </v-card-text>
  </v-card>

  <v-card v-else>
    <v-card-text>
      <div class="text-overline text-medium-emphasis mb-3">
        {{ t('authorPage.yourProgress') }}
      </div>

      <h3 class="text-h6 font-weight-bold mb-3">
        {{ t('authorPage.guestProgressTitle', {'name': authorName}) }}
      </h3>

      <div class="text-medium-emphasis text-body-2 mb-5">
        {{ t('authorPage.guestProgressBody', {'count': n(worksCount)}) }}
      </div>

      <div class="d-flex flex-wrap gap-3">
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          @click="authDialogStore.openLogin()"
        >
          {{ t('auth.signIn') }}
        </v-btn>

        <v-btn
          variant="outlined"
          rounded="pill"
          @click="authDialogStore.openRegister()"
        >
          {{ t('auth.createAccount') }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
