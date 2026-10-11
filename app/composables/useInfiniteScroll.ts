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
  // The observer only reports changes, so it has to be remembered whether the sentinel is
  // still in view after a page loads (a short page leaves it there) or when scrolling
  // becomes enabled while it already is.
  let sentinelVisible = false
  // A page that fails to load or adds nothing would otherwise be retried forever while the
  // sentinel stays in view, so automatic follow-up loads are bounded per sighting.
  let followUps = 0
  const MAX_FOLLOW_UPS = 10
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

    await nextTick()
    if (sentinelVisible && enabled.value && followUps < MAX_FOLLOW_UPS) {
      followUps++
      attemptLoad()
    }
  }

  watch(sentinel, (el, old) => {
    if (old)
      observer?.unobserve(old)

    if (el) {
      if (!observer) {
        observer = new IntersectionObserver(
          ([entry]) => {
            sentinelVisible = Boolean(entry?.isIntersecting)
            if (sentinelVisible) {
              followUps = 0
              attemptLoad()
            }
          },
          { rootMargin: '300px' },
        )
      }
      observer.observe(el)
    }
  })

  watch(enabled, (isEnabled) => {
    if (isEnabled && sentinelVisible) {
      followUps = 0
      attemptLoad()
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { sentinel, isExecuting }
}
