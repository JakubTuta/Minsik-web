<script setup lang="ts">
import type { CommentEntry } from '~/types/user'

const props = defineProps<{
  entry: CommentEntry
}>()

const authors = computed(() => props.entry.book.authors.map(a => a.name).join(', '))
const commentDate = computed(() => new Date(props.entry.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }))
</script>

<template>
  <NuxtLink
    :to="`/books/${entry.book.slug}`"
    class="text-decoration-none"
  >
    <v-card
      variant="outlined"
      class="d-flex flex-row gap-3 pa-3"
      hover
    >
      <v-img
        :src="entry.book.primary_cover_url || undefined"
        lazy-src="/placeholder-book-lazy.jpg"
        :alt="entry.book.title"
        width="60"
        height="90"
        cover
        rounded="sm"
        class="flex-shrink-0"
      />

      <div class="min-w-0 flex-grow-1">
        <div class="d-flex justify-space-between flex-wrap gap-2 align-start">
          <div class="min-w-0">
            <div class="text-body-1 font-weight-medium text-truncate">
              {{ entry.book.title }}
            </div>

            <div class="text-caption text-medium-emphasis text-truncate">
              {{ authors }}
            </div>
          </div>

          <v-chip
            v-if="entry.is_spoiler"
            size="x-small"
            color="warning"
            variant="tonal"
            prepend-icon="mdi-alert"
            class="flex-shrink-0"
          >
            Spoiler
          </v-chip>
        </div>

        <div
          class="text-body-2 text-medium-emphasis mt-2"
          style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;"
        >
          {{ entry.body }}
        </div>

        <div class="text-caption text-disabled mt-2">
          {{ commentDate }}
        </div>
      </div>
    </v-card>
  </NuxtLink>
</template>
