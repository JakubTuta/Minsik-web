<script setup lang="ts">
import type { Book } from '~/types/api'

interface Props {
  book?: Book
  loading?: boolean
  variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  book: undefined,
  loading: false,
  variant: 'default',
})

const router = useRouter()

function navigateToBook() {
  if (props.book) {
    router.push(`/books/${props.book.slug}`)
  }
}

function navigateToAuthor(authorSlug: string, event: Event) {
  event.stopPropagation()
  router.push(`/authors/${authorSlug}`)
}

const coverUrl = computed(() => props.book?.cover_url || '/placeholder-book.jpg')
const title = computed(() => props.book?.title || '')
const authorNames = computed(() => props.book?.authors.map(a => a.name).join(', ') || '')
const seriesText = computed(() => {
  if (!props.book?.series)
    return null
  const position = props.book.series_position
    ? ` #${props.book.series_position}`
    : ''

  return `${props.book.series.name}${position}`
})
</script>

<template>
  <v-card
    :loading="loading"
    hover
    class="cursor-pointer"
    @click="navigateToBook"
  >
    <template v-if="loading">
      <v-skeleton-loader type="image, article" />
    </template>

    <template v-else-if="book">
      <v-img
        :src="coverUrl"
        :alt="title"
        aspect-ratio="0.67"
        cover
        class="bg-surface-variant"
      >
        <template #placeholder>
          <div class="d-flex align-center fill-height justify-center">
            <v-progress-circular
              indeterminate
              color="primary"
            />
          </div>
        </template>
      </v-img>

      <v-card-text class="pb-2">
        <div class="text-subtitle-2 font-weight-bold mb-1 text-truncate">
          {{ title }}
        </div>

        <div
          v-if="book.authors.length > 0"
          class="text-caption text-secondary hover:text-primary cursor-pointer"
          @click="navigateToAuthor(book.authors[0].slug, $event)"
        >
          {{ authorNames }}
        </div>

        <div
          v-if="seriesText"
          class="text-caption text-info mt-1"
        >
          {{ seriesText }}
        </div>

        <div
          v-if="book.rating"
          class="d-flex align-center mt-2 gap-1"
        >
          <v-icon
            icon="mdi-star"
            size="small"
            color="warning"
          />

          <span class="text-caption">{{ book.rating.toFixed(1) }}</span>

          <span
            v-if="book.rating_count"
            class="text-caption text-secondary"
          >
            ({{ book.rating_count }})
          </span>
        </div>
      </v-card-text>
    </template>
  </v-card>
</template>
