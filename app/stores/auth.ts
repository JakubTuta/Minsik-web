import type { APIResponse } from '~/types/api'
import type { AuthTokensData, GoogleAuthRequest, LoginRequest, LogoutRequest, RefreshTokenRequest, RegisterRequest, UpdateProfileRequest, User } from '~/types/auth'
import { defineStore } from 'pinia'

const TOKEN_KEY = 'minsik_auth_token'
const REFRESH_TOKEN_KEY = 'minsik_refresh_token'
const TOKEN_EXPIRY_KEY = 'minsik_token_expiry'
const ACCESS_TOKEN_EXPIRY_SECONDS = 900 // 15 minutes

export const useAuthStore = defineStore('auth', () => {
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)
  const router = useRouter()
  const route = useRoute()

  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const tokenExpiryTime = ref<number | null>(null)
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const authInitialized = ref(false)

  let _refreshPromise: Promise<boolean> | null = null
  let _refreshInterval: ReturnType<typeof setInterval> | null = null

  // Resolves once autoLogin() completes (success or failure) — gates all non-auth API requests
  let _authReadyResolve: (() => void) | null = null
  const _authReadyPromise: Promise<void> = import.meta.client
    ? new Promise<void>((resolve) => { _authReadyResolve = resolve })
    : Promise.resolve()

  const clearRefreshInterval = () => {
    if (_refreshInterval !== null) {
      clearInterval(_refreshInterval)
      _refreshInterval = null
    }
  }

  const saveToken = (newToken: string, newRefreshToken: string) => {
    token.value = newToken
    refreshToken.value = newRefreshToken
    tokenExpiryTime.value = Date.now() + (ACCESS_TOKEN_EXPIRY_SECONDS * 1000)

    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
      localStorage.setItem(TOKEN_EXPIRY_KEY, tokenExpiryTime.value.toString())
    }
  }

  const loadToken = () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      const savedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)

      if (savedToken && savedRefreshToken) {
        token.value = savedToken
        refreshToken.value = savedRefreshToken
        tokenExpiryTime.value = savedExpiry
          ? Number.parseInt(savedExpiry)
          : null
      }
    }
  }

  const clearToken = () => {
    token.value = null
    refreshToken.value = null
    tokenExpiryTime.value = null
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await client.value.post<APIResponse<AuthTokensData>>('/api/v1/auth/login', credentials)
      const data = response.data.data!

      saveToken(data.access_token, data.refresh_token)
      user.value = data.user
      authInitialized.value = true

      return { success: true }
    }
    catch (error: any) {
      console.error('Login failed:', error)

      const errorMessage = error.response?.data?.error?.message
        || error.response?.data?.message
        || error.message
        || 'Login failed'

      return { success: false, error: errorMessage }
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const response = await client.value.post<APIResponse<AuthTokensData>>('/api/v1/auth/register', data)
      const responseData = response.data.data!

      saveToken(responseData.access_token, responseData.refresh_token)
      user.value = responseData.user
      authInitialized.value = true

      return { success: true }
    }
    catch (error: any) {
      console.error('Registration failed:', error)

      const errorMessage = error.response?.data?.error?.message
        || error.response?.data?.message
        || error.message
        || 'Registration failed'

      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      if (token.value && refreshToken.value) {
        await client.value.post('/api/v1/auth/logout', { refresh_token: refreshToken.value } as LogoutRequest)
      }
    }
    catch { /* silently ignore — clearing state regardless */ }
    finally {
      clearToken()
      clearRefreshInterval()
      user.value = null
      authInitialized.value = false

      const middleware = route.meta.middleware
      const isProtected = middleware === 'auth' || (Array.isArray(middleware) && middleware.includes('auth'))
      if (isProtected) {
        await router.push('/')
      }
    }
  }

  const shouldRefreshToken = () => {
    if (!tokenExpiryTime.value)
      return false

    const refreshThreshold = 60000

    return Date.now() + refreshThreshold >= tokenExpiryTime.value
  }

  const _doRefresh = async (): Promise<boolean> => {
    if (!refreshToken.value)
      return false

    try {
      const response = await client.value.post<APIResponse<AuthTokensData>>('/api/v1/auth/refresh', {
        refresh_token: refreshToken.value,
      } as RefreshTokenRequest)

      const data = response.data.data!
      saveToken(data.access_token, data.refresh_token)
      user.value = data.user

      return true
    }
    catch (error) {
      console.error('Token refresh failed:', error)
      clearToken()
      user.value = null

      return false
    }
  }

  const refreshAccessToken = (): Promise<boolean> => {
    if (!refreshToken.value)
      return Promise.resolve(false)

    if (_refreshPromise)
      return _refreshPromise

    _refreshPromise = _doRefresh().finally(() => {
      _refreshPromise = null
    })

    return _refreshPromise
  }

  const autoLogin = async () => {
    // autoLogin requires localStorage — client only
    if (!import.meta.client)
      return

    if (authInitialized.value)
      return

    loadToken()

    // Always refresh on page load if we have a refresh token.
    // The refresh endpoint returns user data — no separate /users/me call needed.
    if (refreshToken.value) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        clearRefreshInterval()
        _refreshInterval = setInterval(async () => {
          if (shouldRefreshToken() && refreshToken.value) {
            await refreshAccessToken()
          }
        }, 30000)
      }
    }

    authInitialized.value = true
    _authReadyResolve?.()
  }

  const waitForAuth = () => _authReadyPromise

  const googleAuth = async (code: string, redirectUri: string) => {
    try {
      const response = await client.value.post<APIResponse<AuthTokensData>>('/api/v1/auth/google', {
        code,
        redirect_uri: redirectUri,
      } as GoogleAuthRequest)
      const data = response.data.data!

      saveToken(data.access_token, data.refresh_token)
      user.value = data.user
      authInitialized.value = true

      return { success: true }
    }
    catch (error: any) {
      console.error('Google auth failed:', error)

      const errorMessage = error.response?.data?.error?.message
        || error.response?.data?.message
        || error.message
        || 'Google sign-in failed'

      return { success: false, error: errorMessage }
    }
  }

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const response = await client.value.put<APIResponse<{ user: User }>>('/api/v1/users/me', data)
      user.value = response.data.data!.user

      return { success: true }
    }
    catch (error: any) {
      console.error('Failed to update profile:', error)

      const errorMessage = error.response?.data?.error?.message
        || error.response?.data?.message
        || error.message
        || 'Failed to update profile'

      return { success: false, error: errorMessage }
    }
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    authInitialized,
    login,
    register,
    logout,
    autoLogin,
    waitForAuth,
    updateProfile,
    googleAuth,
    refreshAccessToken,
  }
})
