<script setup lang="ts">
const localePath = useLocalePath()
const { t, tm, rt } = useI18n()

useSeoMeta({
  title: t('legal.privacySeoTitle'),
  description: t('legal.privacySeoDescription'),
})

const infoUses = computed<string[]>(() => {
  const raw = tm('legal.privacy.uses') as unknown as string[]

  return raw.map(item => rt(item))
})

const userRights = computed<string[]>(() => {
  const raw = tm('legal.privacy.rights') as unknown as string[]

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
          {{ t('legal.privacyTitle') }}
        </h1>

        <p class="text-body-2 text-secondary mb-8">
          {{ t('legal.lastUpdated', {"date": t('legal.termsLastUpdatedDate')}) }}
        </p>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.privacy.introduction.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.privacy.introduction.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.privacy.infoCollected.title') }}
          </h2>

          <p class="text-body-2 mb-3">
            {{ t('legal.privacy.infoCollected.intro') }}
          </p>

          <p class="text-subtitle-2 font-weight-bold mb-1">
            {{ t('legal.privacy.infoCollected.accountInfoTitle') }}
          </p>

          <p class="text-body-2 mb-3">
            {{ t('legal.privacy.infoCollected.accountInfoBody') }}
          </p>

          <p class="text-subtitle-2 font-weight-bold mb-1">
            {{ t('legal.privacy.infoCollected.usageDataTitle') }}
          </p>

          <p class="text-body-2 mb-3">
            {{ t('legal.privacy.infoCollected.usageDataBody') }}
          </p>

          <p class="text-subtitle-2 font-weight-bold mb-1">
            {{ t('legal.privacy.infoCollected.technicalDataTitle') }}
          </p>

          <p class="text-body-2">
            {{ t('legal.privacy.infoCollected.technicalDataBody') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.privacy.howWeUse.title') }}
          </h2>

          <p class="text-body-2 mb-3">
            {{ t('legal.privacy.howWeUse.intro') }}
          </p>

          <v-list
            density="compact"
            class="pa-0"
          >
            <v-list-item
              v-for="item in infoUses"
              :key="item"
              prepend-icon="mdi-check-circle-outline"
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
            {{ t('legal.privacy.dataSharing.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.privacy.dataSharing.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.privacy.dataSecurity.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.privacy.dataSecurity.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.privacy.dataRetention.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.privacy.dataRetention.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.privacy.yourRights.title') }}
          </h2>

          <p class="text-body-2 mb-3">
            {{ t('legal.privacy.yourRights.intro') }}
          </p>

          <v-list
            density="compact"
            class="pa-0"
          >
            <v-list-item
              v-for="item in userRights"
              :key="item"
              prepend-icon="mdi-check-circle-outline"
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
            {{ t('legal.privacy.cookies.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.privacy.cookies.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.privacy.changes.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.privacy.changes.body') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('legal.privacy.contact.title') }}
          </h2>

          <p class="text-body-2">
            {{ t('legal.privacy.contact.body') }}
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
