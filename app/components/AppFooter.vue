<script setup lang="ts">
const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
</script>

<template>
  <v-footer class="app-footer py-10">
    <v-container>
      <v-row>
        <!-- Brand column -->
        <v-col
          cols="12"
          sm="3"
        >
          <div class="text-h6 font-weight-bold mb-2">
            Minsik
          </div>

          <div
            class="text-body-2 text-secondary mb-4"
            style="max-width: 260px"
          >
            Discover your next favorite book through emotional reading profiles and book influence networks.
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
              aria-label="Personal website"
            >
              <v-icon icon="mdi-web" />
            </v-btn>
          </div>
        </v-col>

        <!-- Discover column -->
        <v-col
          cols="12"
          sm="2"
        >
          <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3">
            Discover
          </div>

          <div class="d-flex flex-column ga-2">
            <NuxtLink
              to="/"
              class="footer-link text-body-2"
            >
              Home
            </NuxtLink>

            <NuxtLink
              to="/search"
              class="footer-link text-body-2"
            >
              Search
            </NuxtLink>
          </div>
        </v-col>

        <!-- Casino column -->
        <v-col
          cols="12"
          sm="2"
        >
          <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3">
            Casino
          </div>

          <div class="d-flex flex-column ga-2">
            <NuxtLink
              to="/play-slots"
              class="footer-link text-body-2"
            >
              Play Slots
            </NuxtLink>

            <NuxtLink
              to="/open-case"
              class="footer-link text-body-2"
            >
              Open a Case
            </NuxtLink>

            <NuxtLink
              to="/open-pack"
              class="footer-link text-body-2"
            >
              Open a Pack
            </NuxtLink>
          </div>
        </v-col>

        <!-- Legal column -->
        <v-col
          cols="12"
          sm="2"
        >
          <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3">
            Legal
          </div>

          <div class="d-flex flex-column ga-2">
            <NuxtLink
              to="/terms-of-service"
              class="footer-link text-body-2"
            >
              Terms of Service
            </NuxtLink>

            <NuxtLink
              to="/privacy-policy"
              class="footer-link text-body-2"
            >
              Privacy Policy
            </NuxtLink>
          </div>
        </v-col>

        <!-- Account column -->
        <v-col
          cols="12"
          sm="3"
        >
          <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3">
            Account
          </div>

          <ClientOnly>
            <div
              v-if="authStore.isAuthenticated"
              class="d-flex flex-column ga-2"
            >
              <NuxtLink
                to="/dashboard"
                class="footer-link text-body-2"
              >
                Dashboard
              </NuxtLink>

              <NuxtLink
                to="/bookshelf"
                class="footer-link text-body-2"
              >
                My Bookshelf
              </NuxtLink>

              <NuxtLink
                to="/favourites"
                class="footer-link text-body-2"
              >
                Favourites
              </NuxtLink>

              <NuxtLink
                to="/ratings"
                class="footer-link text-body-2"
              >
                Ratings
              </NuxtLink>
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
                Sign In
              </button>

              <button
                type="button"
                class="footer-link text-body-2 text-left"
                @click="authDialogStore.openRegister()"
              >
                Create Account
              </button>
            </div>
          </ClientOnly>
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <div class="d-flex align-center ga-4 text-secondary flex-wrap justify-center">
        <span>© {{ new Date().getFullYear() }} Minsik. All rights reserved.</span>

        <NuxtLink
          to="/privacy-policy"
          class="footer-link"
        >
          Privacy Policy
        </NuxtLink>

        <NuxtLink
          to="/terms-of-service"
          class="footer-link"
        >
          Terms of Service
        </NuxtLink>
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
