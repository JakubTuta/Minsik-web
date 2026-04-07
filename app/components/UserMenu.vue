<script setup lang="ts">
interface Props {
  drawerMode?: boolean
}

defineProps<Props>()

const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
const themeStore = useThemeStore()
const categoriesStore = useCategoriesStore()
const { isAuthenticated, user } = storeToRefs(authStore)

const userDisplayName = computed(() => user.value?.display_name || user.value?.username || 'User')
const userInitials = computed(() => userDisplayName.value.charAt(0).toUpperCase())
</script>

<template>
  <!-- Drawer Mode -->
  <template v-if="drawerMode">
    <!-- User info - only when authenticated -->
    <template v-if="isAuthenticated">
      <v-list-item
        :subtitle="user?.email"
        :title="userDisplayName"
        class="py-3"
      >
        <template #prepend>
          <v-avatar
            v-if="user?.avatar_url"
            :image="user.avatar_url"
            size="40"
            class="me-2"
          />

          <v-avatar
            v-else
            color="secondary"
            size="40"
            class="me-2"
          >
            <span class="text-body-2 font-weight-bold">{{ userInitials }}</span>
          </v-avatar>
        </template>
      </v-list-item>

      <v-divider class="my-1" />
    </template>

    <!-- Theme toggle - always visible -->
    <v-list-item @click="themeStore.toggleTheme">
      <div class="d-flex align-center justify-space-between w-100">
        <v-list-item-title>Theme</v-list-item-title>

        <ThemeToggle />
      </div>
    </v-list-item>

    <!-- Public pages - always visible -->
    <v-list-item
      prepend-icon="mdi-compass"
      title="Discover"
      to="/discover"
    />

    <v-list-group value="categories">
      <template #activator="{'props': groupProps}">
        <v-list-item
          v-bind="groupProps"
          prepend-icon="mdi-shape"
          title="Categories"
        />
      </template>

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
      />
    </v-list-group>

    <v-list-group value="casino">
      <template #activator="{'props': groupProps}">
        <v-list-item
          v-bind="groupProps"
          prepend-icon="mdi-slot-machine"
          title="Casino"
        />
      </template>

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
    </v-list-group>

    <v-list-item
      prepend-icon="mdi-information"
      title="About"
      to="/about"
    />

    <!-- Authenticated pages -->
    <template v-if="isAuthenticated">
      <v-divider class="my-1" />

      <v-list-item
        v-if="user?.role === 'admin'"
        prepend-icon="mdi-shield-crown"
        title="Admin Panel"
        to="/admin"
      />

      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        to="/dashboard"
      />

      <v-list-item
        prepend-icon="mdi-account"
        title="Public Profile"
        :to="`/bookshelf/${user?.username}`"
      />

      <v-list-item
        prepend-icon="mdi-bookshelf"
        title="My Bookshelf"
        to="/bookshelf"
      />

      <v-list-item
        prepend-icon="mdi-heart"
        title="Favourites"
        to="/favourites"
      />

      <v-list-item
        prepend-icon="mdi-star"
        title="Ratings"
        to="/ratings"
      />

      <v-list-item
        prepend-icon="mdi-comment-text"
        title="Comments"
        to="/comments"
      />

      <v-divider class="my-1" />

      <v-list-item
        prepend-icon="mdi-logout"
        title="Sign Out"
        @click="authStore.logout()"
      />
    </template>

    <template v-else>
      <v-divider class="my-1" />

      <v-list-item
        prepend-icon="mdi-login"
        title="Sign In"
        @click="authDialogStore.openLogin()"
      />

      <v-list-item
        prepend-icon="mdi-account-plus"
        title="Sign Up"
        @click="authDialogStore.openRegister()"
      />
    </template>
  </template>

  <!-- Desktop Mode -->
  <v-menu v-else>
    <template #activator="{props}">
      <v-btn
        icon
        variant="text"
        v-bind="props"
      >
        <v-avatar
          v-if="isAuthenticated && user?.avatar_url"
          :image="user.avatar_url"
          size="32"
        />

        <v-avatar
          v-else-if="isAuthenticated"
          color="secondary"
          size="32"
        >
          <span class="font-weight-bold">{{ userInitials }}</span>
        </v-avatar>

        <v-icon
          v-else
          icon="mdi-account-circle"
        />
      </v-btn>
    </template>

    <v-list min-width="220">
      <template v-if="isAuthenticated">
        <v-list-item
          :subtitle="user?.email"
          :title="userDisplayName"
          class="py-3"
        >
          <template #prepend>
            <v-avatar
              v-if="user?.avatar_url"
              :image="user.avatar_url"
              size="36"
              class="me-2"
            />

            <v-avatar
              v-else
              color="secondary"
              size="36"
              class="me-2"
            >
              <span class="font-weight-bold">{{ userInitials }}</span>
            </v-avatar>
          </template>
        </v-list-item>

        <v-divider class="my-1" />

        <v-list-item
          prepend-icon="mdi-information"
          title="About"
          to="/about"
        />

        <v-divider class="my-1" />

        <v-list-item
          v-if="user?.role === 'admin'"
          prepend-icon="mdi-shield-crown"
          title="Admin Panel"
          to="/admin"
        />

        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/dashboard"
        />

        <v-list-item
          prepend-icon="mdi-account"
          title="Public Profile"
          :to="`/bookshelf/${user?.username}`"
        />

        <v-list-item
          prepend-icon="mdi-bookshelf"
          title="My Bookshelf"
          to="/bookshelf"
        />

        <v-list-item
          prepend-icon="mdi-heart"
          title="Favourites"
          to="/favourites"
        />

        <v-list-item
          prepend-icon="mdi-star"
          title="Ratings"
          to="/ratings"
        />

        <v-list-item
          prepend-icon="mdi-comment-text"
          title="Comments"
          to="/comments"
        />

        <v-divider class="my-1" />

        <v-list-item
          prepend-icon="mdi-logout"
          title="Sign Out"
          @click="authStore.logout()"
        />
      </template>

      <template v-else>
        <v-list-item
          prepend-icon="mdi-information"
          title="About"
          to="/about"
        />

        <v-divider class="my-1" />

        <v-list-item
          prepend-icon="mdi-login"
          title="Sign In"
          @click="authDialogStore.openLogin()"
        />

        <v-list-item
          prepend-icon="mdi-account-plus"
          title="Sign Up"
          @click="authDialogStore.openRegister()"
        />
      </template>
    </v-list>
  </v-menu>
</template>
