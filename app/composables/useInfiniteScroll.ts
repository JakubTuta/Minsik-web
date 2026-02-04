import type { Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

interface InfiniteScrollOptions {
  threshold?: number
  enabled?: Ref<boolean>
  debounce?: number
}

export function useInfiniteScroll(
  loadMore: () => void | Promise<void>,
  options: InfiniteScrollOptions = {},
) {
  const {
    threshold = 400,
    enabled = ref(true),
    debounce = 100,
  } = options

  let timeoutId: NodeJS.Timeout | null = null
  const isExecuting = ref(false)

  const handleScroll = async () => {
    if (!enabled.value || isExecuting.value)
      return

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Debounce scroll events
    timeoutId = setTimeout(async () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const documentHeight = document.documentElement.scrollHeight

      // Check if we're near the bottom
      if (documentHeight - scrollPosition < threshold) {
        isExecuting.value = true
        try {
          await loadMore()
        }
        finally {
          isExecuting.value = false
        }
      }
    }, debounce)
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return {
    isExecuting,
  }
}
