import type { AppLocale } from '~~/locales.config'
import { APP_LOCALES } from '~~/locales.config'

/**
 * The one language the app speaks: it drives both the interface copy and the
 * `language` the API is asked for, so a reader never gets Polish books in an
 * English shell or the reverse.
 *
 * `@nuxtjs/i18n` owns the value and persists it in the `pref_lang` cookie.
 * The cookie travels with the SSR request, so the server renders the same
 * locale the client hydrates with — no flash of the wrong language, no
 * hydration mismatch.
 */
export function useUserLanguage() {
  const { locale, setLocale } = useI18n()
  const authStore = useAuthStore()
  const apiStore = useApiStore()

  const language = computed<string>(() => locale.value)

  const availableLocales = computed<AppLocale[]>(() => APP_LOCALES)

  const currentLocale = computed<AppLocale | undefined>(() => APP_LOCALES.find(entry => entry.code === locale.value),
  )

  const isSupported = (code: string): boolean => APP_LOCALES.some(entry => entry.code === code)

  async function persistToAccount(code: string): Promise<void> {
    if (!authStore.isAuthenticated || !authStore.user)
      return

    // PUT, not PATCH: the gateway only exposes PUT /users/me, and every field
    // on it is optional, so sending the language alone is a partial update.
    // A PATCH here 405s, and the catch below would swallow it — leaving the
    // account on its old language and letting syncOnLogin undo the switch on
    // the next sign-in.
    try {
      await apiStore.client.put('/api/v1/users/me', { preferred_language: code })
      authStore.user.preferred_language = code
    }
    catch (error) {
      console.error('Failed to persist language preference:', error)
    }
  }

  async function setLanguage(code: string): Promise<void> {
    if (!isSupported(code) || code === locale.value)
      return

    await setLocale(code)
    await persistToAccount(code)
  }

  /**
   * The account preference wins on sign-in: it is the choice the user made for
   * this account, possibly on another device, and it should beat whatever this
   * browser happened to detect. Switching afterwards persists back to the
   * account, so the two never drift.
   */
  async function syncOnLogin(): Promise<void> {
    const accountLanguage = authStore.user?.preferred_language

    if (!accountLanguage || !isSupported(accountLanguage))
      return

    if (accountLanguage !== locale.value)
      await setLocale(accountLanguage)
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
