<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card
      width="420"
      class="pa-4"
    >
      <v-card-title class="d-flex flex-column align-center mb-4 justify-center">
        <v-icon
          icon="mdi-snowflake"
          size="64"
          color="primary"
          class="mb-3"
        />

        <span class="text-h5 font-weight-bold">{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <slot />
      </v-card-text>
    </v-card>
  </v-container>
</template>
