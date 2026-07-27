import type { Rarity } from '~/types/case'

export function useRarityLabels() {
  const { t } = useI18n()

  const rarityLabels = computed<Record<Rarity, string>>(() => ({
    legendary: t('rarity.legendary'),
    ultra_rare: t('rarity.ultraRare'),
    super_rare: t('rarity.superRare'),
    rare: t('rarity.rare'),
    uncommon: t('rarity.uncommon'),
    common: t('rarity.common'),
  }))

  return { rarityLabels }
}
