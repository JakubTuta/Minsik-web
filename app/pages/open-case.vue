<script setup lang="ts">
import type { Rarity } from '~/types/case'
import { RARITY_COLORS, RARITY_LABELS } from '~/types/case'

const caseStore = useCaseStore()
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
  get: () => !!caseStore.error,
  set: () => caseStore.reset(),
})

async function handleChestClick() {
  caseStore.setPhase('opening')

  await Promise.all([
    new Promise<void>(resolve => setTimeout(resolve, 900)),
    caseStore.openCase(),
  ])

  if (caseStore.error) {
    caseStore.setPhase('idle')

    return
  }

  // Preload winner image since we don't have display_list anymore
  if (caseStore.caseData?.winner?.primary_cover_url) {
    preloadImages([caseStore.caseData.winner.primary_cover_url])
  }

  caseStore.setPhase('spinning')
}

function handleSpinComplete() {
  caseStore.setPhase('revealing')
}

function handlePlayAgain() {
  caseStore.reset()
}

onUnmounted(() => {
  caseStore.reset()
})
</script>

<template>
  <v-container
    fluid
    class="open-case-page d-flex flex-column"
  >
    <!-- Rarity info button -->
    <div class="rarity-info-btn">
      <v-btn
        icon
        variant="text"
        size="large"
        class="text-medium-emphasis"
      >
        <v-icon>
          mdi-information-outline
        </v-icon>

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
    <!-- Chest phase (idle + opening) -->
    <Transition
      name="phase-fade"
      mode="out-in"
    >
      <div
        v-if="caseStore.phase === 'idle' || caseStore.phase === 'opening'"
        key="chest"
        class="d-flex flex-column align-center flex-grow-1 justify-center"
      >
        <CaseChest
          :opening="caseStore.phase === 'opening'"
          :disabled="caseStore.isLoading"
          @open="handleChestClick"
        />
      </div>

      <!-- Spinner phase -->
      <div
        v-else-if="caseStore.phase === 'spinning' && caseStore.caseData"
        key="spinner"
        class="spinner-phase d-flex flex-column w-100 flex-grow-1 justify-center"
      >
        <div class="mb-6 text-center">
          <h2 class="text-h5 font-weight-bold">
            Opening...
          </h2>
        </div>

        <CaseSpinner
          :data="caseStore.caseData"
          @spin-complete="handleSpinComplete"
        />
      </div>

      <!-- Reveal phase -->
      <div
        v-else-if="caseStore.phase === 'revealing' && caseStore.caseData"
        key="reveal"
        class="reveal-phase d-flex flex-column align-center w-100 flex-grow-1 justify-center"
      >
        <div class="mb-6 text-center">
          <h2 class="text-h4 font-weight-bold">
            You got...
          </h2>
        </div>

        <CaseWinnerReveal
          :winner="caseStore.caseData.winner"
          @play-again="handlePlayAgain"
        />
      </div>
    </Transition>

    <!-- Error snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      :timeout="4000"
    >
      {{ caseStore.error }}

      <template #actions>
        <v-btn
          variant="text"
          @click="caseStore.reset()"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.open-case-page {
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

.spinner-phase {
  max-width: 900px;
  margin: auto;
  padding-top: 40px;
  padding-bottom: 40px;
}

.reveal-phase {
  max-width: 640px;
  margin: 0 auto;
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
