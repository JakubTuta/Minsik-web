<script setup lang="ts">
const themeStore = useThemeStore()
</script>

<template>
  <v-btn
    icon
    variant="text"
    aria-label="Toggle theme"
    @click="themeStore.toggleTheme()"
  >
    <v-icon
      icon="mdi-weather-sunny"
      class="theme-toggle-icon theme-toggle-icon--light"
    />

    <v-icon
      icon="mdi-weather-night"
      class="theme-toggle-icon theme-toggle-icon--dark"
    />
  </v-btn>
</template>

<style>
.theme-toggle-icon {
  position: absolute;
}

.theme-toggle-icon--dark {
  display: none;
}

.v-theme--dark .theme-toggle-icon--light {
  display: none;
}

.v-theme--dark .theme-toggle-icon--dark {
  display: inline-flex;
}
</style>
