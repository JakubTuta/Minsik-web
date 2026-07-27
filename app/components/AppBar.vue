<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
const { categories } = useCategories()

const drawer = ref(false)
const appBarSearchQuery = ref('')
</script>

<template>
  <v-app-bar
    flat
    height="64"
    class="app-bar-glass"
  >
    <!-- Desktop: Full Logo with Text -->
    <v-app-bar-title
      class="d-none d-md-block logo-container"
      style="flex: 0 0 auto;"
    >
      <NuxtLinkLocale
        to="/"
        class="logo-wrapper"
      >
        <v-icon
          icon="mdi-snowflake"
          size="large"
          class="logo-icon"
        />

        <span class="logo-text">{{ t('app.name') }}</span>
      </NuxtLinkLocale>
    </v-app-bar-title>

    <!-- Desktop: Categories menu — left side after logo -->
    <v-menu
      location="bottom"
      open-on-hover
      eager
    >
      <template #activator="{'props': menuProps}">
        <v-btn
          class="d-none d-md-inline-flex nav-btn ml-2"
          variant="text"
          density="comfortable"
          prepend-icon="mdi-shape"
          append-icon="mdi-menu-down"
          v-bind="menuProps"
        >
          {{ t('nav.categories') }}
        </v-btn>
      </template>

      <v-list
        min-width="220"
        class="nav-menu-list"
      >
        <v-list-item
          v-for="cat in categories"
          :key="cat.slug"
          :title="cat.name"
          :to="localePath(`/categories?category=${cat.slug}`)"
          :active="false"
        />
      </v-list>
    </v-menu>

    <!-- Desktop: Discover — left side after logo -->
    <v-btn
      class="d-none d-md-inline-flex nav-btn ml-1"
      variant="text"
      density="comfortable"
      prepend-icon="mdi-compass"
      :to="localePath('/discover')"
    >
      {{ t('nav.discover') }}
    </v-btn>

    <v-spacer class="d-none d-md-flex" />

    <!-- Search Bar (centered between nav clusters) -->
    <div class="search-container">
      <SearchBar
        v-model="appBarSearchQuery"
        variant="appbar"
      />
    </div>

    <v-spacer class="d-none d-md-flex" />

    <!-- Desktop: Casino menu -->
    <v-menu
      location="bottom"
      open-on-hover
    >
      <template #activator="{'props': menuProps}">
        <v-btn
          class="d-none d-md-inline-flex nav-btn mr-1"
          variant="text"
          density="comfortable"
          prepend-icon="mdi-slot-machine"
          append-icon="mdi-menu-down"
          v-bind="menuProps"
        >
          {{ t('nav.casino') }}
        </v-btn>
      </template>

      <v-list
        min-width="220"
        class="nav-menu-list"
      >
        <v-list-item
          prepend-icon="mdi-fruit-cherries"
          :title="t('nav.playSlots')"
          :to="localePath('/play-slots')"
        />

        <v-list-item
          prepend-icon="mdi-treasure-chest"
          :title="t('nav.openCase')"
          :to="localePath('/open-case')"
        />

        <v-list-item
          prepend-icon="mdi-cards"
          :title="t('nav.openPack')"
          :to="localePath('/open-pack')"
        />
      </v-list>
    </v-menu>

    <div class="d-none d-md-flex align-center mr-1">
      <ThemeToggle />

      <LanguageSwitcher />
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
      variant="text"
      :aria-label="t('nav.openMenu')"
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
        :to="localePath('/')"
      >
        <template #prepend>
          <v-icon
            icon="mdi-snowflake"
            size="large"
            color="primary"
          />
        </template>

        <v-list-item-title class="text-h6 font-weight-bold logo-text">
          {{ t('app.name') }}
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
/* Frosted-glass surface bar — sits on any page background, subtle bottom hairline */
.app-bar-glass {
  background: rgba(var(--v-theme-surface), 0.72) !important;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.logo-container {
  cursor: pointer;
  display: inline-block;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.logo-icon {
  color: rgb(var(--v-theme-primary));
  filter: drop-shadow(0 0 6px rgba(var(--v-theme-primary), 0.45));
  transition: filter 0.3s ease;
}

/* Brand wordmark — solid primary */
.logo-text {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: rgb(var(--v-theme-primary));
}

.logo-wrapper:hover {
  transform: scale(1.04);
}

.logo-wrapper:hover .logo-icon {
  filter: drop-shadow(0 0 14px rgba(var(--v-theme-primary), 0.7));
}

.logo-wrapper:active {
  transform: scale(0.98);
}

/* Nav buttons — pill hover with primary tint, no shouty uppercase */
.nav-btn {
  text-transform: none;
  letter-spacing: 0.2px;
  font-weight: 600;
  border-radius: 12px;
  color: rgb(var(--v-theme-on-surface));
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-btn:hover {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.nav-btn.router-link-active {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.nav-menu-list {
  border-radius: 16px;
  padding: 6px;
}

/* Search container — absolute center on desktop regardless of side clusters */
.search-container {
  flex: 0 1 420px;
  min-width: 0;
  z-index: 10;
}

/* Raised pill search field — stands out against the glass bar */
.search-container :deep(.v-field) {
  background: rgb(var(--v-theme-surface-bright));
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-container :deep(.v-field):hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.16);
}

.search-container :deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.28), 0 3px 12px rgba(0, 0, 0, 0.16);
}

@media (min-width: 960px) {
  .search-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
    flex: none;
  }
}

@media (max-width: 959px) {
  .search-container {
    flex: 1 1 auto;
    margin: 0 8px;
  }
}

.drawer-logo {
  cursor: pointer;
}

.drawer-logo:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
</style>
