<script setup lang="ts">
import type { BookshelfStatus } from '~/types/user'

interface Props {
  bookId: number
  // compact = icon-only chip, for tight covers (timeline, podium)
  compact?: boolean
  chipSize?: 'x-small' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  chipSize: 'x-small',
})

const { t } = useI18n()
const bookStatusesStore = useBookStatusesStore()

const statusMeta = computed<Record<BookshelfStatus, { label: string, color: string, icon: string }>>(() => ({
  want_to_read: { label: t('bookshelf.wantToRead'), color: 'orange', icon: 'mdi-bookmark' },
  reading: { label: t('bookshelf.reading'), color: 'blue', icon: 'mdi-book-open-page-variant' },
  read: { label: t('bookshelf.read'), color: 'green', icon: 'mdi-check-circle' },
  abandoned: { label: t('bookshelf.abandoned'), color: 'blue-grey', icon: 'mdi-close-circle' },
}))

const meta = computed(() => {
  const info = bookStatusesStore.getStatus(props.bookId)
  if (!info)
    return null

  return { ...statusMeta.value[info.status], isFavorite: info.is_favorite }
})
</script>

<template>
  <template v-if="meta">
    <v-icon
      v-if="meta.isFavorite"
      icon="mdi-heart"
      color="red"
      :size="chipSize === 'small'
        ? 'default'
        : 'small'"
      class="shelf-fav position-absolute"
    />

    <div class="shelf-ribbon">
      <v-chip
        :color="meta.color"
        :size="chipSize"
        variant="elevated"
        label
        class="font-weight-bold"
      >
        <v-icon
          :icon="meta.icon"
          :size="chipSize"
          :start="!compact"
        />

        <template v-if="!compact">
          {{ meta.label }}
        </template>
      </v-chip>
    </div>
  </template>
</template>

<style scoped>
.shelf-ribbon {
  position: absolute;
  bottom: 6px;
  left: 6px;
  right: 6px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.shelf-fav {
  top: 6px;
  right: 6px;
  z-index: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
}
</style>
