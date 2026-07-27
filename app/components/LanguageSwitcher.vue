<script setup lang="ts">
import { localeFlagUrl } from '~~/locales.config'

const { t } = useI18n()
const { language, availableLocales, currentLocale, setLanguage } = useUserLanguage()
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{'props': menuProps}">
      <v-btn
        v-bind="menuProps"
        icon
        variant="text"
        :aria-label="t('language.change')"
        :title="currentLocale?.name ?? language"
      >
        <v-img
          v-if="currentLocale && localeFlagUrl(currentLocale)"
          :src="localeFlagUrl(currentLocale)"
          width="22"
          height="16"
          cover
          rounded="sm"
          alt=""
        />

        <v-icon
          v-else
          icon="mdi-translate"
        />
      </v-btn>
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
          <v-img
            v-if="localeFlagUrl(entry)"
            :src="localeFlagUrl(entry)"
            width="20"
            height="15"
            cover
            rounded="sm"
            class="mr-2"
            alt=""
          />
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
