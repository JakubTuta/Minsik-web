import type { APIResponse } from '~/types/api'
import type { UserStats } from '~/types/user'
import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', () => {
  const apiStore = useApiStore()
  const authStore = useAuthStore()
  const { client } = storeToRefs(apiStore)

  const stats = ref<UserStats | null>(null)
  const isLoading = ref(false)

  const publicStats = ref<UserStats | null>(null)
  const publicIsLoading = ref(false)

  const fetchStats = async () => {
    const username = authStore.user?.username
    if (!username)
      return

    isLoading.value = true
    try {
      const response = await client.value.get<APIResponse<{ stats: UserStats }>>(
        `/api/v1/users/${username}/stats`,
      )
      stats.value = response.data.data!.stats
    }
    catch (error) {
      console.error('Failed to fetch stats:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const fetchStatsByUsername = async (username: string) => {
    publicIsLoading.value = true
    try {
      const response = await client.value.get<APIResponse<{ stats: UserStats }>>(
        `/api/v1/users/${username}/stats`,
      )
      publicStats.value = response.data.data!.stats
    }
    catch (error) {
      console.error('Failed to fetch public stats:', error)
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
    publicStats,
    publicIsLoading,
    fetchStats,
    fetchStatsByUsername,
    deleteAccount,
  }
})
