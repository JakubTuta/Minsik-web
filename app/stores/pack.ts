import type { APIResponse } from '~/types/api'
import type { OpenPackData, PackPhase, Rarity } from '~/types/case'
import { defineStore } from 'pinia'
import { RARITY_ORDER } from '~/types/case'

export const usePackStore = defineStore('pack', () => {
  const { t } = useNuxtApp().$i18n
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)
  const { language: userLanguage } = useUserLanguage()

  const packData = ref<OpenPackData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const phase = ref<PackPhase>('idle')
  const revealedCards = ref(new Set<number>())

  const highestRarity = computed<Rarity>(() => {
    if (!packData.value?.items.length)
      return 'common'

    return packData.value.items.reduce((best, item) => {
      const itemRarity = (item.rarity ?? 'common') as Rarity

      return (RARITY_ORDER[itemRarity] ?? 0) > (RARITY_ORDER[best] ?? 0)
        ? itemRarity
        : best
    }, 'common' as Rarity)
  })

  const allRevealed = computed(() => !!packData.value && revealedCards.value.size >= packData.value.items.length,
  )

  const openPack = async (language = userLanguage.value) => {
    if (isLoading.value)
      return

    isLoading.value = true
    error.value = null

    try {
      const response = await client.value.get<APIResponse<OpenPackData>>('/api/v1/pack/open', {
        params: { length: 8, language },
      })
      packData.value = response.data.data!
    }
    catch (err: any) {
      error.value = err.response?.data?.message || err.response?.data?.detail || t('storeErrors.packOpenFailed')
      console.error('Pack open error:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  const setPhase = (newPhase: PackPhase) => {
    phase.value = newPhase
  }

  const revealCard = (index: number) => {
    revealedCards.value.add(index)
  }

  const reset = () => {
    packData.value = null
    error.value = null
    phase.value = 'idle'
    isLoading.value = false
    revealedCards.value = new Set()
  }

  return {
    packData,
    isLoading,
    error,
    phase,
    revealedCards,
    highestRarity,
    allRevealed,
    openPack,
    setPhase,
    revealCard,
    reset,
  }
})
