<script setup lang="ts">
interface StatItem {
  icon: string
  iconColor?: string
  value: string | number
  label: string
  tooltipLines?: string[]
}

defineProps<{
  stats: StatItem[]
}>()
</script>

<template>
  <div class="d-flex align-center w-100">
    <template
      v-for="(stat, i) in stats"
      :key="i"
    >
      <div class="d-flex flex-column align-center flex-1-1 py-2">
        <v-icon
          :icon="stat.icon"
          :color="stat.iconColor"
          size="28"
          class="mb-1"
        />

        <div class="d-flex align-center text-h5 font-weight-bold">
          <span>
            {{ stat.value }}
            <v-tooltip
              v-if="stat.tooltipLines && stat.tooltipLines.length > 0"
              activator="parent"
              location="bottom"
            >
              <div
                v-for="(line, j) in stat.tooltipLines"
                :key="j"
              >
                {{ line }}
              </div>
            </v-tooltip>
          </span>
        </div>

        <span class="text-body-2 text-medium-emphasis mt-1">{{ stat.label }}</span>
      </div>

      <v-divider
        v-if="i < stats.length - 1"
        vertical
        class="mx-0"
        style="height: 48px; align-self: center;"
      />
    </template>
  </div>
</template>
