<script setup lang="ts">
import type { Rarity } from '~/types/case'
import { RARITY_COLORS, RARITY_LABELS } from '~/types/case'

useSeoMeta({
  title: 'Open a Pack - Minsik',
  description: 'Open a book pack and discover 8 random books across all rarity tiers.',
})

const packStore = usePackStore()
const { preloadImages } = useImagePreloader()

const rarityTiers: { rarity: Rarity, range: string, probability: string }[] = [
  { rarity: 'legendary', range: '> 4.75', probability: '~1.5%' },
  { rarity: 'ultra_rare', range: '4.51 – 4.75', probability: '~3.5%' },
  { rarity: 'super_rare', range: '4.01 – 4.50', probability: '~10%' },
  { rarity: 'rare', range: '3.26 – 4.00', probability: '~20%' },
  { rarity: 'uncommon', range: '2.26 – 3.25', probability: '~30%' },
  { rarity: 'common', range: '≤ 2.25', probability: '~35%' },
]

const showError = computed({
  get: () => !!packStore.error,
  set: () => packStore.reset(),
})

const highestRarityColor = computed(() => RARITY_COLORS[packStore.highestRarity])

async function handlePackClick() {
  packStore.setPhase('opening')

  await Promise.all([
    new Promise<void>(resolve => setTimeout(resolve, 900)),
    packStore.openPack(),
  ])

  if (packStore.error) {
    packStore.setPhase('idle')

    return
  }

  preloadImages(packStore.packData!.items.map(item => item.primary_cover_url))
  packStore.setPhase('glow')
}

function handleGlowComplete() {
  packStore.setPhase('spread')
}

function handleReveal(index: number) {
  packStore.revealCard(index)
  if (packStore.allRevealed) {
    packStore.setPhase('done')
  }
}

function handleOpenAnother() {
  packStore.reset()
}

onUnmounted(() => {
  packStore.reset()
})
</script>

<template>
  <v-container
    fluid
    class="open-pack-page d-flex flex-column"
  >
    <!-- Rarity info button -->
    <div class="rarity-info-btn">
      <v-btn
        icon
        variant="text"
        size="large"
        class="text-medium-emphasis"
      >
        <v-icon>mdi-information-outline</v-icon>

        <v-tooltip
          activator="parent"
          location="bottom end"
          :open-delay="100"
        >
          <div class="rarity-tooltip pa-1">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              Rarity Tiers
            </div>

            <div
              v-for="tier in rarityTiers"
              :key="tier.rarity"
              class="d-flex align-center mb-1 gap-2"
            >
              <div
                class="rarity-dot"
                :style="{'backgroundColor': RARITY_COLORS[tier.rarity]}"
              />

              <span
                class="font-weight-medium"
                :style="{'color': RARITY_COLORS[tier.rarity]}"
              >{{ RARITY_LABELS[tier.rarity] }}</span>

              <span class="text-medium-emphasis text-caption">({{ tier.range }})</span>

              <span class="text-caption font-weight-bold ml-auto">{{ tier.probability }}</span>
            </div>
          </div>
        </v-tooltip>
      </v-btn>
    </div>

    <Transition
      name="phase-fade"
      mode="out-in"
    >
      <!-- Idle / Opening phase -->
      <div
        v-if="packStore.phase === 'idle' || packStore.phase === 'opening'"
        key="pack"
        class="d-flex flex-column align-center flex-grow-1 justify-center"
      >
        <PackClosed
          :opening="packStore.phase === 'opening'"
          :disabled="packStore.isLoading"
          @open="handlePackClick"
        />
      </div>

      <!-- Glow phase -->
      <div
        v-else-if="packStore.phase === 'glow'"
        key="glow"
        class="d-flex flex-column align-center flex-grow-1 justify-center"
      >
        <PackGlowCard
          :rarity-color="highestRarityColor"
          @glow-complete="handleGlowComplete"
        />
      </div>

      <!-- Spread / Done phase -->
      <div
        v-else-if="(packStore.phase === 'spread' || packStore.phase === 'done') && packStore.packData"
        key="spread"
        class="spread-phase d-flex flex-column align-center w-100 pb-10"
      >
        <div class="mb-6 text-center">
          <h2 class="text-h4 font-weight-bold">
            Your books
          </h2>

          <p class="text-body-2 text-medium-emphasis mt-1">
            Click each card to reveal
          </p>
        </div>

        <PackCardGrid
          :items="packStore.packData.items"
          :revealed-cards="packStore.revealedCards"
          @reveal="handleReveal"
          @open-another="handleOpenAnother"
        />
      </div>
    </Transition>

    <!-- Error snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      :timeout="4000"
    >
      {{ packStore.error }}

      <template #actions>
        <v-btn
          variant="text"
          @click="packStore.reset()"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.open-pack-page {
  min-height: calc(100vh - var(--app-bar-height));
  padding: 40px 16px;
  position: relative;
  overflow-x: hidden;
}

.rarity-info-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.rarity-tooltip {
  min-width: 260px;
}

.rarity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.spread-phase {
  max-width: 820px;
  margin: 0 auto;
  padding-top: 16px;
}

.phase-fade-enter-active,
.phase-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.phase-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.phase-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
