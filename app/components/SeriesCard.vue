<script setup lang="ts">
import type { Series } from '~/types/api'

interface Props {
  series?: Series
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  series: undefined,
  loading: false,
})

const router = useRouter()

function navigateToSeries() {
  if (props.series) {
    router.push(`/series/${props.series.slug}`)
  }
}

function navigateToAuthor(event: Event) {
  if (props.series?.author) {
    event.stopPropagation()
    router.push(`/authors/${props.series.author.slug}`)
  }
}

const name = computed(() => props.series?.name || '')
const description = computed(() => {
  if (!props.series?.description)
    return ''

  return props.series.description.length > 150
    ? `${props.series.description.substring(0, 150)}...`
    : props.series.description
})
</script>

<template>
  <v-card
    :loading="loading"
    hover
    class="cursor-pointer"
    @click="navigateToSeries"
  >
    <template v-if="loading">
      <v-skeleton-loader type="article" />
    </template>

    <template v-else-if="series">
      <v-card-text>
        <div class="d-flex justify-space-between mb-3 gap-3 align-start">
          <div class="flex-1-1">
            <div class="text-subtitle-1 font-weight-bold mb-2">
              {{ name }}
            </div>

            <div
              v-if="series.author"
              class="text-caption text-secondary hover:text-primary cursor-pointer"
              @click="navigateToAuthor"
            >
              by {{ series.author.name }}
            </div>
          </div>

          <v-chip
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ series.book_count }} {{ series.book_count === 1
              ? 'book'
              : 'books' }}
          </v-chip>
        </div>

        <div
          v-if="description"
          class="text-caption text-secondary"
        >
          {{ description }}
        </div>
      </v-card-text>
    </template>
  </v-card>
</template>
