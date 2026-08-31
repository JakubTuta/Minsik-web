<script setup lang="ts">
import type { BookshelfStatus } from '~/types/user'

interface Props {
  slug: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
const bookPageStore = useBookPageStore()

const showRatingDialog = ref(false)

const shelfOptions = computed<Array<{ value: BookshelfStatus, label: string, icon: string }>>(() => [
  { value: 'want_to_read', label: t('bookshelf.wantToRead'), icon: 'mdi-bookmark-outline' },
  { value: 'reading', label: t('bookshelf.reading'), icon: 'mdi-book-open-page-variant' },
  { value: 'read', label: t('bookshelf.read'), icon: 'mdi-check' },
  { value: 'abandoned', label: t('bookshelf.abandoned'), icon: 'mdi-close' },
])

/**
 * Re-picking the active shelf clears it, which is the only way off a shelf now
 * that the segmented control replaced the dialog's explicit remove button.
 */
function selectShelf(status: BookshelfStatus) {
  if (bookPageStore.bookshelfStatus === status) {
    bookPageStore.removeFromBookshelf(props.slug)

    return
  }
  bookPageStore.upsertBookshelf(props.slug, status)
}

const quickRating = computed({
  get: () => bookPageStore.userRating?.overall_rating ?? 0,
  /**
   * Sends the overall score alone. The eight axes and any written review are
   * left out of the payload rather than sent empty, so rating from here never
   * erases what the reader entered in the full dialog.
   */
  set: (value: number) => bookPageStore.submitRating(props.slug, { overall_rating: value }),
})

const ratedAxes = computed(() => {
  const rating = bookPageStore.userRating
  if (!rating)
    return 0

  return [
    rating.emotional_impact,
    rating.intellectual_depth,
    rating.writing_quality,
    rating.rereadability,
    rating.pacing,
    rating.readability,
    rating.plot_complexity,
    rating.humor,
  ].filter(value => !!value).length
})

function requireAuth(action: () => void) {
  if (!authStore.isAuthenticated) {
    authDialogStore.openLogin()

    return
  }
  action()
}
</script>

<template>
  <v-card color="surface-variant">
    <v-card-text
      v-if="authStore.isAuthenticated"
      class="pa-4"
    >
      <div class="text-overline text-medium-emphasis mb-2">
        {{ t('bookPage.onYourShelf') }}
      </div>

      <div class="d-flex flex-wrap gap-2">
        <v-btn
          v-for="option in shelfOptions"
          :key="option.value"
          :icon="option.icon"
          :variant="bookPageStore.bookshelfStatus === option.value
            ? 'elevated'
            : 'outlined'"
          :color="bookPageStore.bookshelfStatus === option.value
            ? 'primary'
            : 'secondary'"
          size="small"
          :aria-label="option.label"
          @click="selectShelf(option.value)"
        >
          <v-icon :icon="option.icon" />

          <v-tooltip
            activator="parent"
            location="top"
          >
            {{ option.label }}
          </v-tooltip>
        </v-btn>
      </div>

      <v-divider class="my-3" />

      <div class="text-overline text-medium-emphasis mb-1">
        {{ t('rating.yourRating') }}
      </div>

      <div class="d-flex align-center gap-2">
        <v-rating
          v-model="quickRating"
          half-increments
          hover
          color="warning"
          active-color="warning"
          size="small"
          density="compact"
        />

        <span
          v-if="quickRating"
          class="font-display tabular text-body-1 font-weight-bold text-primary"
        >
          {{ quickRating.toFixed(1) }}
        </span>
      </div>

      <div
        v-if="ratedAxes > 0"
        class="text-caption text-medium-emphasis mt-1"
      >
        {{ t('bookPage.quickRateHintWithAxes', {'count': ratedAxes}) }}
      </div>

      <div class="d-flex align-center mt-4 gap-2">
        <v-btn
          :variant="bookPageStore.isFavourite
            ? 'elevated'
            : 'text'"
          color="error"
          size="small"
          :icon="bookPageStore.isFavourite
            ? 'mdi-heart'
            : 'mdi-heart-outline'"
          :aria-label="bookPageStore.isFavourite
            ? t('bookPage.favourited')
            : t('bookPage.favourite')"
          @click="requireAuth(() => bookPageStore.toggleFavourite(props.slug))"
        />

        <v-btn
          variant="flat"
          color="primary"
          size="small"
          rounded="pill"
          class="detailed-rating flex-grow-1"
          prepend-icon="mdi-chart-donut-variant"
          @click="showRatingDialog = true"
        >
          {{ t('bookPage.rateAllAxes') }}
        </v-btn>
      </div>
    </v-card-text>

    <v-card-text
      v-else
      class="d-flex align-center justify-space-between flex-wrap gap-6"
    >
      <div>
        <h3 class="text-h6 font-weight-bold mb-2">
          {{ t('bookPage.guestShelfTitle') }}
        </h3>

        <div
          class="text-medium-emphasis text-body-2"
          style="max-width: 60ch;"
        >
          {{ t('bookPage.guestShelfBody') }}
        </div>
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

    <RatingDialog
      v-model="showRatingDialog"
      :slug="slug"
    />
  </v-card>
</template>

<style scoped>
.detailed-rating :deep(.v-btn__prepend) {
  position: absolute;
  left: 14px;
  margin: 0;
}
</style>
