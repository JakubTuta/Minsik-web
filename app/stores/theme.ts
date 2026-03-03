export const useThemeStore = defineStore('theme', () => {
  type Themes = 'light' | 'dark'

  const clientTheme = ref<Themes>('light')
  const isInitialized = ref(false)

  const THEME_KEY = 'minsik-theme'
  const LEGACY_THEME_KEY = 'tuta-theme'

  const setTheme = (theme: Themes) => {
    clientTheme.value = theme

    if (import.meta.client) {
      const html = document.documentElement

      html.setAttribute('data-theme', theme)

      html.classList.remove('light-mode', 'dark-mode')
      html.classList.add(`${theme}-mode`)

      localStorage.setItem(THEME_KEY, theme)
    }
  }

  const toggleTheme = () => {
    const newTheme = clientTheme.value === 'dark'
      ? 'light'
      : 'dark'
    setTheme(newTheme)
  }

  const isDark = computed(() => clientTheme.value === 'dark')

  const currentTheme = computed(() => clientTheme.value)

  const initialize = () => {
    if (isInitialized.value)
      return

    if (import.meta.client) {
      // Migrate from legacy key if present
      const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY)
      if (legacyTheme) {
        localStorage.setItem(THEME_KEY, legacyTheme)
        localStorage.removeItem(LEGACY_THEME_KEY)
      }

      const localTheme = localStorage.getItem(THEME_KEY)
      const savedTheme: Themes = (localTheme === 'dark' || localTheme === 'light')
        ? localTheme as Themes
        : 'light'

      setTheme(savedTheme)
      isInitialized.value = true
    }
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    initialize,
    isInitialized,
  }
})
