<script setup lang="ts">
interface Props {
  src?: string | null
  alt: string
  width: number
  height: number
  fallbackColor?: string
  fit?: 'cover' | 'contain'
  priority?: boolean
  rounded?: boolean
  circle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  fallbackColor: undefined,
  fit: 'cover',
})

const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 500

const attempt = ref(0)
const failed = ref(false)
const imgRef = ref<HTMLImageElement | null>(null)

let retryTimer: ReturnType<typeof setTimeout> | undefined

// The cache proxy keys on the path alone, so the retry marker forces the
// browser to re-request without costing an upstream fetch.
const attemptedSrc = computed(() => {
  if (!props.src)
    return undefined
  if (attempt.value === 0)
    return props.src

  return `${props.src}${props.src.includes('?')
    ? '&'
    : '?'}retry=${attempt.value}`
})

const showFallback = computed(() => !props.src || failed.value)

// A cover OpenLibrary does not have still answers 200, with a 1x1 GIF labelled
// image/jpeg — a load event, no error event, and an empty-looking card. Size is
// the only way to tell it apart from a real cover.
function isPlaceholderPixel(img: HTMLImageElement): boolean {
  return img.naturalWidth <= 1 && img.naturalHeight <= 1
}

function scheduleRetry() {
  retryTimer = setTimeout(() => {
    attempt.value += 1
  }, RETRY_BASE_DELAY_MS * 2 ** attempt.value)
}

function onLoad(event: Event) {
  if (isPlaceholderPixel(event.target as HTMLImageElement))
    failed.value = true
}

function onError() {
  if (attempt.value < MAX_RETRIES) {
    scheduleRetry()

    return
  }

  failed.value = true
}

function reset() {
  clearTimeout(retryTimer)
  attempt.value = 0
  failed.value = false
}

// An image restored from the browser cache can finish before hydration attaches
// the listeners, so its load and error events never reach this component.
function settleAlreadyLoaded() {
  const img = imgRef.value
  if (!img?.complete)
    return

  if (img.naturalWidth === 0)
    onError()
  else if (isPlaceholderPixel(img))
    failed.value = true
}

watch(() => props.src, reset)
onMounted(settleAlreadyLoaded)
onBeforeUnmount(() => clearTimeout(retryTimer))
</script>

<template>
  <!--
    A plain <img>, not v-img: these render dozens per page and v-img emits no
    <img> tag during SSR, which hides every cover from crawlers and delays LCP.
  -->
  <div
    class="app-image"
    :class="{
      rounded,
      circle,
    }"
    :style="{'backgroundColor': fallbackColor}"
  >
    <img
      v-if="attemptedSrc && !failed"
      :key="attemptedSrc"
      ref="imgRef"
      :src="attemptedSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="priority
        ? 'eager'
        : 'lazy'"
      :fetchpriority="priority
        ? 'high'
        : 'auto'"
      :decoding="priority
        ? 'auto'
        : 'async'"
      class="app-image-el"
      :class="fit"
      @load="onLoad"
      @error="onError"
    >

    <div
      v-if="showFallback"
      class="app-image-fallback"
    >
      <slot name="fallback" />
    </div>
  </div>
</template>

<style scoped>
.app-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-image.rounded {
  border-radius: 8px;
}

.app-image.circle {
  border-radius: 50%;
}

.app-image-el {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.app-image-el.cover {
  object-fit: cover;
}

.app-image-el.contain {
  object-fit: contain;
}

.app-image-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  text-align: center;
  overflow: hidden;
}
</style>
