<script setup lang="ts">
import type { Author } from '~/types/api'

interface Props {
  author: Author
  maxBioLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxBioLength: 190,
})

const truncatedBio = computed(() => {
  if (!props.author?.bio)
    return ''

  if (props.author.bio.length <= props.maxBioLength)
    return props.author.bio

  return `${props.author.bio.substring(0, props.maxBioLength)}...`
})
</script>

<template>
  <v-card
    variant="outlined"
    class="h-100"
  >
    <v-card-text class="pa-4">
      <h3 class="text-h6 font-weight-bold mb-4">
        About Author
      </h3>

      <v-divider class="mb-4" />

      <div class="d-flex flex-column align-center text-center">
        <v-avatar
          v-if="author.photo_url"
          size="120"
          class="mb-3"
        >
          <v-img
            :src="author.photo_url"
            :alt="author.name"
            lazy-src="/placeholder-avatar-lazy.jpg"
          />
        </v-avatar>

        <NuxtLink
          class="text-h5 font-weight-medium text-primary text-decoration-none mb-2"
          :to="`/authors/${author.slug}`"
        >
          {{ author.name }}
        </NuxtLink>

        <p
          v-if="truncatedBio"
          class="text-body-2 mt-2"
          style="white-space: pre-line; text-align: left;"
        >
          {{ truncatedBio }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>
