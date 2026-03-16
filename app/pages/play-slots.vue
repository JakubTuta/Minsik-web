<script setup lang="ts">
import CaseWinnerReveal from '~/components/case/CaseWinnerReveal.vue'
import SlotsLever from '~/components/slots/SlotsLever.vue'
import SlotsMachine from '~/components/slots/SlotsMachine.vue'
import { useSlotsStore } from '~/stores/slots'
import { RARITY_COLORS, RARITY_LABELS } from '~/types/case'

useSeoMeta({
  title: 'Play Slots - Minsik',
  description: 'Play slots to win books of different rarities.',
})

const slotsStore = useSlotsStore()

const rarityTiers = [
  { rarity: 'legendary', probability: '~1.5%' },
  { rarity: 'ultra_rare', probability: '~3.5%' },
  { rarity: 'super_rare', probability: '~10%' },
  { rarity: 'rare', probability: '~20%' },
  { rarity: 'uncommon', probability: '~30%' },
  { rarity: 'common', probability: '~35%' },
] as const

const showError = computed({
  get: () => !!slotsStore.error,
  set: () => slotsStore.reset(),
})

async function handlePull() {
  slotsStore.setPhase('pulling')

  await Promise.all([
    new Promise(resolve => setTimeout(resolve, 600)), // wait for lever animation to complete its down stroke
    slotsStore.spinSlots(),
  ])

  if (slotsStore.error) {
    slotsStore.setPhase('idle')

    return
  }

  slotsStore.setPhase('spinning')
}

function handleSpinComplete() {
  slotsStore.setPhase('revealing')
}

function handlePlayAgain() {
  slotsStore.reset()
}

onUnmounted(() => {
  slotsStore.reset()
})
</script>

<template>
  <v-container
    fluid
    class="play-slots-page d-flex flex-column"
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

              <span class="text-caption font-weight-bold ml-auto">{{ tier.probability }}</span>
            </div>
          </div>
        </v-tooltip>
      </v-btn>
    </div>

    <!-- Slots Main Content -->
    <div class="slots-content-area d-flex flex-column align-center w-100 flex-grow-1 justify-center">
      <Transition
        name="fade"
        mode="out-in"
      >
        <div
          v-if="slotsStore.phase === 'revealing' && slotsStore.slotsData"
          class="reveal-phase w-100"
        >
          <div class="mb-6 text-center">
            <h2 class="text-h4 font-weight-bold">
              You won...
            </h2>
          </div>

          <CaseWinnerReveal
            :winner="slotsStore.slotsData.winner"
            @play-again="handlePlayAgain"
          />
        </div>

        <div
          v-else
          class="d-flex flex-column align-center w-100"
        >
          <div
            class="slots-machine-wrapper d-flex flex-column flex-md-row align-center justify-center gap-4"
          >
            <div class="d-md-none lever-mobile mb-4">
              <SlotsLever
                :disabled="slotsStore.phase !== 'idle'"
                @pull="handlePull"
              />
            </div>

            <SlotsMachine
              :data="slotsStore.slotsData"
              :spinning="slotsStore.phase === 'spinning' || slotsStore.phase === 'pulling'"
              @spin-complete="handleSpinComplete"
            />

            <div class="d-none d-md-block lever-desktop ml-4">
              <SlotsLever
                :disabled="slotsStore.phase !== 'idle'"
                @pull="handlePull"
              />
            </div>
          </div>

          <!-- Description below initial state -->
          <div
            class="mt-8 text-center"
            :class="{'opacity-0': slotsStore.phase !== 'idle'}"
            style="transition: opacity 0.3s ease;"
          >
            <div class="text-h6 font-weight-bold text-medium-emphasis">
              Play Book Slots
            </div>

            <div class="text-body-2 text-medium-emphasis mt-1">
              Pull the lever to reveal random book rarities
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Error snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      :timeout="4000"
    >
      {{ slotsStore.error }}

      <template #actions>
        <v-btn
          variant="text"
          @click="slotsStore.reset()"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.play-slots-page {
  min-height: calc(100vh - 64px);
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
  min-width: 220px;
}

.rarity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.slots-content-area {
  max-width: 900px;
  margin: 0 auto;
}

.reveal-phase {
  max-width: 640px;
  margin: 0 auto;
}

.gap-4 {
  gap: 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
