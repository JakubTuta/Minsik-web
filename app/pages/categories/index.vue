<script setup lang="ts">
// The category used to live in a query string (/categories?category=fantasy), which gave
// every category the same canonical URL. Old links keep working and land on the path route.
const route = useRoute()
const localePath = useLocalePath()

const legacySlug = typeof route.query.category === 'string'
  ? route.query.category
  : null

await navigateTo(
  legacySlug
    ? localePath(`/categories/${legacySlug}`)
    : localePath('index'),
  legacySlug
    ? { redirectCode: 301, replace: true }
    : { replace: true },
)
</script>

<template>
  <div />
</template>
