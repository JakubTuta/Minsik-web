import type { APIResponse } from '~/types/api'
import type { CasePhase, OpenCaseData } from '~/types/case'
import { defineStore } from 'pinia'

export const useCaseStore = defineStore('case', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const caseData = ref<OpenCaseData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const phase = ref<CasePhase>('idle')

  const openCase = async (language = 'en') => {
    if (isLoading.value)
      return

    isLoading.value = true
    error.value = null

    try {
      const response = await client.value.get<APIResponse<OpenCaseData>>('/api/v1/case/open', {
        params: { language },
      })
      console.log(response.data)
      caseData.value = response.data.data!
    }
    catch (err: any) {
      error.value = err.response?.data?.message || err.response?.data?.detail || 'Failed to open case'
      console.error('Case open error:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  const setPhase = (newPhase: CasePhase) => {
    phase.value = newPhase
  }

  const reset = () => {
    caseData.value = null
    error.value = null
    phase.value = 'idle'
    isLoading.value = false
  }

  return {
    caseData,
    isLoading,
    error,
    phase,
    openCase,
    setPhase,
    reset,
  }
})
