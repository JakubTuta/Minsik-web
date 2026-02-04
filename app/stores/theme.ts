export const useThemeStore = defineStore('theme', () => {
  type Themes = 'light' | 'dark'

  const clientTheme = ref<Themes>('light')
  const isInitialized = ref(false)

  const setTheme = (theme: Themes) => {
    clientTheme.value = theme

    if (import.meta.client) {
      const html = document.documentElement

      html.setAttribute('data-theme', theme)

      html.classList.remove('light-mode', 'dark-mode')
      html.classList.add(`${theme}-mode`)

      localStorage.setItem('tuta-theme', theme)
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

  const getTheme = () => {
    return clientTheme.value
  }

  const initialize = () => {
    if (isInitialized.value)
      return

    if (import.meta.client) {
      const localTheme = localStorage.getItem('tuta-theme')
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
    getTheme,
    initialize,
    isInitialized,
  }
})
