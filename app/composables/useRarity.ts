import type { Rarity } from '~/types/case'
import { RARITY_COLORS } from '~/types/case'

const RARITY_ICONS: Record<Rarity, string> = {
  legendary: 'mdi-snowflake',
  ultra_rare: 'mdi-diamond-stone',
  super_rare: 'mdi-star-shooting',
  rare: 'mdi-star',
  uncommon: 'mdi-shield-star',
  common: 'mdi-circle',
}

function getRandomRarity(): Rarity {
  const rand = Math.random()
  if (rand < 0.015)
    return 'legendary'
  if (rand < 0.05)
    return 'ultra_rare'
  if (rand < 0.15)
    return 'super_rare'
  if (rand < 0.35)
    return 'rare'
  if (rand < 0.65)
    return 'uncommon'

  return 'common'
}

function getIconColor(rarity: Rarity | string | null | undefined): string {
  return RARITY_COLORS[rarity as Rarity] ?? RARITY_COLORS.common
}

export function useRarity() {
  return {
    RARITY_ICONS,
    getRandomRarity,
    getIconColor,
  }
}
