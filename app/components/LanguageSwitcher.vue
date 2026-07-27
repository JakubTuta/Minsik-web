<script setup lang="ts">
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
        <v-icon icon="mdi-translate" />
      </v-btn>
    </template>

    <v-list
      min-width="180"
      density="compact"
    >
      <v-list-subheader>{{ t('language.label') }}</v-list-subheader>

      <v-list-item
        v-for="entry in availableLocales"
        :key="entry.code"
        :active="entry.code === language"
        :title="entry.name"
        @click="setLanguage(entry.code)"
      >
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
