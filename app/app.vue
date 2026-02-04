<script setup lang="ts">
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initialize()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
