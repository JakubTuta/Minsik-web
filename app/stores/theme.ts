export const useThemeStore = defineStore('theme', () => {
  type Themes = 'light' | 'dark'

  const colorMode = useColorMode()

  // Resolved the same way as app/plugins/vuetify.ts, so store-driven markup
  // and Vuetify's own theme can never disagree. `colorMode.value` is the
  // literal unresolved string "system" during SSR — only `preference` carries
  // the persisted choice there — so reading `value` alone pinned every server
  // render to the light branch even once Vuetify itself rendered dark.
  const currentTheme = computed<Themes>(() => {
    if (colorMode.value === 'dark' || colorMode.value === 'light')
      return colorMode.value

    return colorMode.preference === 'dark'
      ? 'dark'
      : 'light'
  })

  const isDark = computed(() => currentTheme.value === 'dark')

  const setTheme = (theme: Themes) => {
    colorMode.preference = theme
  }

  const toggleTheme = () => {
    setTheme(isDark.value
      ? 'light'
      : 'dark')
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
  }
})
