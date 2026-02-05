<script setup lang="ts">
import type { Author } from '~/types/api'

interface Props {
  author?: Author
  loading?: boolean
  variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  author: undefined,
  loading: false,
  variant: 'default',
})

const authorLink = computed(() => (props.author
  ? `/authors/${props.author.slug}`
  : ''))
const photoUrl = computed(() => props.author?.photo_url || '/placeholder-avatar.jpg')
const name = computed(() => props.author?.name || '')
const biography = computed(() => {
  if (!props.author?.biography)
    return ''

  return props.author.biography.length > 100
    ? `${props.author.biography.substring(0, 100)}...`
    : props.author.biography
})
</script>

<template>
  <v-card
    :to="authorLink"
    :loading="loading"
    hover
    class="author-card d-flex flex-column h-100"
  >
    <template v-if="loading">
      <v-skeleton-loader type="list-item-avatar-three-line" />
    </template>

    <template v-else-if="author">
      <v-card-text class="d-flex flex-column align-center flex-grow-1 pa-4 text-center">
        <v-avatar
          size="120"
          color="surface-variant"
          class="mb-4"
        >
          <v-img
            :src="photoUrl"
            :alt="name"
          >
            <template #placeholder>
              <v-icon
                icon="mdi-account"
                size="x-large"
              />
            </template>
          </v-img>
        </v-avatar>

        <div class="text-h6 font-weight-bold mb-2">
          {{ name }}
        </div>

        <div
          v-if="author.display_dates"
          class="text-body-2 text-secondary mb-3"
        >
          {{ author.display_dates }}
        </div>

        <v-chip
          size="small"
          color="primary"
          variant="tonal"
          class="mb-3"
        >
          {{ author.book_count }} {{ author.book_count === 1
            ? 'book'
            : 'books' }}
        </v-chip>

        <div
          v-if="biography && variant === 'default'"
          class="text-body-2 text-secondary line-clamp-3 w-100"
        >
          {{ biography }}
        </div>
      </v-card-text>
    </template>
  </v-card>
</template>

<style scoped>
.author-card {
  min-height: 280px;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
