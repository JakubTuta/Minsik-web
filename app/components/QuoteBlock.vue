<script setup lang="ts">
interface Props {
  label: string
  text: string
}

defineProps<Props>()
</script>

<template>
  <v-sheet
    color="surface-variant"
    rounded="xl"
    class="pa-8"
  >
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <div class="text-overline text-medium-emphasis mb-3">
          {{ label }}
        </div>

        <v-icon
          icon="mdi-format-quote-open"
          size="36"
          color="primary"
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <p class="font-display quote-text mb-5">
          {{ text }}
        </p>

        <p
          v-if="$slots.caption"
          class="text-body-2 text-medium-emphasis mb-0"
        >
          <slot name="caption" />
        </p>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<style scoped>
.quote-text {
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.375rem, 1rem + 1.6vw, 2.1875rem);
  line-height: 1.3;
  letter-spacing: -0.012em;
  margin-block-start: 0;
}
</style>
