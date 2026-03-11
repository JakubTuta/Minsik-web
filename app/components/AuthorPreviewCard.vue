<script setup lang="ts">
interface Props {
  name: string
  slug: string
  photoUrl?: string | null
  bookCount?: number
  rating?: number
  ratingCount?: number
  readers?: number
  eager?: boolean
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

const formattedRating = computed(() => (props.rating > 0
  ? props.rating.toFixed(1)
  : '—'))
const formattedRatingCount = computed(() => (props.ratingCount > 0
  ? `(${compactFmt.format(props.ratingCount)})`
  : ''))
const formattedReaders = computed(() => (props.readers > 0
  ? compactFmt.format(props.readers)
  : '—'))
</script>

<template>
  <NuxtLink
    :to="`/authors/${slug}`"
    class="author-preview-card-link text-decoration-none d-block"
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
        style="z-index: 1; top: 8px; right: 8px;"
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
            :eager="eager"
            cover
          />
        </v-avatar>
      </div>

      <!-- Info zone -->
      <div class="info-zone d-flex flex-column align-center px-3 pb-2 pt-2 text-center">
        <!-- Name -->
        <span class="card-name font-weight-bold text-body-2 name-link line-clamp-2">
          {{ name }}
        </span>

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
  </NuxtLink>
</template>

<style scoped>
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
