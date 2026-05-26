const STORAGE_KEY = 'preferred_language'
const COOKIE_NAME = 'pref_lang'
const DEFAULT_LANGUAGE = 'en'

function detectBrowserLanguage(): string {
  if (import.meta.server)
    return DEFAULT_LANGUAGE
  const lang = navigator.language || DEFAULT_LANGUAGE
  return lang.split('-')[0].slice(0, 8)
}

export function useUserLanguage() {
  const authStore = useAuthStore()
  const apiStore = useApiStore()
  const langCookie = useCookie(COOKIE_NAME, { maxAge: 60 * 60 * 24 * 365 })

  const language = computed<string>(() => {
    if (authStore.user?.preferred_language)
      return authStore.user.preferred_language

    if (langCookie.value)
      return langCookie.value

    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored)
        return stored
    }

    return DEFAULT_LANGUAGE
  })

  async function setLanguage(lang: string): Promise<void> {
    langCookie.value = lang

    if (import.meta.client)
      localStorage.setItem(STORAGE_KEY, lang)

    if (authStore.isAuthenticated && authStore.user) {
      try {
        await apiStore.client.patch('/api/v1/users/me', { preferred_language: lang })
        if (authStore.user)
          authStore.user.preferred_language = lang
      }
      catch (err) {
        console.error('Failed to persist language preference:', err)
      }
    }
  }

  async function syncOnLogin(): Promise<void> {
    if (!authStore.user)
      return

    const serverLang = authStore.user.preferred_language || DEFAULT_LANGUAGE

    if (serverLang !== DEFAULT_LANGUAGE)
      return

    const localLang = import.meta.client
      ? localStorage.getItem(STORAGE_KEY)
      : null

    if (localLang && localLang !== DEFAULT_LANGUAGE)
      await setLanguage(localLang)
  }

  function initGuestLanguage(): void {
    if (import.meta.server)
      return

    if (!localStorage.getItem(STORAGE_KEY)) {
      const detected = detectBrowserLanguage()
      localStorage.setItem(STORAGE_KEY, detected)
      langCookie.value = detected
    }
  }

  return {
    language,
    setLanguage,
    syncOnLogin,
    initGuestLanguage,
  }
}
