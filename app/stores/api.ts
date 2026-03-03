import type { AxiosError, AxiosInstance } from 'axios'
import axios from 'axios'
import { defineStore } from 'pinia'

export const useApiStore = defineStore('api', () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  // Create axios instance
  let client: AxiosInstance

  // Initialize client
  const initClient = () => {
    if (!client) {
      client = axios.create({
        baseURL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Request interceptor
      client.interceptors.request.use(
        (config) => {
          const authEndpoints = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh', '/api/v1/auth/google']
          const isAuthEndpoint = authEndpoints.some(ep => config.url?.endsWith(ep))

          if (!isAuthEndpoint && import.meta.client) {
            const authStore = useAuthStore()
            const token = authStore.token || localStorage.getItem('minsik_auth_token')
            if (token) {
              config.headers.Authorization = `Bearer ${token}`
            }
          }

          return config
        },
        error => Promise.reject(error),
      )

      // Response interceptor
      client.interceptors.response.use(
        response => response,
        async (error: AxiosError) => {
          const originalRequest = error.config as any
          const isRefreshEndpoint = originalRequest?.url?.endsWith('/api/v1/auth/refresh')

          if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshEndpoint && import.meta.client) {
            originalRequest._retry = true
            const authStore = useAuthStore()
            const refreshed = await authStore.refreshAccessToken()
            if (refreshed && authStore.token) {
              originalRequest.headers.Authorization = `Bearer ${authStore.token}`

              return client(originalRequest)
            }
          }

          if (error.response?.status === 404) {
            console.warn('Resource not found:', error.config?.url)
          }
          else if (error.response?.status && error.response.status >= 500) {
            console.error('Server error:', error.message)
          }
          else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout')
          }

          return Promise.reject(error)
        },
      )
    }

    return client
  }

  // Initialize on store creation
  initClient()

  return {
    client: computed(() => initClient()),
  }
})
