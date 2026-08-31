<script setup lang="ts">
interface Props {
  description?: string | null
  emptyMessage?: string
  charLimit?: number
  truncationWindow?: number
  hideHeading?: boolean
  hideCard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: null,
  charLimit: 500,
  truncationWindow: 20,
})

const { t } = useI18n()

const expanded = ref(false)
const descriptionRef = ref<HTMLElement>()
const expandedHeight = ref(0)

const needsTruncation = computed(() => {
  const desc = props.description
  if (!desc)
    return false

  return desc.length > props.charLimit + props.truncationWindow
})

function toggle() {
  if (descriptionRef.value)
    expandedHeight.value = descriptionRef.value.scrollHeight
  expanded.value = !expanded.value
}
</script>

<template>
  <v-card
    :flat="hideCard"
    :class="hideCard
      ? 'bg-transparent'
      : ''"
    rounded="0"
  >
    <v-card-text
      :class="hideCard
        ? 'pa-2'
        : 'pa-8'"
    >
      <h2
        v-if="!hideHeading"
        class="text-h6 font-weight-bold mb-4"
      >
        {{ t('common.description') }}
      </h2>

      <template v-if="description">
        <div
          ref="descriptionRef"
          class="description-content"
          :class="{'description-collapsed': needsTruncation && !expanded}"
          :style="needsTruncation && expanded && expandedHeight
            ? {'maxHeight': `${expandedHeight}px`}
            : undefined"
        >
          <p
            class="font-reading description-body mb-0"
            style="white-space: pre-line;"
          >
            {{ description }}
          </p>
        </div>

        <v-btn
          v-if="needsTruncation"
          variant="outlined"
          rounded="pill"
          size="small"
          class="mt-5"
          :append-icon="expanded
            ? 'mdi-chevron-up'
            : 'mdi-chevron-down'"
          @click="toggle"
        >
          {{ expanded
            ? t('common.readLess')
            : t('common.readMore') }}
        </v-btn>
      </template>

      <p
        v-else
        class="text-body-1 text-medium-emphasis mb-0 font-italic"
      >
        {{ emptyMessage ?? t('common.noDescription') }}
      </p>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.description-body {
  font-size: 1.0625rem;
  max-width: 68ch;
}

.description-content {
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.description-collapsed {
  max-height: 10em;
  position: relative;
}

/* The fade has to end on whatever surface the block is painted on. */
.description-collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3em;
  background: linear-gradient(transparent, rgb(var(--v-theme-surface)));
  pointer-events: none;
}

.bg-transparent .description-collapsed::after {
  background: linear-gradient(transparent, rgb(var(--v-theme-background)));
}
</style>
