<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const drawer = ref(false)
const appBarSearchQuery = ref('')

const categoriesStore = useCategoriesStore()

onMounted(() => {
  categoriesStore.fetchCategories()
})
</script>

<template>
  <v-app-bar
    elevation="3"
    color="primary"
    class="app-bar-container"
    :scroll-behavior="mobile
      ? 'hide'
      : undefined"
    :scroll-threshold="64"
  >
    <!-- Desktop: Full Logo with Text -->
    <v-app-bar-title
      class="d-none d-md-block logo-container"
      style="flex: 0 0 auto;"
    >
      <NuxtLink
        to="/"
        class="logo-wrapper"
      >
        <v-icon
          icon="mdi-snowflake"
          size="x-large"
          class="logo-icon"
        />

        <span class="logo-text">Minsik</span>
      </NuxtLink>
    </v-app-bar-title>

    <!-- Desktop: Categories menu — left side after logo -->
    <v-menu
      class="d-none d-md-flex"
      location="bottom"
      open-on-hover
    >
      <template #activator="{'props': menuProps}">
        <v-btn
          class="d-none d-md-inline-flex ml-2"
          variant="text"
          prepend-icon="mdi-shape"
          v-bind="menuProps"
        >
          Categories

          <template #append>
            <v-icon
              icon="mdi-menu-down"
              size="x-large"
            />
          </template>
        </v-btn>
      </template>

      <v-list min-width="200">
        <v-list-item
          v-if="categoriesStore.isLoading"
          title="Loading..."
          disabled
        />

        <v-list-item
          v-for="cat in categoriesStore.categories"
          :key="cat.slug"
          :title="cat.name"
          :to="`/categories?category=${cat.slug}`"
          :active="false"
        />
      </v-list>
    </v-menu>

    <!-- Desktop: Discover — left side after logo -->
    <v-btn
      class="d-none d-md-inline-flex ml-2"
      variant="text"
      prepend-icon="mdi-compass"
      to="/discover"
    >
      Discover
    </v-btn>

    <!-- Search Bar (absolutely centered) -->
    <div class="search-container">
      <SearchBar
        v-model="appBarSearchQuery"
        variant="appbar"
      />
    </div>

    <v-spacer />

    <!-- Desktop: Casino menu -->
    <v-menu
      class="d-none d-md-flex"
      location="bottom"
      open-on-hover
    >
      <template #activator="{'props': menuProps}">
        <v-btn
          class="d-none d-md-inline-flex mr-2"
          variant="text"
          prepend-icon="mdi-slot-machine"
          v-bind="menuProps"
        >
          Casino

          <template #append>
            <v-icon
              icon="mdi-menu-down"
              size="x-large"
            />
          </template>
        </v-btn>
      </template>

      <v-list min-width="200">
        <v-list-item
          prepend-icon="mdi-fruit-cherries"
          title="Play Slots"
          to="/play-slots"
        />

        <v-list-item
          prepend-icon="mdi-treasure-chest"
          title="Open a Case"
          to="/open-case"
        />

        <v-list-item
          prepend-icon="mdi-cards"
          title="Open a Pack"
          to="/open-pack"
        />
      </v-list>
    </v-menu>

    <div class="d-none d-md-flex align-center mr-2">
      <ThemeToggle />
    </div>

    <div class="d-none d-md-flex align-center">
      <ClientOnly>
        <UserMenu />

        <template #fallback>
          <v-btn
            icon
            variant="text"
          >
            <v-icon icon="mdi-account-circle" />
          </v-btn>
        </template>
      </ClientOnly>
    </div>

    <!-- Mobile: Menu Button -->
    <v-btn
      class="d-md-none"
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
        to="/"
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

      <!-- User Menu Items (expanded) -->
      <ClientOnly>
        <UserMenu drawer-mode />
      </ClientOnly>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.app-bar-container {
  position: relative;
}

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
  text-decoration: none;
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

/* Search container - absolutely centered */
.search-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  min-width: 300px;
  max-width: 500px;
  z-index: 10;
}

@media (max-width: 959px) {
  .search-container {
    position: static;
    transform: none;
    flex: 1 1 auto;
    width: auto;
    max-width: 100%;
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
