<script setup lang="ts">
interface Props {
  drawerMode?: boolean
}

defineProps<Props>()

const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
const { isAuthenticated, user } = storeToRefs(authStore)

const userDisplayName = computed(() => user.value?.display_name || user.value?.username || 'User')
const userInitials = computed(() => userDisplayName.value.charAt(0).toUpperCase())
</script>

<template>
  <!-- Drawer Mode -->
  <template v-if="drawerMode">
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

    <v-divider class="my-1" />

    <v-list-item
      disabled
      prepend-icon="mdi-information"
      title="About"
    />
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
          <span class="text-caption font-weight-bold">{{ userInitials }}</span>
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
              <span class="text-caption font-weight-bold">{{ userInitials }}</span>
            </v-avatar>
          </template>
        </v-list-item>

        <v-divider />

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

        <v-divider />

        <v-list-item
          prepend-icon="mdi-logout"
          title="Sign Out"
          @click="authStore.logout()"
        />
      </template>

      <template v-else>
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

        <v-divider />

        <v-list-item
          disabled
          prepend-icon="mdi-information"
          title="About"
        />
      </template>
    </v-list>
  </v-menu>
</template>
