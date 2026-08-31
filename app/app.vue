<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const i18nHead = useLocaleHead()

// A page whose URL differs per language (books: one slug per edition) opts out
// and emits its own alternates; shipping both advertises a URL that lies.
const localeLinks = computed(() => (route.meta.ownsLocaleAlternates
  ? (i18nHead.value.link ?? []).filter(link => link.rel !== 'alternate')
  : i18nHead.value.link))

useHead(() => ({
  htmlAttrs: { lang: i18nHead.value.htmlAttrs?.lang },
  link: localeLinks.value,
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
