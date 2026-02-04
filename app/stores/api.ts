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
          // Future: Add auth token when authentication is implemented
          // const token = localStorage.getItem('auth_token')
          // if (token) {
          //   config.headers.Authorization = `Bearer ${token}`
          // }
          return config
        },
        error => Promise.reject(error),
      )

      // Response interceptor
      client.interceptors.response.use(
        response => response,
        (error: AxiosError) => {
          // Handle errors globally
          if (error.response?.status === 401) {
            // Future: Redirect to login when auth is implemented
            console.warn('Unauthorized access')
          }
          else if (error.response?.status === 404) {
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
