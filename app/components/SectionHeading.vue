<script setup lang="ts">
interface Props {
  eyebrow?: string | null
  title: string
  subtitle?: string | null
}

withDefaults(defineProps<Props>(), {
  eyebrow: null,
  subtitle: null,
})
</script>

<template>
  <div class="d-flex justify-space-between mb-6 flex-wrap gap-4 align-end">
    <div>
      <div
        v-if="eyebrow"
        class="text-primary section-eyebrow mb-2"
      >
        {{ eyebrow }}
      </div>

      <h2 class="text-h5 font-weight-bold">
        {{ title }}
      </h2>

      <div
        v-if="subtitle"
        class="text-medium-emphasis text-body-2 mt-2"
        style="max-width: 62ch;"
      >
        {{ subtitle }}
      </div>
    </div>

    <div
      v-if="$slots.actions"
      class="flex-shrink-0"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.section-eyebrow {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
</style>
