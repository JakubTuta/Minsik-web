<script setup lang="ts">
import { hashColor } from '~/utils/coverColor'

interface Props {
  name: string
  src?: string | null
  size?: number
  priority?: boolean
  square?: boolean
  fallbackColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  size: 140,
  fallbackColor: undefined,
})

const WHITESPACE = /\s+/

const { coverUrl } = useCoverUrl()

const proxiedSrc = computed(() => coverUrl(props.src, props.size))
const tileColor = computed(() => props.fallbackColor ?? hashColor(props.name))

const initials = computed(() => props.name
  .split(WHITESPACE)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase() ?? '')
  .join(''))

const initialsSize = computed(() => `${Math.max(12, Math.round(props.size * 0.36))}px`)
</script>

<template>
  <AppImage
    :src="proxiedSrc"
    :alt="name"
    :width="size"
    :height="size"
    fit="cover"
    :priority="priority"
    :circle="!square"
    :rounded="square"
    :fallback-color="tileColor"
  >
    <template #fallback>
      <span
        class="author-fallback-initials"
        :style="{'fontSize': initialsSize}"
      >{{ initials }}</span>
    </template>
  </AppImage>
</template>

<style scoped>
.author-fallback-initials {
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  color: rgba(0, 0, 0, 0.72);
}
</style>
