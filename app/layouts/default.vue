<script setup lang="ts">
// Layout setup
</script>

<template>
  <v-app>
    <AppBar />
    <AuthDialog />

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>
