<script setup lang="ts">
import gsap from 'gsap'

interface Props {
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ pull: [] }>()

const leverRef = ref<HTMLElement | null>(null)
const handleRef = ref<HTMLElement | null>(null)

function pullLever() {
  if (props.disabled)
    return

  emit('pull')

  gsap.timeline()
    .to(leverRef.value, {
      scaleY: -0.8,
      duration: 0.3,
      ease: 'power2.in',
    })
    .to(leverRef.value, {
      scaleY: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    })
}
</script>

<template>
  <div class="slots-lever-container">
    <div class="base" />

    <div class="slot" />

    <div
      ref="leverRef"
      class="lever-group"
    >
      <div class="lever-stick" />

      <button
        ref="handleRef"
        type="button"
        class="lever-handle"
        :class="{'lever-disabled': disabled}"
        :disabled="disabled"
        @click="pullLever"
      />
    </div>
  </div>
</template>

<style scoped>
.slots-lever-container {
  position: relative;
  width: 60px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.base {
  width: 40px;
  height: 60px;
  background: linear-gradient(90deg, #666, #999, #666);
  border-radius: 8px;
  border: 2px solid #444;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.slot {
  position: absolute;
  bottom: 20px;
  width: 12px;
  height: 120px;
  background: #222;
  border-radius: 6px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8);
  z-index: 1;
}

.lever-group {
  position: absolute;
  bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: bottom center;
  z-index: 3;
}

.lever-stick {
  width: 12px;
  height: 100px;
  background: linear-gradient(90deg, #aaa, #ddd, #aaa);
  border-radius: 6px;
  border: 1px solid #888;
}

.lever-handle {
  width: 36px;
  height: 36px;
  background: radial-gradient(circle at 30% 30%, #ff4444, #aa0000);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4), inset 0 -2px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: -6px;
  transition: filter 0.2s;
}

.lever-handle:hover:not(.lever-disabled) {
  filter: brightness(1.1);
}

.lever-disabled {
  background: radial-gradient(circle at 30% 30%, #888, #555);
  cursor: not-allowed;
}
</style>
