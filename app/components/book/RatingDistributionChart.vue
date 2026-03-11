<script setup lang="ts">
interface Props {
  distribution: Record<string, number>
  selectedRating: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [rating: number | null]
}>()

const rows = [5, 4, 3, 2, 1]

const maxCount = computed(() => Math.max(1, ...Object.values(props.distribution)))

function countFor(rating: number) {
  return props.distribution[String(rating)] ?? 0
}

function barWidth(rating: number) {
  return `${(countFor(rating) / maxCount.value) * 100}%`
}

function toggle(rating: number) {
  emit('select', props.selectedRating === rating
    ? null
    : rating)
}
</script>

<template>
  <div class="rating-chart">
    <div
      v-for="rating in rows"
      :key="rating"
      class="rating-row"
      :class="{'rating-row--selected': selectedRating === rating}"
      role="button"
      :aria-pressed="selectedRating === rating"
      :aria-label="`Filter by ${rating} stars`"
      @click="toggle(rating)"
    >
      <!-- Star label -->
      <span class="rating-label text-body-2 text-medium-emphasis">
        {{ rating }} <v-icon
          size="12"
          icon="mdi-star"
          color="amber"
        />
      </span>

      <!-- Bar track -->
      <div class="bar-track">
        <div
          class="bar-fill"
          :style="{'width': barWidth(rating)}"
          :class="{'bar-fill--selected': selectedRating === rating}"
        />
      </div>

      <!-- Count -->
      <span class="rating-count text-body-2 text-medium-emphasis">
        {{ countFor(rating).toLocaleString() }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.rating-chart {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 6px;
  padding: 4px 6px;
  transition: background-color 0.15s ease;
}

.rating-row:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
}

.rating-row--selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.rating-label {
  width: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.bar-track {
  flex: 1;
  height: 10px;
  background-color: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: rgba(var(--v-theme-primary), 0.5);
  border-radius: 5px;
  transition: width 0.3s ease, background-color 0.15s ease;
}

.bar-fill--selected {
  background-color: rgb(var(--v-theme-primary));
}

.rating-count {
  width: 40px;
  flex-shrink: 0;
  text-align: right;
}
</style>
