import type { APIResponse } from '~/types/api'
import type { GoogleAuthRequest, LoginRequest, RegisterRequest, SessionData, UpdateProfileRequest, User } from '~/types/auth'
import { defineStore } from 'pinia'
import { deleteCookie, readCookie } from '~/utils/cookie'

const LAST_REFRESH_KEY = 'minsik_last_refresh'
const CSRF_COOKIE = 'csrf_token'
const REFRESH_DEDUP_MS = 5000
const REFRESH_LEAD_SECONDS = 60
const MIN_REFRESH_DELAY_SECONDS = 30

export const useAuthStore = defineStore('auth', () => {
  const { t, te } = useI18n()
  const apiStore = useApiStore()
  const { client } = storeToRefs(apiStore)
  const router = useRouter()
  const route = useRoute()
  const localePath = useLocalePath()

  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const authInitialized = ref(false)

  let _refreshPromise: Promise<boolean> | null = null
  let _refreshTimer: ReturnType<typeof setTimeout> | null = null

  // Resolves once autoLogin() completes (success or failure) — gates all non-auth API requests
  let _authReadyResolve: (() => void) | null = null
  const _authReadyPromise: Promise<void> = import.meta.client
    ? new Promise<void>((resolve) => { _authReadyResolve = resolve })
    : Promise.resolve()

  const clearRefreshTimer = () => {
    if (_refreshTimer !== null) {
      clearTimeout(_refreshTimer)
      _refreshTimer = null
    }
  }

  const scheduleRefresh = (expiresInSeconds: number) => {
    if (!import.meta.client)
      return

    clearRefreshTimer()
    const delaySeconds = Math.max(expiresInSeconds - REFRESH_LEAD_SECONDS, MIN_REFRESH_DELAY_SECONDS)
    _refreshTimer = setTimeout(() => {
      refreshAccessToken()
    }, delaySeconds * 1000)
  }

  const _doRefresh = async (): Promise<boolean> => {
    try {
      const response = await client.value.post<APIResponse<SessionData>>('/api/v1/auth/refresh')
      const data = response.data.data!
      user.value = data.user
      scheduleRefresh(data.expires_in)

      return true
    }
    catch (error: any) {
      // Only a genuine 401 (refresh token invalid/expired) ends the session.
      // Network errors and 5xx are transient — keep the session so a later retry can recover.
      if (error.response?.status === 401) {
        user.value = null
        clearRefreshTimer()
        localStorage.removeItem(LAST_REFRESH_KEY)
        deleteCookie(CSRF_COOKIE)
      }
      else {
        console.error('Token refresh failed (transient), keeping session:', error)
      }

      return false
    }
  }

  // Single-flight within a tab (_refreshPromise) and across tabs (Web Locks + last-refresh stamp),
  // so concurrent refreshes never race on refresh-token rotation.
  const _runRefresh = (): Promise<boolean> => {
    if (import.meta.client && navigator.locks) {
      return navigator.locks.request('minsik-token-refresh', async () => {
        const last = Number(localStorage.getItem(LAST_REFRESH_KEY) || '0')
        if (user.value && Date.now() - last < REFRESH_DEDUP_MS)
          return true

        const refreshed = await _doRefresh()
        if (refreshed)
          localStorage.setItem(LAST_REFRESH_KEY, Date.now().toString())

        return refreshed
      })
    }

    return _doRefresh()
  }

  function refreshAccessToken(): Promise<boolean> {
    if (_refreshPromise)
      return _refreshPromise

    _refreshPromise = _runRefresh().finally(() => {
      _refreshPromise = null
    })

    return _refreshPromise
  }

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await client.value.post<APIResponse<SessionData>>('/api/v1/auth/login', credentials)
      const data = response.data.data!

      user.value = data.user
      authInitialized.value = true
      scheduleRefresh(data.expires_in)

      return { success: true }
    }
    catch (error: any) {
      console.error('Login failed:', error)

      const errorMessage = apiErrorMessage(error, t, te, 'storeErrors.authLoginFailed')

      return { success: false, error: errorMessage }
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const response = await client.value.post<APIResponse<SessionData>>('/api/v1/auth/register', data)
      const responseData = response.data.data!

      user.value = responseData.user
      authInitialized.value = true
      scheduleRefresh(responseData.expires_in)

      return { success: true }
    }
    catch (error: any) {
      console.error('Registration failed:', error)

      const errorMessage = apiErrorMessage(error, t, te, 'storeErrors.authRegistrationFailed')

      return { success: false, error: errorMessage }
    }
  }

  const googleAuth = async (code: string, redirectUri: string) => {
    try {
      const response = await client.value.post<APIResponse<SessionData>>('/api/v1/auth/google', {
        code,
        redirect_uri: redirectUri,
      } as GoogleAuthRequest)
      const data = response.data.data!

      user.value = data.user
      authInitialized.value = true
      scheduleRefresh(data.expires_in)

      return { success: true }
    }
    catch (error: any) {
      console.error('Google auth failed:', error)

      const errorMessage = apiErrorMessage(error, t, te, 'storeErrors.authGoogleSignInFailed')

      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await client.value.post('/api/v1/auth/logout', {})
    }
    catch { /* silently ignore — clearing state regardless */ }
    finally {
      clearRefreshTimer()
      user.value = null
      authInitialized.value = false
      localStorage.removeItem(LAST_REFRESH_KEY)

      const middleware = route.meta.middleware
      const isProtected = middleware === 'auth' || (Array.isArray(middleware) && middleware.includes('auth'))
      if (isProtected) {
        await router.push(localePath('index'))
      }
    }
  }

  const autoLogin = async () => {
    // autoLogin runs in the browser — relies on httpOnly cookies sent with the refresh request
    if (!import.meta.client)
      return

    if (authInitialized.value)
      return

    // csrf_token is a non-httpOnly marker set alongside the refresh cookie on login/refresh.
    // Its absence means there is no session to resume, so skip the network round-trip entirely.
    if (!readCookie(CSRF_COOKIE)) {
      authInitialized.value = true
      _authReadyResolve?.()

      return
    }

    // The refresh endpoint reads the httpOnly refresh cookie and returns the user.
    // No stored token to read — a missing/expired cookie simply yields an unauthenticated state.
    await refreshAccessToken()

    authInitialized.value = true
    _authReadyResolve?.()
  }

  const waitForAuth = () => _authReadyPromise

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const response = await client.value.put<APIResponse<{ user: User }>>('/api/v1/users/me', data)
      user.value = response.data.data!.user

      return { success: true }
    }
    catch (error: any) {
      console.error('Failed to update profile:', error)

      const errorMessage = apiErrorMessage(error, t, te, 'storeErrors.authProfileUpdateFailed')

      return { success: false, error: errorMessage }
    }
  }

  return {
    user,
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
