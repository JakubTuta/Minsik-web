<script setup lang="ts">
interface Props {
  color: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="hashed-fill"
    :style="{'backgroundColor': color}"
  />
</template>

<style scoped>
.hashed-fill {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
