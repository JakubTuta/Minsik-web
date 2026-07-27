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

const { t } = useI18n()
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

const dimensions = computed<DimensionConfig[]>(() => [
  { key: 'emotional_impact', label: t('rating.dimensions.emotionalImpact'), color: 'red', type: 'quality', lowLabel: t('rating.hints.emotionalImpact.low'), highLabel: t('rating.hints.emotionalImpact.high') },
  { key: 'intellectual_depth', label: t('rating.dimensions.intellectualDepth'), color: 'purple', type: 'quality', lowLabel: t('rating.hints.intellectualDepth.low'), highLabel: t('rating.hints.intellectualDepth.high') },
  { key: 'writing_quality', label: t('rating.dimensions.writingQuality'), color: 'teal', type: 'quality', lowLabel: t('rating.hints.writingQuality.low'), highLabel: t('rating.hints.writingQuality.high') },
  { key: 'rereadability', label: t('rating.dimensions.rereadability'), color: 'amber', type: 'quality', lowLabel: t('rating.hints.rereadability.low'), highLabel: t('rating.hints.rereadability.high') },
  { key: 'pacing', label: t('rating.dimensions.pacing'), color: 'blue', type: 'spectrum', lowLabel: t('rating.hints.pacing.low'), highLabel: t('rating.hints.pacing.high') },
  { key: 'readability', label: t('rating.dimensions.readability'), color: 'green', type: 'spectrum', lowLabel: t('rating.hints.readability.low'), highLabel: t('rating.hints.readability.high') },
  { key: 'plot_complexity', label: t('rating.dimensions.plotComplexity'), color: 'orange', type: 'spectrum', lowLabel: t('rating.hints.plotComplexity.low'), highLabel: t('rating.hints.plotComplexity.high') },
  { key: 'humor', label: t('rating.dimensions.humor'), color: 'pink', type: 'spectrum', lowLabel: t('rating.hints.humor.low'), highLabel: t('rating.hints.humor.high') },
])

const existingRating = computed(() => props.initialRating ?? bookPageStore.userRating)
const isEditing = computed(() => !!existingRating.value)
const canSave = computed(() => overallRating.value >= 0.5)

function populateFromExisting() {
  const existing = existingRating.value
  if (existing) {
    overallRating.value = existing.overall_rating
    for (const dim of dimensions.value) {
      const val = existing[dim.key as keyof typeof existing]
      subRatings.value[dim.key] = typeof val === 'number'
        ? val
        : null
    }
  }
  else {
    overallRating.value = 0
    for (const dim of dimensions.value) {
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
    for (const dim of dimensions.value) {
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
  catch {
    useToastStore().error(t('rating.saveFailed'))
  }
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
  catch {
    useToastStore().error(t('rating.deleteFailed'))
  }
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
          ? t('rating.edit')
          : t('rating.dialogTitle') }}
      </v-card-title>

      <v-card-text>
        <!-- Overall Rating (required) -->
        <div class="mb-6">
          <div class="text-subtitle-1 font-weight-bold mb-3">
            {{ t('rating.overallRating') }}
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
            <span class="text-medium-emphasis">{{ t('rating.poor') }}</span>

            <span class="text-medium-emphasis">{{ t('rating.excellent') }}</span>
          </div>
        </div>

        <v-divider class="mb-4" />

        <!-- Sub-dimensions (optional) -->
        <div class="text-subtitle-2 text-medium-emphasis mb-3">
          {{ t('rating.optionalDimensions') }}
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
          {{ t('common.cancel') }}
        </v-btn>

        <v-btn
          variant="elevated"
          color="primary"
          :loading="saving"
          :disabled="!canSave"
          @click="handleSave"
        >
          {{ isEditing
            ? t('common.update')
            : t('common.submit') }}
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
