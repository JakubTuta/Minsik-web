import type { APIResponse } from '~/types/api'
import type { SlotsPhase, SpinSlotsData } from '~/types/case'
import { defineStore } from 'pinia'

export const useSlotsStore = defineStore('slots', () => {
  const { t } = useNuxtApp().$i18n
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)
  const { language: userLanguage } = useUserLanguage()

  const slotsData = ref<SpinSlotsData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const phase = ref<SlotsPhase>('idle')

  const spinSlots = async (language = userLanguage.value) => {
    if (isLoading.value)
      return

    isLoading.value = true
    error.value = null

    try {
      const response = await client.value.get<APIResponse<SpinSlotsData>>('/api/v1/slots/spin', {
        params: { language },
      })
      slotsData.value = response.data.data!
    }
    catch (err: any) {
      error.value = err.response?.data?.message || err.response?.data?.detail || t('storeErrors.slotsSpinFailed')
      console.error('Slots spin error:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  const setPhase = (newPhase: SlotsPhase) => {
    phase.value = newPhase
  }

  const reset = () => {
    slotsData.value = null
    error.value = null
    phase.value = 'idle'
    isLoading.value = false
  }

  return {
    slotsData,
    isLoading,
    error,
    phase,
    spinSlots,
    setPhase,
    reset,
  }
})
