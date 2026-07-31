interface ScrollRevealOptions {
  delay?: number
  duration?: number
  y?: number
  stagger?: number
}

export function useScrollReveal(
  element: Ref<HTMLElement | null>,
  options: ScrollRevealOptions = {},
) {
  if (!import.meta.client)
    return

  const { delay = 0, duration = 0.6, y = 30, stagger = 0 } = options

  // Handle both native elements and Vue component instances (which expose $el)
  function resolveEl(val: unknown): HTMLElement | null {
    if (!val)
      return null

    return (val as any).$el ?? (val as HTMLElement)
  }

  let observer: IntersectionObserver | null = null
  let tween: gsap.core.Tween | null = null

  onMounted(() => {
    const el = resolveEl(element.value)
    if (!el)
      return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion)
      return

    const targets = stagger > 0
      ? Array.from(el.children).filter(child => child instanceof HTMLElement) as HTMLElement[]
      : [el]

    if (targets.length === 0)
      return

    // Hide via plain style writes rather than `gsap.set` — this keeps gsap
    // (70KB) out of the home/discover critical path entirely; it's only
    // imported once something actually needs to animate, below.
    for (const target of targets) {
      target.style.opacity = '0'
      target.style.transform = `translateY(${y}px)`
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (!entry.isIntersecting)
            return

          observer?.disconnect()

          const animTargets = stagger > 0
            ? targets
            : [entry.target as HTMLElement]

          const { default: gsap } = await import('gsap')

          tween = gsap.to(animTargets, {
            opacity: 1,
            y: 0,
            duration,
            delay,
            stagger: stagger > 0
              ? stagger
              : 0,
            ease: 'power2.out',
            onStart() {
              animTargets.forEach(el => el.style.setProperty('will-change', 'transform, opacity'))
            },
            onComplete() {
              animTargets.forEach(el => el.style.removeProperty('will-change'))
            },
          })
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    if (stagger > 0) {
      observer.observe(el)
    }
    else if (targets[0]) {
      observer.observe(targets[0])
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
    tween?.kill()
    tween = null
  })
}
