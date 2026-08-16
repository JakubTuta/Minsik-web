<script setup lang="ts">
import type { RecommendationSection } from '~/types/recommendations'

interface Props {
  sections: RecommendationSection[]
  hideShowMore?: boolean
}

defineProps<Props>()

// Keyed by section.key rather than array index — `sections` can change
// identity after mount (a locale switch re-fetches home-recommendations, or
// the personalized fetch resolves from `[]` to real data), and an
// index-based reveal state would silently misattribute "revealed" to the
// wrong row once the array is replaced.
const revealedKeys = ref(new Set<string>())
const rowElements = new Map<string, HTMLElement>()
let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting)
          continue
        const key = (entry.target as HTMLElement).dataset.sectionKey
        if (key) {
          revealedKeys.value.add(key)
          observer?.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '400px' },
  )

  return observer
}

function setRowRef(el: Element | null, key: string) {
  const htmlEl = el as HTMLElement | null
  const existing = rowElements.get(key)
  if (existing && existing !== htmlEl)
    observer?.unobserve(existing)

  if (htmlEl) {
    rowElements.set(key, htmlEl)
    if (!revealedKeys.value.has(key))
      getObserver().observe(htmlEl)
  }
  else {
    rowElements.delete(key)
  }
}

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div
    v-for="section in sections"
    :key="section.key"
    :ref="(el) => setRowRef(el as Element | null, section.key)"
    :data-section-key="section.key"
  >
    <RecommendationRow
      v-if="revealedKeys.has(section.key)"
      :category="section"
      :hide-show-more="hideShowMore"
    />

    <RecommendationRowSkeleton
      v-else
      :count="1"
    />
  </div>
</template>
