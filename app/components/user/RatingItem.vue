<script setup lang="ts">
import type { RatingEntry } from '~/types/user'

const props = defineProps<{
  entry: RatingEntry
}>()

const localePath = useLocalePath()

const { t } = useI18n()
const ratingsStore = useRatingsStore()
const { dimensions: ratingDimensions } = useRatingDimensions()

const editDialogOpen = ref(false)
const deleteConfirmOpen = ref(false)
const deleting = ref(false)

const subRatings = computed(() =>
  ratingDimensions.value
    .map(dim => ({
      ...dim,
      value: props.entry[dim.key as keyof RatingEntry] as number | null | undefined,
    }))
    .filter(r => r.value != null),
)

async function handleSave(data: Record<string, any>) {
  await ratingsStore.updateRating(props.entry.book_slug, data)
}

async function handleDelete() {
  deleting.value = true
  try {
    await ratingsStore.deleteRating(props.entry.book_slug)
    deleteConfirmOpen.value = false
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <BookUserRow
    :slug="entry.book_slug"
    :title="entry.book_title"
    :cover-url="entry.book_cover_url"
    :author-names="entry.book_author_names"
    :author-slugs="entry.book_author_slugs"
    :updated-at="entry.created_at"
    :show-actions="true"
  >
    <template #dateExtra>
      <span
        v-if="entry.review_text"
        class="text-caption text-medium-emphasis"
      >{{ t('rating.withReview') }}</span>
    </template>

    <template #meta>
      <div
        class="flex-shrink-0 d-flex flex-column align-start gap-1"
        style="width: 140px;"
      >
        <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase">
          {{ t('rating.yourRating') }}
        </div>

        <div class="d-flex align-center gap-1">
          <v-icon
            icon="mdi-star"
            color="warning"
            size="18"
          />

          <span class="text-body-1 font-weight-bold">
            {{ entry.overall_rating.toFixed(1) }}
          </span>
        </div>
      </div>

      <div
        class="flex-shrink-0 d-flex flex-column align-start gap-1"
        style="width: 140px;"
      >
        <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase">
          {{ t('rating.communityAvg') }}
        </div>

        <div
          v-if="entry.book_avg_rating && entry.book_avg_rating > 0"
          class="d-flex align-center gap-1"
        >
          <v-icon
            icon="mdi-star"
            color="secondary"
            size="18"
          />

          <span class="text-body-1">
            {{ entry.book_avg_rating.toFixed(1) }}
          </span>
        </div>

        <span
          v-else
          class="text-caption text-medium-emphasis"
        >—</span>
      </div>
    </template>

    <template #actions>
      <v-btn
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click="editDialogOpen = true"
      />

      <v-btn
        icon="mdi-open-in-new"
        size="small"
        variant="text"
        :to="localePath(`/books/${entry.book_slug}`)"
        :as="NuxtLink"
      />

      <v-btn
        icon="mdi-delete"
        size="small"
        variant="text"
        color="error"
        @click="deleteConfirmOpen = true"
      />
    </template>

    <template
      v-if="subRatings.length > 0"
      #footer
    >
      <v-divider class="mb-2" />

      <div class="d-flex flex-wrap gap-x-6 gap-y-1">
        <div
          v-for="sub in subRatings"
          :key="sub.key"
          class="d-flex align-center gap-2"
          style="min-width: 160px;"
        >
          <span
            class="text-caption font-weight-medium"
            :class="`text-${sub.color}`"
            style="min-width: 80px;"
          >{{ sub.label }}</span>

          <v-progress-linear
            :model-value="(sub.value! / 5) * 100"
            :color="sub.color"
            rounded
            height="6"
            style="width: 80px; flex-shrink: 0;"
          />

          <span class="text-caption font-weight-bold">{{ sub.value!.toFixed(1) }}</span>
        </div>
      </div>
    </template>
  </BookUserRow>

  <RatingDialog
    v-model="editDialogOpen"
    :slug="entry.book_slug"
    :initial-rating="entry"
    :on-save="handleSave"
    :on-delete="() => ratingsStore.deleteRating(entry.book_slug)"
  />

  <v-dialog
    v-model="deleteConfirmOpen"
    max-width="360"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ t('rating.deleteConfirmTitle') }}
      </v-card-title>

      <v-card-text>
        {{ t('rating.deleteConfirmBody', {'title': entry.book_title}) }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="deleteConfirmOpen = false"
        >
          {{ t('common.cancel') }}
        </v-btn>

        <v-btn
          color="error"
          variant="elevated"
          :loading="deleting"
          @click="handleDelete"
        >
          {{ t('common.delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
