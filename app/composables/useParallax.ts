import { useDisplay } from 'vuetify'

export function useParallax(
  element: Ref<HTMLElement | null>,
  intensity = 0.05,
) {
  if (!import.meta.client)
    return

  const { smAndDown } = useDisplay()
  let rafId: number | null = null

  function onScroll() {
    if (!element.value)
      return

    if (rafId !== null)
      return

    rafId = requestAnimationFrame(() => {
      rafId = null

      if (!element.value)
        return

      const rect = element.value.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2
      const elementCenter = rect.top + rect.height / 2
      const offset = (elementCenter - viewportCenter) * intensity
      const clamped = Math.max(-10, Math.min(10, offset))

      element.value.style.transform = `translateY(${clamped}px)`
    })
  }

  onMounted(() => {
    if (smAndDown.value)
      return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion)
      return

    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (element.value)
      element.value.style.transform = ''
  })
}
