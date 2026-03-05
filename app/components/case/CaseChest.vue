<script setup lang="ts">
interface Props {
  opening?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  opening: false,
  disabled: false,
})

const emit = defineEmits<{
  open: []
}>()
</script>

<template>
  <div class="chest-wrapper d-flex flex-column align-center justify-center">
    <div
      class="chest-container"
      :class="{
        'chest-idle': !opening && !disabled,
        'chest-opening': opening,
      }"
      @click="!disabled && !opening && emit('open')"
    >
      <div class="chest-glow" />

      <v-icon
        icon="mdi-treasure-chest"
        :size="200"
        color="#FFD700"
        class="chest-icon"
      />
    </div>

    <div
      class="mt-6 text-center"
      :class="{ 'click-label': !opening && !disabled, 'opacity-0': opening }"
    >
      <div class="text-h6 font-weight-bold text-medium-emphasis">
        Open a Book Case
      </div>

      <div class="text-body-2 text-medium-emphasis mt-1">
        Click to reveal a random book
      </div>
    </div>
  </div>
</template>

<style scoped>
.chest-wrapper {
  user-select: none;
}

.chest-container {
  position: relative;
  cursor: pointer;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chest-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.chest-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4));
}

.chest-idle {
  animation: float 3s ease-in-out infinite;
}

.chest-idle .chest-icon {
  animation: glow-pulse 2s ease-in-out infinite;
}

.chest-idle:hover .chest-icon {
  filter: drop-shadow(0 0 35px rgba(255, 215, 0, 0.7));
}

.chest-idle:hover {
  transform: scale(1.05);
}

.chest-opening {
  animation: chest-open 0.8s ease-out forwards;
  pointer-events: none;
}

.click-label {
  animation: label-pulse 2s ease-in-out infinite;
}

.opacity-0 {
  opacity: 0;
  transition: opacity 0.3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-14px); }
}

@keyframes glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4)); }
  50% { filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.75)); }
}

@keyframes chest-open {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  20% { transform: scale(1.12) rotate(-3deg); }
  40% { transform: scale(1.18) rotate(3deg); }
  60% { transform: scale(1.22) rotate(-2deg); }
  100% { transform: scale(1.5) rotate(0deg); opacity: 0; }
}

@keyframes label-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
</style>
