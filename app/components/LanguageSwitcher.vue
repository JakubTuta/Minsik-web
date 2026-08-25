<script setup lang="ts">
import { localeFlagUrl } from '~~/locales.config'

interface Props {
  /** `icon`: flag-only button (app bar). `list-item`: full-width row, click anywhere to open (drawer). */
  variant?: 'icon' | 'list-item'
}

withDefaults(defineProps<Props>(), { variant: 'icon' })

const { t } = useI18n()
const { language, availableLocales, currentLocale, setLanguage } = useUserLanguage()
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{'props': menuProps}">
      <v-btn
        v-if="variant === 'icon'"
        v-bind="menuProps"
        icon
        variant="text"
        :aria-label="t('language.change')"
        :title="currentLocale?.name ?? language"
      >
        <img
          v-if="currentLocale && localeFlagUrl(currentLocale)"
          :src="localeFlagUrl(currentLocale)"
          width="22"
          height="16"
          alt=""
          class="locale-flag"
        >

        <v-icon
          v-else
          icon="mdi-translate"
        />
      </v-btn>

      <v-list-item
        v-else
        v-bind="menuProps"
        :title="t('language.label')"
        :subtitle="currentLocale?.name ?? language"
      >
        <template #prepend>
          <img
            v-if="currentLocale && localeFlagUrl(currentLocale)"
            :src="localeFlagUrl(currentLocale)"
            width="22"
            height="16"
            alt=""
            class="locale-flag me-2"
          >

          <v-icon
            v-else
            icon="mdi-translate"
            class="me-2"
          />
        </template>
      </v-list-item>
    </template>

    <v-list
      min-width="180"
      density="compact"
    >
      <v-list-item
        v-for="entry in availableLocales"
        :key="entry.code"
        :active="entry.code === language"
        :title="entry.name"
        @click="setLanguage(entry.code)"
      >
        <template #prepend>
          <img
            v-if="localeFlagUrl(entry)"
            :src="localeFlagUrl(entry)"
            width="20"
            height="15"
            alt=""
            class="locale-flag mr-2"
          >
        </template>

        <template #append>
          <v-icon
            v-if="entry.code === language"
            icon="mdi-check"
            size="small"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
/* A bare <img>, not v-img: these are local static SVGs at a fixed size, so
   there is nothing to lazy-load, retry or measure. */
.locale-flag {
  object-fit: cover;
  border-radius: 2px;
  flex: 0 0 auto;
}
</style>
