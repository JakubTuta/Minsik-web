<script setup lang="ts">
import { useDisplay } from 'vuetify'

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

const { mobile } = useDisplay()
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
          :size="mobile
            ? 22
            : 28"
          class="mb-1"
        />

        <div
          class="d-flex align-center font-weight-bold"
          :class="mobile
            ? 'text-subtitle-1'
            : 'text-h5'"
        >
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

        <span
          class="text-medium-emphasis mt-1"
          :class="mobile
            ? 'text-caption'
            : 'text-body-2'"
        >{{ stat.label }}</span>
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
