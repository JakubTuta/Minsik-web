<script setup lang="ts">
import type { Rarity } from '~/types/case'
import { RARITY_COLORS } from '~/types/case'

interface Props {
  rarity: Rarity
  size?: 'small' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
})

const { RARITY_ICONS } = useRarity()
const { rarityLabels } = useRarityLabels()

const color = computed(() => RARITY_COLORS[props.rarity] ?? RARITY_COLORS.common)
</script>

<template>
  <v-chip
    :size="size"
    variant="outlined"
    class="font-weight-bold rarity-badge"
    :style="{color,
             'borderColor': color,
             'backgroundColor': `color-mix(in oklab, ${color} 14%, transparent)`}"
    :prepend-icon="RARITY_ICONS[rarity]"
  >
    {{ rarityLabels[rarity] }}
  </v-chip>
</template>

<style scoped>
.rarity-badge {
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.6rem;
}
</style>
