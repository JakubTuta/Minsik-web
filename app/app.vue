<script setup lang="ts">
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initialize()
})
</script>

<template>
  <NuxtLoadingIndicator />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
