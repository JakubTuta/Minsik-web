<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const router = useRouter()
const themeStore = useThemeStore()
const drawer = ref(false)

function goHome() {
  router.push('/')
  drawer.value = false
}
</script>

<template>
  <v-app-bar
    elevation="3"
    color="primary"
  >
    <!-- Mobile: Logo Icon Only -->
    <v-btn
      v-if="mobile"
      icon
      @click="goHome"
    >
      <v-icon
        icon="mdi-snowflake"
        size="large"
      />
    </v-btn>

    <!-- Desktop: Full Logo with Text -->
    <v-app-bar-title
      v-if="!mobile"
      class="logo-container"
      @click="goHome"
    >
      <div class="logo-wrapper">
        <v-icon
          icon="mdi-snowflake"
          size="x-large"
          class="logo-icon"
        />

        <span class="logo-text">Minsik</span>
      </div>
    </v-app-bar-title>

    <v-spacer v-if="!mobile" />

    <v-spacer v-if="!mobile" />

    <!-- Search Bar (responsive) -->
    <div class="search-container">
      <SearchBar variant="appbar" />
    </div>

    <v-spacer v-if="!mobile" />

    <v-spacer v-if="!mobile" />

    <!-- Desktop: Theme Toggle & User Menu -->
    <ThemeToggle
      v-if="!mobile"
    />

    <UserMenu
      v-if="!mobile"
    />

    <!-- Mobile: Menu Button -->
    <v-btn
      v-if="mobile"
      icon
      @click="drawer = !drawer"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <!-- Mobile Drawer -->
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    width="280"
  >
    <v-list>
      <!-- App Logo/Name -->
      <v-list-item
        class="drawer-logo"
        @click="goHome"
      >
        <template #prepend>
          <v-icon
            icon="mdi-snowflake"
            size="large"
            color="primary"
          />
        </template>

        <v-list-item-title class="text-h6 font-weight-bold">
          Minsik
        </v-list-item-title>
      </v-list-item>

      <v-divider class="my-2" />

      <!-- Theme Toggle -->
      <v-list-item @click="themeStore.toggleTheme">
        <div class="d-flex align-center justify-space-between w-100">
          <v-list-item-title>Theme</v-list-item-title>

          <ThemeToggle />
        </div>
      </v-list-item>

      <v-divider class="my-2" />

      <!-- User Menu Items (expanded) -->
      <UserMenu drawer-mode />
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.logo-container {
  cursor: pointer;
  display: inline-block;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.logo-icon {
  color: white;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

@keyframes iconPulse {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6));
  }
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
  animation: gradientShift 3s ease infinite;
  position: relative;
  z-index: 1;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.logo-wrapper:hover {
  transform: scale(1.05);
}

.logo-wrapper:hover .logo-icon {
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
}

.logo-wrapper:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* Search container */
.search-container {
  flex: 1 1 auto;
  max-width: 600px;
  min-width: 400px;
}

@media (max-width: 959px) {
  .search-container {
    flex: 1 1 auto;
    max-width: 100%;
    min-width: 0;
    margin: 0 8px;
  }
}

.drawer-logo {
  cursor: pointer;
}

.drawer-logo:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
