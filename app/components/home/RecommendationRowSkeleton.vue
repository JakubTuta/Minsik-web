<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), { count: 2 })
</script>

<template>
  <div>
    <div
      v-for="n in count"
      :key="n"
      class="mb-8"
    >
      <v-skeleton-loader
        type="heading"
        width="200"
        class="mb-3"
      />

      <div class="carousel-wrapper">
        <div class="carousel-track">
          <v-skeleton-loader
            v-for="m in 5"
            :key="m"
            type="image, text, text"
            class="skeleton-card flex-shrink-0 overflow-hidden rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-wrapper {
  overflow-x: hidden;
  padding-bottom: 4px;
}

.carousel-track {
  display: flex;
  gap: 20px;
  padding: 4px 2px 4px 2px;
}

.carousel-track > * {
  width: calc((100% - 4 * 20px) / 5);
  min-width: 200px;
  max-width: calc((100% - 4 * 20px) / 5);
  flex-shrink: 0;
}

.skeleton-card {
  width: calc((100% - 4 * 20px) / 5);
  min-width: 200px;
  height: 360px;
}
</style>
