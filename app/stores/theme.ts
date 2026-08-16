export const useThemeStore = defineStore('theme', () => {
  type Themes = 'light' | 'dark'

  const colorMode = useColorMode()

  // Mirrors the theme Vuetify has actually applied, written by
  // app/plugins/vuetify.ts at the moment it calls theme.change().
  //
  // Deliberately NOT derived from `colorMode.value`. That flips to the
  // reader's real choice partway through hydration, and Vue does not patch
  // mismatched classes while hydrating a production build — so any component
  // whose markup depends on it (a `:theme` prop, a chip `variant`) renders the
  // server's light value into the DOM and then freezes there, no matter what
  // the state says afterwards. Tracking the applied theme instead means every
  // consumer changes in the same post-hydration tick as Vuetify itself, which
  // is an ordinary reactive update and patches cleanly.
  //
  // 'light' is the correct SSR value: the server pins Vuetify to light so the
  // HTML stays visitor-neutral and swr-cacheable.
  const appliedTheme = ref<Themes>('light')

  const currentTheme = computed<Themes>(() => appliedTheme.value)

  const isDark = computed(() => currentTheme.value === 'dark')

  const setTheme = (theme: Themes) => {
    colorMode.preference = theme
  }

  const toggleTheme = () => {
    setTheme(isDark.value
      ? 'light'
      : 'dark')
  }

  const setAppliedTheme = (theme: Themes) => {
    appliedTheme.value = theme
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    setAppliedTheme,
    toggleTheme,
  }
})
