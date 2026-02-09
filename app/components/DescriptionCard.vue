<script setup lang="ts">
interface Props {
  description?: string | null
  emptyMessage?: string
}

withDefaults(defineProps<Props>(), {
  description: null,
  emptyMessage: 'There is no description yet, we will add it soon.',
})
</script>

<template>
  <v-card>
    <v-card-text>
      <h2 class="text-h5 font-weight-bold mb-4">
        Description
      </h2>

      <p
        v-if="description"
        class="text-body-1"
        style="white-space: pre-line;"
      >
        {{ description }}
      </p>

      <p
        v-else
        class="text-body-1 font-italic"
      >
        {{ emptyMessage }}
      </p>
    </v-card-text>
  </v-card>
</template>
