<script setup lang="ts">
import type { BookComment } from '~/types/user'

const props = defineProps<{
  comment: BookComment
  isOwn?: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const { t, locale } = useI18n()

const dimensionConfig = computed<Record<string, { label: string, rgb: string }>>(() => ({
  pacing: { label: t('rating.dimensions.pacing'), rgb: '33, 150, 243' },
  emotional_impact: { label: t('rating.dimensions.emotionalImpact'), rgb: '244, 67, 54' },
  intellectual_depth: { label: t('rating.dimensions.intellectualDepth'), rgb: '156, 39, 176' },
  writing_quality: { label: t('rating.dimensions.writingQuality'), rgb: '0, 150, 136' },
  rereadability: { label: t('rating.dimensions.rereadability'), rgb: '255, 193, 7' },
  readability: { label: t('rating.dimensions.readability'), rgb: '76, 175, 80' },
  plot_complexity: { label: t('rating.dimensions.plotComplexity'), rgb: '255, 152, 0' },
  humor: { label: t('rating.dimensions.humor'), rgb: '233, 30, 99' },
}))

interface DateInfo {
  relative: string
  exact: string
}

function formatDate(dateStr: string): DateInfo {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    return { relative: t('time.unknown'), exact: t('time.unknown') }
  }

  const exact = date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  let relative = t('time.justNow')

  if (diffMins < 60) {
    relative = t('time.lessThanHourAgo')
  }
  else if (diffHours < 24) {
    relative = t('time.today')
  }
  else if (diffDays < 7) {
    relative = t('time.daysAgo', { count: diffDays })
  }
  else if (diffWeeks < 4) {
    relative = t('time.weeksAgo', { count: diffWeeks })
  }
  else if (diffMonths < 12) {
    relative = t('time.monthsAgo', { count: diffMonths })
  }
  else {
    relative = t('time.yearsAgo', { count: diffYears })
  }

  return { relative, exact }
}

function getSubRatings(comment: BookComment) {
  if (!comment.rating)
    return []

  return Object.keys(dimensionConfig.value)
    .filter(key => comment.rating?.[key as keyof typeof comment.rating] != null)
    .map(key => ({
      key,
      label: dimensionConfig.value[key]!.label,
      rgb: dimensionConfig.value[key]!.rgb,
      value: comment.rating![key as keyof typeof comment.rating] as number,
    }))
}

function userInitial(comment: BookComment): string {
  const username = comment.username || comment.user?.username || '?'

  return username.charAt(0).toUpperCase()
}

const spoilerRevealed = ref(false)
const isSpoilerHidden = computed(() => props.comment.is_spoiler && !props.isOwn && !spoilerRevealed.value)

const detailedRatings = computed(() => getSubRatings(props.comment))
</script>

<template>
  <v-card
    variant="outlined"
    :class="{'own-comment': isOwn}"
    class="pa-6"
  >
    <div class="d-flex gap-3">
      <!-- User Avatar -->
      <NuxtLinkLocale
        :to="`/bookshelf/${comment.username || comment.user?.username}`"
        class="text-decoration-none flex-shrink-0"
      >
        <v-avatar
          size="40"
          color="primary"
        >
          <span class="text-body-1 font-weight-bold text-white">
            {{ userInitial(comment) }}
          </span>
        </v-avatar>
      </NuxtLinkLocale>

      <!-- Comment Content -->
      <div class="min-w-0 flex-grow-1">
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center gap-2">
            <NuxtLinkLocale
              :to="`/bookshelf/${comment.username || comment.user?.username}`"
              class="text-body-2 font-weight-bold text-decoration-none text-primary"
            >
              {{ comment.username || comment.user?.username }}
            </NuxtLinkLocale>

            <v-chip
              v-if="isOwn"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ t('comment.you') }}
            </v-chip>

            <v-chip
              v-if="comment.is_spoiler"
              size="small"
              color="warning"
              variant="tonal"
              prepend-icon="mdi-alert"
            >
              {{ t('comment.spoiler') }}
            </v-chip>
          </div>

          <div class="d-flex align-center gap-3">
            <div
              v-if="comment.rating && !isSpoilerHidden"
              class="d-flex align-center comment-rating gap-2"
            >
              <v-rating
                :model-value="Math.floor(comment.rating.overall_rating * 2) / 2"
                readonly
                half-increments
                color="warning"
                active-color="warning"
                size="x-small"
                density="compact"
              />

              <span class="tabular text-body-2 font-weight-bold comment-rating-value">
                {{ comment.rating.overall_rating.toFixed(1) }}
              </span>
            </div>

            <!-- Edit / Delete (own comment) -->
            <div
              v-if="isOwn"
              class="d-flex gap-1"
            >
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="emit('edit')"
              />

              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="emit('delete')"
              />
            </div>
          </div>
        </div>

        <!-- Spoiler Warning Overlay -->
        <template v-if="isSpoilerHidden">
          <div class="d-flex flex-column align-center py-4">
            <v-icon
              icon="mdi-eye-off"
              size="24"
              color="warning"
              class="mb-2"
            />

            <span class="text-body-2 text-medium-emphasis mb-2">
              {{ t('comment.spoilerHidden') }}
            </span>

            <v-btn
              variant="outlined"
              size="small"
              color="warning"
              prepend-icon="mdi-eye"
              @click="spoilerRevealed = true"
            >
              {{ t('comment.showSpoiler') }}
            </v-btn>
          </div>
        </template>

        <template v-else>
          <p class="font-reading comment-body mb-4 mt-3">
            {{ comment.body }}
          </p>

          <div
            v-if="detailedRatings.length > 0"
            class="d-flex mb-3 flex-wrap gap-2"
          >
            <v-chip
              v-for="s in detailedRatings"
              :key="s.key"
              size="small"
              variant="outlined"
            >
              <b
                class="tabular mr-1"
                :style="`color: rgb(${s.rgb})`"
              >{{ s.value.toFixed(1) }}</b>

              {{ s.label }}
            </v-chip>
          </div>

          <!-- Date with Tooltip -->
          <v-tooltip location="bottom">
            <template #activator="{'props': tooltipProps}">
              <span
                v-bind="tooltipProps"
                class="text-medium-emphasis cursor-pointer"
              >
                {{ formatDate(comment.comment_created_at).relative }}
              </span>
            </template>

            {{ formatDate(comment.comment_created_at).exact }}
          </v-tooltip>
        </template>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
/*
 * A readonly v-rating is still a row of buttons, and their button padding and
 * line-height push the stars off the baseline of the number beside them.
 */
.comment-rating :deep(.v-rating__item .v-btn) {
  width: auto;
  height: auto;
  padding: 0;
}

.comment-rating :deep(.v-rating__wrapper) {
  align-items: center;
}

.comment-rating-value {
  line-height: 1;
}

.comment-body {
  font-size: 1.0625rem;
  max-width: 68ch;
}

.own-comment {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.06);
}
</style>
