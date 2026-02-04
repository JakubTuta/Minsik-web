<script setup lang="ts">
const themeStore = useThemeStore()

const icon = computed(() => (themeStore.isDark
  ? 'mdi-weather-night'
  : 'mdi-weather-sunny'))
</script>

<template>
  <v-btn
    :icon="icon"
    variant="text"
    @click="themeStore.toggleTheme"
  />
</template>
