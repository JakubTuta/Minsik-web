import type { AxiosError, AxiosInstance } from 'axios'
import axios from 'axios'
import { defineStore } from 'pinia'
import { readCookie } from '~/utils/cookie'

const CSRF_COOKIE = 'csrf_token'
const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete'])

export const useApiStore = defineStore('api', () => {
  const config = useRuntimeConfig()
  // SSR uses the in-cluster gateway address (stays on the internal Docker
  // network) when set; client always uses the public base since the browser
  // has no route to the internal network.
  const baseURL = import.meta.server && config.apiBaseInternal
    ? config.apiBaseInternal as string
    : config.public.apiBase as string

  let client: AxiosInstance

  const initClient = () => {
    if (!client) {
      client = axios.create({
        baseURL,
        timeout: 30000,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
        paramsSerializer: (params) => {
          const usp = new URLSearchParams()
          for (const [key, value] of Object.entries(params)) {
            if (Array.isArray(value)) {
              value.forEach(v => usp.append(key, String(v)))
            }
            else if (value !== null && value !== undefined) {
              usp.append(key, String(value))
            }
          }

          return usp.toString()
        },
      })

      // Request interceptor
      client.interceptors.request.use(
        async (config) => {
          // Only endpoints that read the signed-in user need to wait for
          // autoLogin — public content (books, authors, search, ...) must not
          // queue behind the refresh call, or every page's first paint stalls
          // on it even though the data itself doesn't depend on auth state.
          const isUserScopedEndpoint = config.url?.includes('/api/v1/users/me')

          if (isUserScopedEndpoint && import.meta.client) {
            const authStore = useAuthStore()
            await authStore.waitForAuth()
          }

          if (import.meta.client && UNSAFE_METHODS.has((config.method || 'get').toLowerCase())) {
            const csrfToken = readCookie(CSRF_COOKIE)
            if (csrfToken) {
              config.headers['X-CSRF-Token'] = csrfToken
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

          if (
            error.response?.status === 401
            && !originalRequest?._retry
            && !isRefreshEndpoint
            && import.meta.client
            && readCookie(CSRF_COOKIE)
          ) {
            originalRequest._retry = true
            const authStore = useAuthStore()
            const refreshed = await authStore.refreshAccessToken()
            if (refreshed) {
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

  initClient()

  return {
    client: computed(() => initClient()),
  }
})
