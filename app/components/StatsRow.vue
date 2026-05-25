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
  <div class="d-flex flex-wrap align-center">
    <template
      v-for="(stat, i) in stats"
      :key="i"
    >
      <div class="d-flex flex-column align-center px-4">
        <div class="d-flex align-center gap-1 text-body-1 font-weight-bold">
          <v-icon
            :icon="stat.icon"
            :color="stat.iconColor"
            size="small"
          />
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
        <span class="text-caption text-medium-emphasis">{{ stat.label }}</span>
      </div>

      <v-divider
        v-if="i < stats.length - 1"
        vertical
        class="mx-0"
        style="height: 36px; align-self: center;"
      />
    </template>
  </div>
</template>
