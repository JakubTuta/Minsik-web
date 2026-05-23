<script setup lang="ts">
interface Props {
  description?: string | null
  emptyMessage?: string
  collapsible?: boolean
  maxChars?: number
  hideCard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: null,
  emptyMessage: 'There is no description yet, we will add it soon.',
  collapsible: false,
  maxChars: 400,
  hideCard: false,
})

const expanded = ref(false)

const needsCollapse = computed(() =>
  props.collapsible && !!props.description && props.description.length > props.maxChars,
)

const displayText = computed(() => {
  if (!props.description)
    return null
  if (needsCollapse.value && !expanded.value)
    return `${props.description.slice(0, props.maxChars)}...`
  return props.description
})
</script>

<template>
  <v-card v-if="!hideCard">
    <v-card-text>
      <h2 class="text-h5 font-weight-bold mb-4">
        Description
      </h2>

      <p
        v-if="displayText"
        class="text-body-1"
        style="white-space: pre-line;"
      >
        {{ displayText }}
      </p>

      <p
        v-else
        class="text-body-1 font-italic"
      >
        {{ emptyMessage }}
      </p>

      <v-btn
        v-if="needsCollapse"
        variant="text"
        size="small"
        class="mt-1 px-0"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Show less' : 'Show more' }}
      </v-btn>
    </v-card-text>
  </v-card>

  <div v-else>
    <p
      v-if="displayText"
      class="text-body-1"
      style="white-space: pre-line;"
    >
      {{ displayText }}
    </p>

    <p
      v-else-if="emptyMessage"
      class="text-body-1 font-italic text-medium-emphasis"
    >
      {{ emptyMessage }}
    </p>

    <v-btn
      v-if="needsCollapse"
      variant="text"
      size="small"
      class="mt-1 px-0"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Show less' : 'Show more' }}
    </v-btn>
  </div>
</template>
