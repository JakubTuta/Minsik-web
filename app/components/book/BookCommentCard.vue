<script setup lang="ts">
import type { BookComment } from '~/types/user'

interface Props {
  comment: BookComment
  isOwn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOwn: false,
})

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const dimensionConfig: Record<string, { label: string, rgb: string }> = {
  pacing: { label: 'Pacing', rgb: '33, 150, 243' },
  emotional_impact: { label: 'Emotional Impact', rgb: '244, 67, 54' },
  intellectual_depth: { label: 'Intellectual Depth', rgb: '156, 39, 176' },
  writing_quality: { label: 'Writing Quality', rgb: '0, 150, 136' },
  rereadability: { label: 'Rereadability', rgb: '255, 193, 7' },
  readability: { label: 'Readability', rgb: '76, 175, 80' },
  plot_complexity: { label: 'Plot Complexity', rgb: '255, 152, 0' },
  humor: { label: 'Humor', rgb: '233, 30, 99' },
}

interface DateInfo {
  relative: string
  exact: string
}

function formatDate(dateStr: string): DateInfo {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    return { relative: 'Unknown', exact: 'Unknown' }
  }

  const exact = date.toLocaleDateString('en-US', {
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

  let relative = 'just now'

  if (diffMins < 60) {
    relative = 'less than an hour ago'
  }
  else if (diffHours < 24) {
    relative = 'less than a day ago'
  }
  else if (diffDays < 7) {
    relative = `${diffDays} day${diffDays !== 1
      ? 's'
      : ''} ago`
  }
  else if (diffWeeks < 4) {
    relative = `${diffWeeks} week${diffWeeks !== 1
      ? 's'
      : ''} ago`
  }
  else if (diffMonths < 12) {
    relative = `${diffMonths} month${diffMonths !== 1
      ? 's'
      : ''} ago`
  }
  else {
    relative = `${diffYears} year${diffYears !== 1
      ? 's'
      : ''} ago`
  }

  return { relative, exact }
}

function getSubRatings(comment: BookComment) {
  if (!comment.rating)
    return []

  return Object.keys(dimensionConfig)
    .filter(key => comment.rating?.[key as keyof typeof comment.rating] != null)
    .map(key => ({
      key,
      label: dimensionConfig[key]!.label,
      rgb: dimensionConfig[key]!.rgb,
      value: comment.rating![key as keyof typeof comment.rating] as number,
    }))
}

function userInitial(comment: BookComment): string {
  return comment.username.charAt(0).toUpperCase()
}

const spoilerRevealed = ref(false)
const isSpoilerHidden = computed(() => props.comment.is_spoiler && !props.isOwn && !spoilerRevealed.value)

const detailedRatings = computed(() => getSubRatings(props.comment))
</script>

<template>
  <v-card
    :variant="isOwn
      ? 'elevated'
      : 'outlined'"
    :elevation="isOwn
      ? 3
      : 0"
    class="pa-4"
  >
    <div class="d-flex gap-3">
      <!-- User Avatar -->
      <NuxtLink
        :to="`/bookshelf/${comment.username}`"
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
      </NuxtLink>

      <!-- Comment Content -->
      <div class="min-w-0 flex-grow-1">
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center gap-2">
            <NuxtLink
              :to="`/bookshelf/${comment.username}`"
              class="text-body-2 font-weight-bold text-decoration-none text-primary"
            >
              {{ comment.username }}
            </NuxtLink>

            <v-chip
              v-if="isOwn"
              size="x-small"
              color="primary"
              variant="tonal"
            >
              You
            </v-chip>

            <v-chip
              v-if="comment.is_spoiler"
              size="x-small"
              color="warning"
              variant="tonal"
              prepend-icon="mdi-alert"
            >
              Spoiler
            </v-chip>
          </div>

          <!-- Edit / Delete (own comment) -->
          <div
            v-if="isOwn"
            class="d-flex gap-1"
          >
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              variant="text"
              @click="emit('edit')"
            />

            <v-btn
              icon="mdi-delete"
              size="x-small"
              variant="text"
              color="error"
              @click="emit('delete')"
            />
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
              This comment contains spoilers
            </span>

            <v-btn
              variant="outlined"
              size="small"
              color="warning"
              prepend-icon="mdi-eye"
              @click="spoilerRevealed = true"
            >
              Show Spoiler
            </v-btn>
          </div>
        </template>

        <template v-else>
          <!-- Overall Rating with Detailed Tooltip -->
          <div
            v-if="comment.rating"
            class="d-flex align-center mb-2 gap-2"
          >
            <span class="text-body-2 font-weight-bold text-secondary">
              {{ comment.rating.overall_rating.toFixed(1) }}
            </span>

            <v-tooltip
              v-if="detailedRatings.length > 0"
              location="bottom"
            >
              <template #activator="{'props': tooltipProps}">
                <span
                  v-bind="tooltipProps"
                  class="text-caption text-secondary cursor-pointer"
                  style="text-decoration: underline dotted;"
                >
                  Detailed rating
                </span>
              </template>

              <div class="d-flex flex-column gap-1 pa-1">
                <div
                  v-for="s in detailedRatings"
                  :key="s.key"
                  class="d-flex align-center gap-2"
                >
                  <span
                    class="text-caption font-weight-bold"
                    :style="`color: rgb(${s.rgb}); min-width: 28px; text-align: right;`"
                  >
                    {{ s.value.toFixed(1) }}
                  </span>

                  <span
                    class="text-caption"
                    :style="`color: rgb(${s.rgb})`"
                  >
                    {{ s.label }}
                  </span>
                </div>
              </div>
            </v-tooltip>
          </div>

          <!-- Comment Body -->
          <p class="text-body-2 mb-1">
            {{ comment.body }}
          </p>

          <!-- Date with Tooltip -->
          <v-tooltip location="bottom">
            <template #activator="{'props': tooltipProps}">
              <span
                v-bind="tooltipProps"
                class="text-caption text-medium-emphasis cursor-pointer"
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
