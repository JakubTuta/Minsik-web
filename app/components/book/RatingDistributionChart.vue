<script setup lang="ts">
interface Props {
  distribution: Record<string, number>
  selectedRating: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [rating: number | null]
}>()

const rows = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
const BAR_HEIGHT = 120

const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

const maxCount = computed(() => Math.max(1, ...rows.map(r => countFor(r))))

function countFor(rating: number) {
  return props.distribution[rating.toFixed(1)]
    ?? props.distribution[String(rating)]
    ?? 0
}

function barHeight(rating: number) {
  const pct = countFor(rating) / maxCount.value
  return `${Math.max(pct * BAR_HEIGHT, pct > 0 ? 3 : 0)}px`
}

function toggle(rating: number) {
  emit('select', props.selectedRating === rating ? null : rating)
}
</script>

<template>
  <div class="chart-wrap">
    <div class="chart-columns">
      <div
        v-for="rating in rows"
        :key="rating"
        class="chart-col"
        :class="{ 'chart-col--selected': selectedRating === rating }"
        role="button"
        :aria-pressed="selectedRating === rating"
        :aria-label="`Filter by ${rating} stars`"
        @click="toggle(rating)"
      >
        <!-- Bar grows from bottom up -->
        <div class="bar-area">
          <div
            class="bar"
            :class="{ 'bar--selected': selectedRating === rating }"
            :style="{ height: barHeight(rating) }"
          />
        </div>

        <!-- Labels below bar -->
        <div class="col-labels">
          <span class="rating-val">
            {{ rating }}<v-icon
              icon="mdi-star"
              size="9"
              color="amber"
            />
          </span>
          <span class="rating-cnt">{{ compactFmt.format(countFor(rating)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap {
  max-width: 640px;
}

.chart-columns {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.chart-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  padding: 6px 2px 4px;
  transition: background-color 0.15s ease;
}

.chart-col:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
}

.chart-col--selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.bar-area {
  width: 100%;
  height: v-bind('`${BAR_HEIGHT}px`');
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bar {
  width: 100%;
  background-color: rgba(var(--v-theme-primary), 0.45);
  border-radius: 3px 3px 0 0;
  transition: height 0.3s ease, background-color 0.15s ease;
}

.bar--selected {
  background-color: rgb(var(--v-theme-primary));
}

.col-labels {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 5px;
  gap: 1px;
}

.rating-val {
  font-size: 0.68rem;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 1px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.rating-cnt {
  font-size: 0.62rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
</style>
