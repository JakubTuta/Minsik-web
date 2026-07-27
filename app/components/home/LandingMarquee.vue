<script setup lang="ts">
import gsap from 'gsap'

const localePath = useLocalePath()

const { t } = useI18n()
const themeStore = useThemeStore()

const trackRef = ref<HTMLElement | null>(null)

const items = computed(() => [
  { text: t('home.marqueeBooks'), icon: 'mdi-book-multiple', to: '/search' },
  { text: t('home.marqueeAuthors'), icon: 'mdi-account-group', to: '/search' },
  { text: t('home.marqueePersonalized'), icon: 'mdi-brain', to: '/discover' },
  { text: t('home.marqueeTrack'), icon: 'mdi-bookshelf', to: '/bookshelf' },
  { text: t('home.marqueeUnbox'), icon: 'mdi-treasure-chest', to: '/open-case' },
  { text: t('home.marqueeSlots'), icon: 'mdi-slot-machine', to: '/play-slots' },
  { text: t('home.marqueePack'), icon: 'mdi-cards-outline', to: '/open-pack' },
  { text: t('home.marqueeCommunity'), icon: 'mdi-account-group-outline', to: '/dashboard' },
])

onMounted(() => {
  if (trackRef.value) {
    const track = trackRef.value
    // Clone the items to make the scroll infinite
    track.innerHTML += track.innerHTML

    // Simple CSS animation fallback or use GSAP
    gsap.to(track, {
      xPercent: -50,
      ease: 'none',
      duration: 50,
      repeat: -1,
    })
  }
})
</script>

<template>
  <div class="marquee-container bg-surface-variant overflow-hidden border-y py-4">
    <div
      ref="trackRef"
      class="marquee-track d-flex align-center py-2"
    >
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="marquee-item d-flex align-center px-4"
      >
        <v-btn
          :to="localePath(item.to)"
          :variant="themeStore.isDark
            ? `tonal`
            : `elevated`"
          color="primary"
          rounded="pill"
          size="large"
          class="text-none font-weight-bold px-6"
        >
          <v-icon
            :icon="item.icon"
            class="mr-2"
          />
          {{ item.text }}
        </v-btn>

        <v-icon
          icon="mdi-circle-small"
          size="50"
          color="onSurfaceVariant"
          class="mx-6 pl-10"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-container {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.marquee-track {
  width: max-content;
}

.whitespace-nowrap {
  white-space: nowrap;
}
</style>
