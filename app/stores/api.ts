import type { AxiosError, AxiosInstance } from 'axios'
import axios from 'axios'
import { defineStore, getActivePinia } from 'pinia'

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
          const authEndpoints = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh']
          const isAuthEndpoint = authEndpoints.some(ep => config.url?.endsWith(ep))

          if (!isAuthEndpoint && import.meta.client) {
            // Prefer Pinia state (always in sync) over localStorage
            const authState = getActivePinia()?.state?.value?.auth as { token?: string | null } | undefined
            const token = authState?.token ?? localStorage.getItem('minsik_auth_token')
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
        (error: AxiosError) => {
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
