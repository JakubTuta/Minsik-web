<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const localePath = useLocalePath()

const { t } = useI18n()

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() => {
  return is404.value
    ? t('errorPage.notFoundTitle')
    : t('errorPage.genericTitle')
})

const message = computed(() => {
  return is404.value
    ? t('errorPage.notFoundMessage')
    : t('errorPage.genericMessage')
})

useHead(() => ({
  title: `${title.value} | Minsik`,
  meta: [{ name: 'robots', content: 'noindex' }],
}))

function handleClearError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="d-flex align-center fill-height justify-center">
        <div class="py-16 text-center">
          <v-icon
            :icon="is404
              ? 'mdi-book-search-outline'
              : 'mdi-alert-circle-outline'"
            size="96"
            color="primary"
            class="mb-6"
          />

          <h1 class="text-h2 font-weight-black mb-4">
            {{ error.statusCode }}
          </h1>

          <h2 class="text-h5 font-weight-bold mb-4">
            {{ title }}
          </h2>

          <p
            class="text-body-1 text-medium-emphasis mx-auto mb-8"
            style="max-width: 480px;"
          >
            {{ message }}
          </p>

          <div class="d-flex ga-4 flex-wrap justify-center">
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-home"
              @click="handleClearError"
            >
              {{ t('common.backToHome') }}
            </v-btn>

            <v-btn
              variant="tonal"
              size="large"
              prepend-icon="mdi-magnify"
              :to="localePath('/search')"
            >
              {{ t('errorPage.searchBooks') }}
            </v-btn>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>
