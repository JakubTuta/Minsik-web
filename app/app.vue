<script setup lang="ts">
const { t } = useI18n()
const i18nHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: { lang: i18nHead.value.htmlAttrs?.lang },
  link: i18nHead.value.link,
  meta: i18nHead.value.meta,
  // Pages already append the site name via useSeo, so only supply a default.
  titleTemplate: title => title || t('app.title'),
}))

useSeoMeta({
  description: () => t('app.description'),
})
</script>

<template>
  <NuxtLoadingIndicator />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
