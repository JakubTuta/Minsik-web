<script setup lang="ts">
import { hashColor } from '~/utils/coverColor'

interface Props {
  title: string
  src?: string | null
  authorNames?: string[]
  width?: number
  height?: number
  fit?: 'cover' | 'contain'
  priority?: boolean
  rounded?: boolean
  // Long lists precompute the tile colour once per row so a theme toggle does
  // not re-hash the whole list; they pass it in rather than paying for it here.
  fallbackColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  authorNames: () => [],
  width: 240,
  height: 360,
  fit: 'contain',
  fallbackColor: undefined,
})

const { coverUrl } = useCoverUrl()

const proxiedSrc = computed(() => coverUrl(props.src, props.width))
const tileColor = computed(() => props.fallbackColor ?? hashColor(props.title, props.authorNames.join(',')))
</script>

<template>
  <AppImage
    :src="proxiedSrc"
    :alt="title"
    :width="width"
    :height="height"
    :fit="fit"
    :priority="priority"
    :rounded="rounded"
    :fallback-color="tileColor"
  >
    <template #fallback>
      <span class="cover-fallback-title">{{ title }}</span>
    </template>
  </AppImage>
</template>

<style scoped>
.cover-fallback-title {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.25;
  color: rgba(0, 0, 0, 0.72);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
