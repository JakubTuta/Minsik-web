import type { AppLocale } from '~~/locales.config'
import { APP_LOCALES, isSupportedLocale } from '~~/locales.config'

/**
 * Drives both the interface copy and the `language` the API is asked for.
 * `@nuxtjs/i18n` owns the value in the `pref_lang` cookie, which travels with
 * the SSR request — so server and client agree with no flash.
 */
export function useUserLanguage() {
  // `useI18n()` needs a component instance; stores and plugins touch this first.
  const { locale, setLocale } = useNuxtApp().$i18n
  const authStore = useAuthStore()
  const apiStore = useApiStore()

  const language = computed<string>(() => locale.value)

  const availableLocales = computed<AppLocale[]>(() => APP_LOCALES)

  const currentLocale = computed<AppLocale | undefined>(() => APP_LOCALES.find(entry => entry.code === locale.value),
  )

  const isSupported = isSupportedLocale

  async function persistToAccount(code: string): Promise<void> {
    if (!authStore.isAuthenticated || !authStore.user)
      return

    // PUT, not PATCH: the gateway only exposes PUT /users/me (a PATCH 405s, and
    // the catch below would swallow it).
    try {
      await apiStore.client.put('/api/v1/users/me', { preferred_language: code })
      authStore.user.preferred_language = code
    }
    catch (error) {
      console.error('Failed to persist language preference:', error)
    }
  }

  // `setLocale` is typed against the literal union of configured codes, which a
  // runtime string can only be narrowed into by the guard above.
  type LocaleCode = Parameters<typeof setLocale>[0]

  async function setLanguage(code: string): Promise<void> {
    if (!isSupported(code) || code === locale.value)
      return

    await setLocale(code as LocaleCode)
    await persistToAccount(code)
  }

  // The account preference wins on sign-in — it may have been set on another
  // device; switching afterwards persists back, so the two never drift.
  async function syncOnLogin(): Promise<void> {
    const accountLanguage = authStore.user?.preferred_language

    if (!accountLanguage || !isSupported(accountLanguage))
      return

    if (accountLanguage !== locale.value)
      await setLocale(accountLanguage as LocaleCode)
  }

  return {
    language,
    availableLocales,
    currentLocale,
    isSupported,
    setLanguage,
    syncOnLogin,
  }
}
