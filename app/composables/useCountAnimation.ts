export function useCountAnimation(
  element: Ref<HTMLElement | null>,
  target: Ref<number> | number,
  duration = 1.5,
) {
  if (!import.meta.client)
    return

  const displayValue = ref(0)
  let observer: IntersectionObserver | null = null
  let tween: gsap.core.Tween | null = null

  onMounted(() => {
    if (!element.value)
      return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetVal = typeof target === 'number'
      ? target
      : target.value

    if (prefersReducedMotion) {
      displayValue.value = targetVal

      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (!entry.isIntersecting)
            return

          observer?.disconnect()

          const { default: gsap } = await import('gsap')

          tween = gsap.to(displayValue, {
            value: targetVal,
            duration,
            ease: 'power2.out',
            onUpdate() {
              displayValue.value = Math.round(displayValue.value)
            },
          })
        })
      },
      { threshold: 0.3 },
    )

    observer.observe(element.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
    tween?.kill()
    tween = null
  })

  return displayValue
}
