<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
</script>

<template>
  <v-footer class="app-footer py-10">
    <v-container>
      <v-row>
        <v-col
          cols="12"
          sm="3"
        >
          <div class="text-h6 font-weight-bold mb-2">
            {{ t('app.name') }}
          </div>

          <div
            class="text-body-2 text-secondary mb-4"
            style="max-width: 260px"
          >
            {{ t('footer.tagline') }}
          </div>

          <div class="d-flex ga-2">
            <v-btn
              icon
              variant="text"
              size="small"
              href="https://github.com/JakubTuta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <v-icon icon="mdi-github" />
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              href="https://www.linkedin.com/in/jakub-tutka-077b55352"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <v-icon icon="mdi-linkedin" />
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              href="https://jakubtutka.com"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="t('footer.personalWebsite')"
            >
              <v-icon icon="mdi-web" />
            </v-btn>
          </div>
        </v-col>

        <v-col
          cols="12"
          sm="2"
        >
          <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3">
            {{ t('nav.discover') }}
          </div>

          <div class="d-flex flex-column ga-2">
            <NuxtLinkLocale
              to="/"
              class="footer-link text-body-2"
            >
              {{ t('nav.home') }}
            </NuxtLinkLocale>

            <NuxtLinkLocale
              to="/search"
              class="footer-link text-body-2"
            >
              {{ t('nav.search') }}
            </NuxtLinkLocale>
          </div>
        </v-col>

        <v-col
          cols="12"
          sm="2"
        >
          <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3">
            {{ t('nav.casino') }}
          </div>

          <div class="d-flex flex-column ga-2">
            <NuxtLinkLocale
              to="/play-slots"
              class="footer-link text-body-2"
            >
              {{ t('nav.playSlots') }}
            </NuxtLinkLocale>

            <NuxtLinkLocale
              to="/open-case"
              class="footer-link text-body-2"
            >
              {{ t('nav.openCase') }}
            </NuxtLinkLocale>

            <NuxtLinkLocale
              to="/open-pack"
              class="footer-link text-body-2"
            >
              {{ t('nav.openPack') }}
            </NuxtLinkLocale>
          </div>
        </v-col>

        <v-col
          cols="12"
          sm="2"
        >
          <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3">
            {{ t('footer.legal') }}
          </div>

          <div class="d-flex flex-column ga-2">
            <NuxtLinkLocale
              to="/terms-of-service"
              class="footer-link text-body-2"
            >
              {{ t('nav.termsOfService') }}
            </NuxtLinkLocale>

            <NuxtLinkLocale
              to="/privacy-policy"
              class="footer-link text-body-2"
            >
              {{ t('nav.privacyPolicy') }}
            </NuxtLinkLocale>
          </div>
        </v-col>

        <v-col
          cols="12"
          sm="3"
        >
          <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3">
            {{ t('footer.account') }}
          </div>

          <ClientOnly>
            <div
              v-if="authStore.isAuthenticated"
              class="d-flex flex-column ga-2"
            >
              <NuxtLinkLocale
                to="/dashboard"
                class="footer-link text-body-2"
              >
                {{ t('nav.dashboard') }}
              </NuxtLinkLocale>

              <NuxtLinkLocale
                to="/bookshelf"
                class="footer-link text-body-2"
              >
                {{ t('nav.myBookshelf') }}
              </NuxtLinkLocale>

              <NuxtLinkLocale
                to="/favourites"
                class="footer-link text-body-2"
              >
                {{ t('nav.favourites') }}
              </NuxtLinkLocale>

              <NuxtLinkLocale
                to="/ratings"
                class="footer-link text-body-2"
              >
                {{ t('nav.ratings') }}
              </NuxtLinkLocale>
            </div>

            <div
              v-else
              class="d-flex flex-column ga-2"
            >
              <button
                type="button"
                class="footer-link text-body-2 text-left"
                @click="authDialogStore.openLogin()"
              >
                {{ t('nav.signIn') }}
              </button>

              <button
                type="button"
                class="footer-link text-body-2 text-left"
                @click="authDialogStore.openRegister()"
              >
                {{ t('auth.createAccount') }}
              </button>
            </div>
          </ClientOnly>
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <div class="d-flex align-center ga-4 text-secondary flex-wrap justify-center">
        <span>{{ t('footer.copyright', {'year': new Date().getFullYear()}) }}</span>

        <NuxtLinkLocale
          to="/privacy-policy"
          class="footer-link"
        >
          {{ t('nav.privacyPolicy') }}
        </NuxtLinkLocale>

        <NuxtLinkLocale
          to="/terms-of-service"
          class="footer-link"
        >
          {{ t('nav.termsOfService') }}
        </NuxtLinkLocale>
      </div>
    </v-container>
  </v-footer>
</template>

<style scoped>
.app-footer {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.footer-link {
  text-decoration: none;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  opacity: 0.8;
  transition: opacity 0.15s;
}

.footer-link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
