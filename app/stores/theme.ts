export const useThemeStore = defineStore('theme', () => {
  type Themes = 'light' | 'dark'

  const colorMode = useColorMode()

  const currentTheme = computed<Themes>(() => (colorMode.value === 'dark'
    ? 'dark'
    : 'light'))

  const isDark = computed(() => currentTheme.value === 'dark')

  const setTheme = (theme: Themes) => {
    colorMode.preference = theme
  }

  const toggleTheme = () => {
    setTheme(isDark.value
      ? 'light'
      : 'dark')
  }

  // Kept for callers that used to gate on this; @nuxtjs/color-mode
  // resolves the correct theme before hydration, so there's nothing to init.
  const initialize = () => {}

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    initialize,
  }
})
