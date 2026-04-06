<script setup lang="ts">
interface Props {
  name: string
  slug: string
  photoUrl?: string | null
  bookCount?: number
  rating?: number
  ratingCount?: number
  readers?: number
  badge?: string
  badgeColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  photoUrl: null,
  bookCount: 0,
  rating: 0,
  ratingCount: 0,
  readers: 0,
  badge: undefined,
  badgeColor: 'success',
})

const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

const formattedRating = computed(() => (props.rating
  ? props.rating.toFixed(1)
  : '0.0'))
const formattedRatingCount = computed(() => (props.ratingCount
  ? `(${compactFmt.format(props.ratingCount)})`
  : '(0)'))
const formattedReaders = computed(() => (props.readers
  ? compactFmt.format(props.readers)
  : '0'))
</script>

<template>
  <div
    class="author-preview-card-link d-block"
    style="height: 360px;"
  >
    <v-card class="author-preview-card d-flex flex-column h-100">
      <!-- Badge -->
      <v-chip
        v-if="badge"
        :color="badgeColor"
        size="x-small"
        class="position-absolute"
        variant="elevated"
        style="z-index: 2; top: 8px; right: 8px;"
      >
        {{ badge }}
      </v-chip>

      <!-- Avatar zone -->
      <div class="avatar-zone bg-surface-variant d-flex align-center justify-center">
        <v-avatar
          size="140"
          class="author-avatar"
        >
          <v-img
            :src="photoUrl || '/placeholder-avatar-lazy.jpg'"
            :alt="name"
            cover
          />
        </v-avatar>
      </div>

      <!-- Info zone -->
      <div class="info-zone d-flex flex-column align-center px-3 pb-2 pt-2 text-center">
        <!-- Name -->
        <NuxtLink
          :to="`/authors/${slug}`"
          class="card-name font-weight-bold text-body-2 name-link line-clamp-2"
        >
          {{ name }}
        </NuxtLink>

        <!-- Spacer -->
        <div class="flex-grow-1" />

        <!-- Stats -->
        <div class="stats-row d-flex align-center text-caption text-medium-emphasis mt-1 justify-center gap-2">
          <span class="d-flex align-center gap-1">
            <v-icon
              icon="mdi-star"
              size="x-small"
              color="warning"
            />
            {{ formattedRating }} {{ formattedRatingCount }}
          </span>

          <span class="d-flex align-center gap-1">
            <v-icon
              icon="mdi-account-multiple"
              size="x-small"
              color="info"
            />
            {{ formattedReaders }}
          </span>
        </div>

        <!-- Book count -->
        <div class="text-caption text-medium-emphasis mt-1">
          {{ bookCount }} {{ bookCount === 1
            ? 'book'
            : 'books' }}
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.author-preview-card-link {
  position: relative;
}

.author-preview-card {
  position: relative;
}

.avatar-zone {
  height: 60%;
  overflow: hidden;
}

.info-zone {
  height: 40%;
  overflow: hidden;
}

.author-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
}

.name-link {
  color: inherit;
  transition: color 0.15s;
}

.author-preview-card-link:hover .name-link {
  color: rgb(var(--v-theme-primary));
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats-row {
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
}
</style>
