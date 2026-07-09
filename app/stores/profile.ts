import type { APIResponse } from '~/types/api'
import type { ProfileOverview } from '~/types/user'
import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)

  const overview = ref<ProfileOverview | null>(null)
  const isLoading = ref(false)

  const fetchOverview = async (username: string) => {
    isLoading.value = true
    try {
      const response = await client.value.get<APIResponse<ProfileOverview>>(
        `/api/v1/users/${username}/profile-overview`,
      )
      overview.value = response.data.data!

      return overview.value
    }
    catch (error) {
      console.error('Failed to fetch profile overview:', error)
      overview.value = null
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    overview,
    isLoading,
    fetchOverview,
  }
})
