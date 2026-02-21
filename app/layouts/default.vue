<script setup lang="ts">
// Layout setup
</script>

<template>
  <v-app>
    <AppBar />

    <AuthDialog />

    <v-main>
      <div class="page-content">
        <slot />
      </div>

      <AppFooter />
    </v-main>
  </v-app>
</template>

<style scoped>
.page-content {
  min-height: calc(100dvh - 64px);
}
</style>
