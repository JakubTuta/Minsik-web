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

const router = useRouter()

function navigateToAuthor() {
  if (props.author) {
    router.push(`/authors/${props.author.slug}`)
  }
}

const photoUrl = computed(() => props.author?.photo_url || '/placeholder-avatar.jpg')
const name = computed(() => props.author?.name || '')
const biography = computed(() => {
  if (!props.author?.biography)
    return ''

  return props.author.biography.length > 120
    ? `${props.author.biography.substring(0, 120)}...`
    : props.author.biography
})
</script>

<template>
  <v-card
    :loading="loading"
    hover
    class="cursor-pointer"
    @click="navigateToAuthor"
  >
    <template v-if="loading">
      <v-skeleton-loader type="list-item-avatar-three-line" />
    </template>

    <template v-else-if="author">
      <v-card-text>
        <div class="d-flex gap-3 align-start">
          <v-avatar
            size="64"
            color="surface-variant"
          >
            <v-img
              :src="photoUrl"
              :alt="name"
            >
              <template #placeholder>
                <v-icon
                  icon="mdi-account"
                  size="large"
                />
              </template>
            </v-img>
          </v-avatar>

          <div class="flex-1-1">
            <div class="text-subtitle-1 font-weight-bold mb-1">
              {{ name }}
            </div>

            <div
              v-if="author.display_dates"
              class="text-caption text-secondary mb-2"
            >
              {{ author.display_dates }}
            </div>

            <v-chip
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ author.book_count }} {{ author.book_count === 1
                ? 'book'
                : 'books' }}
            </v-chip>
          </div>
        </div>

        <div
          v-if="biography && variant === 'default'"
          class="text-caption text-secondary mt-3"
        >
          {{ biography }}
        </div>
      </v-card-text>
    </template>
  </v-card>
</template>
