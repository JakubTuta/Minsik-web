import type { APIResponse } from '~/types/api'
import type { UserStats } from '~/types/user'
import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', () => {
  const { t } = useNuxtApp().$i18n
  const apiStore = useApiStore()
  const authStore = useAuthStore()
  const { client } = storeToRefs(apiStore)

  const stats = ref<UserStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const publicStats = ref<UserStats | null>(null)
  const publicIsLoading = ref(false)
  const publicError = ref<string | null>(null)

  const fetchStats = async (force = false) => {
    const username = authStore.user?.username
    if (!username)
      return
    if (isLoading.value && !force)
      return

    isLoading.value = true
    error.value = null
    try {
      const response = await client.value.get<APIResponse<{ stats: UserStats }>>(
        `/api/v1/users/${username}/stats`,
      )
      stats.value = response.data.data!.stats
    }
    catch (err) {
      console.error('Failed to fetch stats:', err)
      error.value = t('storeErrors.dashboardStatsLoadFailed')
    }
    finally {
      isLoading.value = false
    }
  }

  const fetchStatsByUsername = async (username: string) => {
    publicIsLoading.value = true
    publicError.value = null
    try {
      const response = await client.value.get<APIResponse<{ stats: UserStats }>>(
        `/api/v1/users/${username}/stats`,
      )
      publicStats.value = response.data.data!.stats
    }
    catch (err) {
      console.error('Failed to fetch public stats:', err)
      publicError.value = t('storeErrors.publicStatsLoadFailed')
    }
    finally {
      publicIsLoading.value = false
    }
  }

  const deleteAccount = async () => {
    await client.value.delete('/api/v1/users/me')
    await authStore.logout()
  }

  return {
    stats,
    isLoading,
    error,
    publicStats,
    publicIsLoading,
    publicError,
    fetchStats,
    fetchStatsByUsername,
    deleteAccount,
  }
})
