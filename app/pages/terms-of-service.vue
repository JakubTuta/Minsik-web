<script setup lang="ts">
const localePath = useLocalePath()
const { t, tm, rt } = useI18n()

useSeoMeta({
  title: t('legal.termsSeoTitle'),
  description: t('legal.termsSeoDescription'),
})

const useProhibitions = computed<string[]>(() => {
  const raw = tm('legal.terms.prohibitions') as unknown as string[]

  return raw.map(item => rt(item))
})
</script>

<template>
  <v-container
    class="py-12"
    max-width="800"
  >
    <v-row justify="center">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">
          {{ t('legal.termsTitle') }}
        </h1>

        <p class="text-body-2 text-secondary mb-8">
          {{ t('legal.lastUpdated', {"date": t('legal.termsLastUpdatedDate')}) }}
        </p>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.acceptance.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.terms.acceptance.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.useOfService.title') }}
          </h2>

          <p class="text-body-2 mb-3">
            {{ t('legal.terms.useOfService.body') }}
          </p>

          <v-list
            density="compact"
            class="pa-0"
          >
            <v-list-item
              v-for="item in useProhibitions"
              :key="item"
              prepend-icon="mdi-close-circle-outline"
              class="px-0 align-start"
            >
              <template #title>
                <span style="white-space: normal;">{{ item }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.userAccounts.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.terms.userAccounts.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.userContent.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.terms.userContent.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.intellectualProperty.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.terms.intellectualProperty.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.disclaimer.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.terms.disclaimer.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.limitationOfLiability.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.terms.limitationOfLiability.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.changesToTerms.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.terms.changesToTerms.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.terms.contact.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.terms.contact.body') }}
            <a
              href="https://jakubtutka.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >{{ t('legal.website') }}</a>.
          </p>
        </v-card>

        <div class="d-flex mt-8 justify-center">
          <v-btn
            variant="outlined"
            :to="localePath('/')"
            prepend-icon="mdi-arrow-left"
          >
            {{ t('common.backToHome') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
