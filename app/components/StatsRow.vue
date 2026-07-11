<script setup lang="ts">
import { useDisplay } from 'vuetify'

interface StatItem {
  icon: string
  iconColor?: string
  value: string | number
  label: string
  tooltipLines?: string[]
}

const props = defineProps<{
  stats: StatItem[]
}>()

const { mobile } = useDisplay()

const mobileColumns = computed(() => {
  if (props.stats.length === 4)
    return 2

  return Math.max(1, Math.min(3, props.stats.length))
})
</script>

<template>
  <div
    class="w-100"
    :class="mobile
      ? undefined
      : 'd-flex align-center'"
    :style="mobile
      ? {'display': 'grid',
         'gridTemplateColumns': `repeat(${mobileColumns}, 1fr)`,
         'gap': '4px'}
      : undefined"
  >
    <template
      v-for="(stat, i) in stats"
      :key="i"
    >
      <div
        class="d-flex flex-column align-center py-2"
        :class="mobile
          ? ''
          : 'flex-1-1'"
      >
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
          class="text-medium-emphasis mt-1 text-center"
          :class="mobile
            ? 'text-caption'
            : 'text-body-2'"
        >{{ stat.label }}</span>
      </div>

      <v-divider
        v-if="!mobile && i < stats.length - 1"
        vertical
        class="mx-0"
        style="height: 48px; align-self: center;"
      />
    </template>
  </div>
</template>
