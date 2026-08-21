<script setup lang="ts">
import type { FavouriteAuthor } from '~/types/user'

defineProps<{
  authors: FavouriteAuthor[]
}>()

const { t } = useI18n()
</script>

<template>
  <v-card
    variant="elevated"
    class="mb-6"
  >
    <v-card-title class="text-h6 font-weight-bold">
      {{ t('profile.favouriteAuthors') }}
    </v-card-title>

    <v-card-text class="pt-2">
      <div
        v-if="authors.length"
        class="d-flex flex-column gap-4"
      >
        <div
          v-for="author in authors"
          :key="author.slug"
          class="d-flex align-center gap-3"
        >
          <v-avatar
            size="44"
            color="secondary"
            class="flex-shrink-0"
          >
            <AuthorPhoto
              :name="author.name"
              :src="author.photo_url"
              :size="44"
            />
          </v-avatar>

          <div class="min-w-0 flex-grow-1">
            <NuxtLinkLocale
              :to="`/authors/${author.slug}`"
              class="text-decoration-none text-body-1 font-weight-medium text-primary"
            >
              {{ author.name }}
            </NuxtLinkLocale>
          </div>

          <span class="text-body-2 text-medium-emphasis flex-shrink-0">
            {{ t('common.bookCount', {'count': author.count}, author.count) }}
          </span>
        </div>
      </div>

      <div
        v-else
        class="text-body-2 text-medium-emphasis"
      >
        {{ t('profile.noAuthorData') }}
      </div>
    </v-card-text>
  </v-card>
</template>
