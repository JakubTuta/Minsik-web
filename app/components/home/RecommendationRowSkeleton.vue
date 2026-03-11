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

      <div class="d-flex gap-3">
        <v-skeleton-loader
          v-for="m in 5"
          :key="m"
          type="image, text, text"
          class="flex-shrink-0 rounded-lg"
          style="min-width: 200px; height: 380px;"
        />
      </div>
    </div>
  </div>
</template>
