<script setup lang="ts">
import type { RatingEntry } from '~/types/user'

interface DimensionConfig {
  key: string
  label: string
  color: string
  type: 'quality' | 'spectrum'
  lowLabel: string
  highLabel: string
}

interface Props {
  modelValue: boolean
  slug: string
  initialRating?: RatingEntry | null
  onSave?: (data: Record<string, any>) => Promise<void>
  onDelete?: () => Promise<void>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const bookPageStore = useBookPageStore()

const saving = ref(false)
const deleting = ref(false)

const overallRating = ref(0)
const subRatings = ref<Record<string, number | null>>({
  pacing: null,
  emotional_impact: null,
  intellectual_depth: null,
  writing_quality: null,
  rereadability: null,
  readability: null,
  plot_complexity: null,
  humor: null,
})

const dimensions: DimensionConfig[] = [
  { key: 'emotional_impact', label: 'Emotional Impact', color: 'red', type: 'quality', lowLabel: 'Low impact', highLabel: 'Deeply moving' },
  { key: 'intellectual_depth', label: 'Intellectual Depth', color: 'purple', type: 'quality', lowLabel: 'Surface-level', highLabel: 'Thought-provoking' },
  { key: 'writing_quality', label: 'Writing Quality', color: 'teal', type: 'quality', lowLabel: 'Below average', highLabel: 'Masterful' },
  { key: 'rereadability', label: 'Rereadability', color: 'amber', type: 'quality', lowLabel: 'One-time read', highLabel: 'Worth rereading' },
  { key: 'pacing', label: 'Pacing', color: 'blue', type: 'spectrum', lowLabel: 'Slow', highLabel: 'Fast-paced' },
  { key: 'readability', label: 'Readability', color: 'green', type: 'spectrum', lowLabel: 'Dense', highLabel: 'Light & easy' },
  { key: 'plot_complexity', label: 'Plot Complexity', color: 'orange', type: 'spectrum', lowLabel: 'Simple', highLabel: 'Complex' },
  { key: 'humor', label: 'Humor', color: 'pink', type: 'spectrum', lowLabel: 'Serious', highLabel: 'Very funny' },
]

const existingRating = computed(() => props.initialRating ?? bookPageStore.userRating)
const isEditing = computed(() => !!existingRating.value)
const canSave = computed(() => overallRating.value >= 0.5)

function populateFromExisting() {
  const existing = existingRating.value
  if (existing) {
    overallRating.value = existing.overall_rating
    for (const dim of dimensions) {
      const val = existing[dim.key as keyof typeof existing]
      subRatings.value[dim.key] = typeof val === 'number' ? val : null
    }
  }
  else {
    overallRating.value = 0
    for (const dim of dimensions) {
      subRatings.value[dim.key] = null
    }
  }
}

watch(() => props.modelValue, (open) => {
  if (open)
    populateFromExisting()
})

function clearSubRating(key: string) {
  subRatings.value[key] = null
}

async function handleSave() {
  if (!canSave.value)
    return

  saving.value = true
  try {
    const data: Record<string, any> = { overall_rating: overallRating.value }
    for (const dim of dimensions) {
      if (subRatings.value[dim.key] != null)
        data[dim.key] = subRatings.value[dim.key]
    }

    if (props.onSave) {
      await props.onSave(data)
    }
    else {
      await bookPageStore.submitRating(props.slug, data)
    }
    emit('update:modelValue', false)
    emit('saved')
  }
  catch { /* handled in store */ }
  finally {
    saving.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    if (props.onDelete) {
      await props.onDelete()
    }
    else {
      await bookPageStore.deleteRating(props.slug)
    }
    emit('update:modelValue', false)
  }
  catch { /* handled in store */ }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>
        {{ isEditing
          ? 'Edit Rating'
          : 'Rate This Book' }}
      </v-card-title>

      <v-card-text>
        <!-- Overall Rating (required) -->
        <div class="mb-6">
          <div class="text-subtitle-1 font-weight-bold mb-3">
            Overall Rating
          </div>

          <div class="d-flex flex-column align-center gap-2">
            <v-rating
              v-model="overallRating"
              color="warning"
              active-color="warning"
              hover
              half-increments
              size="large"
              class="rating-spread"
            />

            <div
              v-if="overallRating > 0"
              class="d-flex align-center gap-2"
            >
              <span class="text-body-1 font-weight-bold text-warning">
                {{ overallRating.toFixed(1) }}
              </span>

              <v-btn
                v-if="isEditing"
                icon="mdi-close-circle"
                size="small"
                variant="text"
                color="error"
                :loading="deleting"
                @click="handleDelete"
              />
            </div>
          </div>

          <div class="d-flex justify-space-between mt-3">
            <span class="text-medium-emphasis">Poor</span>

            <span class="text-medium-emphasis">Excellent</span>
          </div>
        </div>

        <v-divider class="mb-4" />

        <!-- Sub-dimensions (optional) -->
        <div class="text-subtitle-2 text-medium-emphasis mb-3">
          Optional dimensions
        </div>

        <div class="d-flex flex-column gap-3">
          <div
            v-for="dim in dimensions"
            :key="dim.key"
            class="my-4"
          >
            <div class="text-body-2 font-weight-medium mb-2">
              {{ dim.label }}
            </div>

            <v-rating
              v-model="subRatings[dim.key]"
              :color="dim.color"
              :active-color="dim.color"
              hover
              half-increments
              density="compact"
              class="rating-spread"
            />

            <div
              v-if="subRatings[dim.key] !== null"
              class="d-flex align-center mt-1 justify-center gap-1"
            >
              <span
                :style="{'color': `rgb(var(--v-theme-${dim.color}))`}"
                class="text-body-2 font-weight-bold"
              >
                {{ subRatings[dim.key]!.toFixed(1) }}
              </span>

              <v-btn
                icon="mdi-close-circle"
                size="small"
                variant="text"
                :color="dim.color"
                @click="clearSubRating(dim.key)"
              />
            </div>

            <div class="d-flex justify-space-between mt-2">
              <span class="text-medium-emphasis">
                {{ dim.lowLabel }}
              </span>

              <span class="text-medium-emphasis">
                {{ dim.highLabel }}
              </span>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="emit('update:modelValue', false)"
        >
          Cancel
        </v-btn>

        <v-btn
          variant="elevated"
          color="primary"
          :loading="saving"
          :disabled="!canSave"
          @click="handleSave"
        >
          {{ isEditing
            ? 'Update'
            : 'Submit' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.rating-spread {
  display: flex !important;
  width: 100% !important;
}

.rating-spread :deep(.v-rating__wrapper) {
  flex: 1 1 0 !important;
  display: flex !important;
  justify-content: center !important;
}
</style>
