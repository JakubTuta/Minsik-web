<script setup lang="ts">
interface Props {
  drawerMode?: boolean
}

defineProps<Props>()

const localePath = useLocalePath()

const { t } = useI18n()
const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
const themeStore = useThemeStore()
const { categories } = useCategories()
const { isAuthenticated, user } = storeToRefs(authStore)

const userDisplayName = computed(() => user.value?.display_name || user.value?.username || t('user.fallbackName'))
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
        <v-list-item-title>{{ t('nav.theme') }}</v-list-item-title>

        <div @click.stop>
          <ThemeToggle />
        </div>
      </div>
    </v-list-item>

    <LanguageSwitcher variant="list-item" />

    <!-- Public pages - always visible -->
    <v-list-item
      prepend-icon="mdi-compass"
      :title="t('nav.discover')"
      :to="localePath('/discover')"
    />

    <v-list-group value="categories">
      <template #activator="{'props': groupProps}">
        <v-list-item
          v-bind="groupProps"
          prepend-icon="mdi-shape"
          :title="t('nav.categories')"
        />
      </template>

      <v-list-item
        v-for="cat in categories"
        :key="cat.slug"
        :title="cat.name"
        :to="localePath(`/categories?category=${cat.slug}`)"
      />
    </v-list-group>

    <v-list-group value="casino">
      <template #activator="{'props': groupProps}">
        <v-list-item
          v-bind="groupProps"
          prepend-icon="mdi-slot-machine"
          :title="t('nav.casino')"
        />
      </template>

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
    </v-list-group>

    <v-list-item
      prepend-icon="mdi-information"
      :title="t('nav.about')"
      :to="localePath('/about')"
    />

    <!-- Authenticated pages -->
    <template v-if="isAuthenticated">
      <v-divider class="my-1" />

      <v-list-item
        v-if="user?.role === 'admin'"
        prepend-icon="mdi-shield-crown"
        :title="t('nav.adminPanel')"
        :to="localePath('/admin')"
      />

      <v-list-item
        v-if="user?.role === 'admin'"
        prepend-icon="mdi-magnify-scan"
        :title="t('nav.qualityReview')"
        :to="localePath('/admin/quality-review')"
      />

      <v-list-item
        prepend-icon="mdi-account"
        :title="t('nav.publicProfile')"
        :to="localePath(`/bookshelf/${user?.username}`)"
      />

      <v-list-item
        prepend-icon="mdi-view-dashboard"
        :title="t('nav.dashboard')"
        :to="localePath('/dashboard')"
      />

      <v-list-item
        prepend-icon="mdi-calendar-star"
        :title="t('nav.yearInReview')"
        :to="localePath('/year-in-review')"
      />

      <v-list-item
        prepend-icon="mdi-bookshelf"
        :title="t('nav.myBookshelf')"
        :to="localePath('/bookshelf')"
      />

      <v-list-item
        prepend-icon="mdi-heart"
        :title="t('nav.favourites')"
        :to="localePath('/favourites')"
      />

      <v-list-item
        prepend-icon="mdi-star"
        :title="t('nav.ratings')"
        :to="localePath('/ratings')"
      />

      <v-list-item
        prepend-icon="mdi-comment-text"
        :title="t('nav.comments')"
        :to="localePath('/comments')"
      />

      <v-divider class="my-1" />

      <v-list-item
        prepend-icon="mdi-logout"
        :title="t('nav.signOut')"
        @click="authStore.logout()"
      />
    </template>

    <template v-else>
      <v-divider class="my-1" />

      <v-list-item
        prepend-icon="mdi-login"
        :title="t('nav.signIn')"
        @click="authDialogStore.openLogin()"
      />

      <v-list-item
        prepend-icon="mdi-account-plus"
        :title="t('nav.signUp')"
        @click="authDialogStore.openRegister()"
      />
    </template>
  </template>

  <!-- Desktop Mode -->
  <v-menu
    v-else
    open-on-hover
  >
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
          :title="t('nav.about')"
          :to="localePath('/about')"
        />

        <v-divider class="my-1" />

        <v-list-item
          v-if="user?.role === 'admin'"
          prepend-icon="mdi-shield-crown"
          :title="t('nav.adminPanel')"
          :to="localePath('/admin')"
        />

        <v-list-item
          v-if="user?.role === 'admin'"
          prepend-icon="mdi-magnify-scan"
          :title="t('nav.qualityReview')"
          :to="localePath('/admin/quality-review')"
        />

        <v-list-item
          prepend-icon="mdi-view-dashboard"
          :title="t('nav.dashboard')"
          :to="localePath('/dashboard')"
        />

        <v-list-item
          prepend-icon="mdi-calendar-star"
          :title="t('nav.yearInReview')"
          :to="localePath('/year-in-review')"
        />

        <v-list-item
          prepend-icon="mdi-account"
          :title="t('nav.publicProfile')"
          :to="localePath(`/bookshelf/${user?.username}`)"
        />

        <v-list-item
          prepend-icon="mdi-bookshelf"
          :title="t('nav.myBookshelf')"
          :to="localePath('/bookshelf')"
        />

        <v-list-item
          prepend-icon="mdi-heart"
          :title="t('nav.favourites')"
          :to="localePath('/favourites')"
        />

        <v-list-item
          prepend-icon="mdi-star"
          :title="t('nav.ratings')"
          :to="localePath('/ratings')"
        />

        <v-list-item
          prepend-icon="mdi-comment-text"
          :title="t('nav.comments')"
          :to="localePath('/comments')"
        />

        <v-divider class="my-1" />

        <v-list-item
          prepend-icon="mdi-logout"
          :title="t('nav.signOut')"
          @click="authStore.logout()"
        />
      </template>

      <template v-else>
        <v-list-item
          prepend-icon="mdi-information"
          :title="t('nav.about')"
          :to="localePath('/about')"
        />

        <v-divider class="my-1" />

        <v-list-item
          prepend-icon="mdi-login"
          :title="t('nav.signIn')"
          @click="authDialogStore.openLogin()"
        />

        <v-list-item
          prepend-icon="mdi-account-plus"
          :title="t('nav.signUp')"
          @click="authDialogStore.openRegister()"
        />
      </template>
    </v-list>
  </v-menu>
</template>
