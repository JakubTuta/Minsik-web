<script setup lang="ts">
interface Props {
  description?: string | null
  emptyMessage?: string
  charLimit?: number
  truncationWindow?: number
}

const props = withDefaults(defineProps<Props>(), {
  description: null,
  emptyMessage: 'There is no description yet, we will add it soon.',
  charLimit: 500,
  truncationWindow: 20,
})

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
  <v-card>
    <v-card-text>
      <h2 class="text-h6 font-weight-bold mb-3">
        Description
      </h2>

      <template v-if="description">
        <div
          ref="descriptionRef"
          class="description-content"
          :class="{ 'description-collapsed': needsTruncation && !expanded }"
          :style="needsTruncation && expanded && expandedHeight
            ? { 'maxHeight': `${expandedHeight}px` }
            : undefined"
        >
          <p
            class="text-body-1 mb-0"
            style="white-space: pre-line;"
          >
            {{ description }}
          </p>
        </div>

        <v-btn
          v-if="needsTruncation"
          variant="text"
          color="secondary"
          size="small"
          class="mt-2"
          @click="toggle"
        >
          {{ expanded
            ? 'Read less'
            : 'Read more' }}
        </v-btn>
      </template>

      <p
        v-else
        class="text-body-1 text-medium-emphasis mb-0 font-italic"
      >
        {{ emptyMessage }}
      </p>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.description-content {
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.description-collapsed {
  max-height: 10em;
  position: relative;
}

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
</style>
