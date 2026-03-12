import type { ComputedRef, Ref } from 'vue'

interface InfiniteScrollOptions {
  enabled?: Ref<boolean> | ComputedRef<boolean>
}

export function useInfiniteScroll(
  loadMore: () => void | Promise<void>,
  options: InfiniteScrollOptions = {},
) {
  const { enabled = ref(true) } = options
  const sentinel = ref<HTMLElement | null>(null)
  const isExecuting = ref(false)
  let observer: IntersectionObserver | null = null

  async function attemptLoad() {
    if (!enabled.value || isExecuting.value)
      return
    isExecuting.value = true
    try {
      await loadMore()
    }
    finally {
      isExecuting.value = false
    }
  }

  watch(sentinel, (el, old) => {
    if (old)
      observer?.unobserve(old)

    if (el) {
      if (!observer) {
        observer = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) attemptLoad() },
          { rootMargin: '300px' },
        )
      }
      observer.observe(el)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { sentinel, isExecuting }
}
