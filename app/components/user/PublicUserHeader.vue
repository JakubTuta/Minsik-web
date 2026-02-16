<script setup lang="ts">
import type { UserPublicProfile } from '~/types/user'

defineProps<{
  user: UserPublicProfile
}>()
</script>

<template>
  <v-card
    variant="outlined"
    class="d-flex align-center mb-6 gap-4 pa-4"
  >
    <v-avatar
      v-if="user.avatar_url"
      :image="user.avatar_url"
      size="64"
    />

    <v-avatar
      v-else
      color="secondary"
      size="64"
    >
      <span class="text-h5 font-weight-bold">
        {{ (user.display_name || user.username).charAt(0).toUpperCase() }}
      </span>
    </v-avatar>

    <div>
      <div class="text-h6 font-weight-bold">
        {{ user.display_name || user.username }}
      </div>

      <div class="text-caption text-medium-emphasis">
        @{{ user.username }}
      </div>

      <div
        v-if="user.bio"
        class="text-body-2 text-medium-emphasis mt-1"
      >
        {{ user.bio }}
      </div>
    </div>
  </v-card>
</template>
