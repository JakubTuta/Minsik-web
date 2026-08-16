<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

useSeoMeta({
  title: t('aboutPage.seoTitle'),
  description: t('aboutPage.seoDescription'),
})

interface Feature {
  icon: string
  color: string
  title: string
  body: string
}

const features = computed<Feature[]>(() => [
  { icon: 'mdi-bookshelf', color: 'primary', title: t('aboutPage.featureTrackerTitle'), body: t('aboutPage.featureTrackerBody') },
  { icon: 'mdi-star', color: 'warning', title: t('aboutPage.featureRatingsTitle'), body: t('aboutPage.featureRatingsBody') },
  { icon: 'mdi-treasure-chest', color: 'deep-purple', title: t('aboutPage.featureCasesTitle'), body: t('aboutPage.featureCasesBody') },
  { icon: 'mdi-compass', color: 'info', title: t('aboutPage.featureDiscoveryTitle'), body: t('aboutPage.featureDiscoveryBody') },
  { icon: 'mdi-brain', color: 'success', title: t('aboutPage.featureRecommendationsTitle'), body: t('aboutPage.featureRecommendationsBody') },
  { icon: 'mdi-account-group', color: 'pink', title: t('aboutPage.featureProfilesTitle'), body: t('aboutPage.featureProfilesBody') },
  { icon: 'mdi-slot-machine', color: 'orange', title: t('aboutPage.featureCasinoTitle'), body: t('aboutPage.featureCasinoBody') },
])
</script>

<template>
  <v-container
    class="py-12"
    max-width="900"
  >
    <v-row justify="center">
      <v-col cols="12">
        <div class="mb-10 text-center">
          <v-icon
            size="72"
            color="primary"
            class="mb-4"
          >
            mdi-bookshelf
          </v-icon>

          <h1 class="text-h3 font-weight-bold mb-4">
            {{ t('aboutPage.title') }}
          </h1>

          <p
            class="text-h6 text-medium-emphasis mx-auto"
            style="max-width: 620px;"
          >
            {{ t('aboutPage.subtitle') }}
          </p>
        </div>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('aboutPage.whatIsTitle') }}
          </h2>

          <p class="text-body-2 mb-3">
            {{ t('aboutPage.whatIsBody1') }}
          </p>

          <p class="text-body-2">
            {{ t('aboutPage.whatIsBody2') }}
          </p>
        </v-card>

        <h2 class="text-h5 font-weight-bold mb-4">
          {{ t('aboutPage.keyFeatures') }}
        </h2>

        <v-row class="mb-8">
          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            sm="6"
          >
            <v-card
              variant="tonal"
              class="h-100 pa-5"
            >
              <div class="d-flex align-center mb-2 gap-3">
                <v-icon :color="feature.color">
                  {{ feature.icon }}
                </v-icon>

                <span class="text-subtitle-1 font-weight-bold">{{ feature.title }}</span>
              </div>

              <p class="text-body-2 text-medium-emphasis">
                {{ feature.body }}
              </p>
            </v-card>
          </v-col>
        </v-row>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('aboutPage.howRatingsWorkTitle') }}
          </h2>

          <p class="text-body-2 mb-5">
            {{ t('aboutPage.howRatingsWorkIntro') }}
          </p>

          <v-row class="mb-4">
            <v-col
              cols="12"
              sm="6"
            >
              <div class="d-flex items-start gap-3">
                <v-icon
                  color="primary"
                  class="mt-1"
                >
                  mdi-star-circle
                </v-icon>

                <div>
                  <p class="text-body-2 font-weight-bold mb-1">
                    {{ t('aboutPage.minsikCommunity') }}
                  </p>

                  <p class="text-body-2 text-medium-emphasis">
                    {{ t('aboutPage.minsikCommunityBody') }}
                  </p>
                </div>
              </div>
            </v-col>

            <v-col
              cols="12"
              sm="6"
            >
              <div class="d-flex items-start gap-3">
                <v-icon
                  color="secondary"
                  class="mt-1"
                >
                  mdi-library
                </v-icon>

                <div>
                  <p class="text-body-2 font-weight-bold mb-1">
                    {{ t('aboutPage.openLibrary') }}
                  </p>

                  <p class="text-body-2 text-medium-emphasis">
                    {{ t('aboutPage.openLibraryBody') }}
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>

          <p class="text-body-2">
            {{ t('aboutPage.howRatingsWorkOutro') }}
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            {{ t('aboutPage.dataSourcesTitle') }}
          </h2>

          <p class="text-body-2">
            {{ t('aboutPage.dataSourcesBodyPrefix') }} <strong>{{ t('aboutPage.openLibrary') }}</strong> {{ t('aboutPage.dataSourcesBodySuffix') }}
          </p>
        </v-card>

        <v-card
          color="primary"
          variant="tonal"
          class="mb-6 pa-6 text-center"
        >
          <h2 class="text-h6 font-weight-bold mb-2">
            {{ t('aboutPage.ctaTitle') }}
          </h2>

          <p class="text-body-2 text-medium-emphasis mb-5">
            {{ t('aboutPage.ctaBody') }}
          </p>

          <div class="d-flex flex-wrap justify-center gap-3">
            <v-btn
              color="primary"
              variant="elevated"
              :to="localePath('/')"
              prepend-icon="mdi-home"
            >
              {{ t('aboutPage.browseBooks') }}
            </v-btn>

            <v-btn
              variant="outlined"
              :to="localePath('/discover')"
              prepend-icon="mdi-compass"
            >
              {{ t('discoverPage.discoverABook') }}
            </v-btn>

            <v-btn
              variant="outlined"
              :to="localePath('/play-slots')"
              prepend-icon="mdi-slot-machine"
            >
              {{ t('aboutPage.tryTheCasino') }}
            </v-btn>
          </div>
        </v-card>

        <div class="d-flex mt-2 justify-center">
          <v-btn
            variant="text"
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
