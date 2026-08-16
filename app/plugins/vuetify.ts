import type { Composer } from 'vue-i18n'
import type { IconProps, IconSet } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { de, en, es, fr, pl } from 'vuetify/locale'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { mdiIconMap } from '~/utils/mdiIcons'

// Named imports, one per app locale — `import * as` from 'vuetify/locale'
// pulls in all 43 shipped language packs (~115KB) because Rollup can't tell
// which keys a dynamic index will touch. These re-exports are static, so
// only the five actually referenced below survive tree-shaking. Keep this
// list in sync with locales.config.ts's APP_LOCALES by hand — it can't
// import that list and stay statically analyzable.
const VUETIFY_LOCALE_PACKS: Record<string, Record<string, unknown>> = { en, pl, de, es, fr }

// Resolves "mdi-*" name strings to @mdi/js SVG paths so the 400KB+ icon font is not needed
const mdiSvg: IconSet = {
  component: (props: IconProps) => h(mdi.component, {
    ...props,
    icon: mdiIconMap[props.icon as string] ?? props.icon,
  }),
}

export default defineNuxtPlugin((app) => {
  const colorMode = useColorMode()

  // Always 'light', regardless of the reader's cookie. SSR HTML must be
  // visitor-independent so `/` and friends can be swr-cached (see
  // nuxt.config.ts routeRules) — deriving this from colorMode.preference
  // would stamp a per-visitor theme into the cached snapshot and serve
  // whoever rendered it first to everyone after them. Vuetify compiles both
  // `.v-theme--light` and `.v-theme--dark` rule blocks into the one
  // stylesheet either way; @nuxtjs/color-mode's pre-paint inline script sets
  // the class on <html> before first paint, so a dark-mode reader still gets
  // correct dark chrome with no flash — this only fixes which theme's colors
  // Vuetify computes for `rgb(var(--v-theme-*))` usages during SSR. The
  // client watcher below then performs a real theme.change() on boot for
  // 'system'/'dark' readers, which is what keeps the runtime stylesheet
  // correct for them.
  const initialTheme = 'light'

  // Vuetify ships its own translations for internal component strings ("No
  // data available", pagination, etc.) — separate from our en.json. Merge
  // whichever of its locale packs match our configured locales into the
  // shared i18n instance so adding a language here needs no Vuetify-specific
  // code, only a locales.config.ts entry whose code Vuetify also ships.
  const i18n = app.$i18n as unknown as Composer
  for (const [code, vuetifyMessages] of Object.entries(VUETIFY_LOCALE_PACKS))
    i18n.mergeLocaleMessage(code, { $vuetify: vuetifyMessages })

  const vuetify = createVuetify({
    ssr: true,
    locale: {
      adapter: createVueI18nAdapter({ i18n: { global: i18n }, useI18n }),
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi: mdiSvg,
      },
    },
    theme: {
      defaultTheme: initialTheme,
      themes: {
        light: {
          dark: false,
          colors: {
            // Base colors - cream/peachy tones
            'background': '#FAEBD7',
            'surface': '#FFF3E6',
            'surface-bright': '#FFF8F0',
            'surface-variant': '#F5E6D3',

            // Primary colors - lighter warm coral/peach
            'primary': '#FFB094',
            'primary-darken-1': '#FF9B71',
            'primary-darken-2': '#FF8557',
            'primary-lighten-1': '#FFC5AD',
            'primary-lighten-2': '#FFDAC6',

            // Secondary colors - light cyan/sky blue
            'secondary': '#70CDEB',
            'secondary-darken-1': '#5BC0E0',
            'secondary-darken-2': '#45B3D5',
            'secondary-lighten-1': '#8DD8F0',
            'secondary-lighten-2': '#AAE3F5',

            // Status colors
            'success': '#7BA882',
            'success-darken-1': '#689571',
            'success-lighten-1': '#95BDA0',

            'info': '#5B8AAF',
            'info-darken-1': '#4A7395',
            'info-lighten-1': '#7BA3C4',

            'warning': '#F4A261',
            'warning-darken-1': '#E08E47',
            'warning-lighten-1': '#F7B67D',

            'error': '#E76F51',
            'error-darken-1': '#D35940',
            'error-lighten-1': '#ED8A71',

            // Text colors
            'onPrimary': '#FFFFFF',
            'onSecondary': '#FFFFFF',
            'onBackground': '#2C2420',
            'onSurface': '#2C2420',
            'onSurfaceVariant': '#6B5D56',

            // Borders and dividers
            'border': '#F0DCC8',
            'divider': '#F5E6D3',

            // Custom named colors
            'text-primary': '#2C2420',
            'text-secondary': '#6B5D56',
            'text-disabled': '#A39790',
          },
        },
        dark: {
          dark: true,
          colors: {
            // Base colors
            'background': '#1A2332',
            'surface': '#243447',
            'surface-bright': '#2D3F56',
            'surface-variant': '#1E2C3D',

            // Primary colors - bright coral/orange
            'primary': '#FF9557',
            'primary-darken-1': '#E6803D',
            'primary-darken-2': '#CC6F3A',
            'primary-lighten-1': '#FFAA71',
            'primary-lighten-2': '#FFBF8C',

            // Secondary colors - light cyan/sky blue
            'secondary': '#ACEAFF',
            'secondary-darken-1': '#94E3FF',
            'secondary-darken-2': '#7CD9FF',
            'secondary-lighten-1': '#C4F1FF',
            'secondary-lighten-2': '#DCF7FF',

            // Accent
            'accent': '#5B8AAF',
            'accent-darken-1': '#4A7395',
            'accent-lighten-1': '#7BA3C4',

            // Status colors
            'success': '#6BA88A',
            'success-darken-1': '#5A9177',
            'success-lighten-1': '#85BBA0',

            'info': '#6B9EC9',
            'info-darken-1': '#5788B0',
            'info-lighten-1': '#87B4D8',

            'warning': '#F4A261',
            'warning-darken-1': '#DB8E4C',
            'warning-lighten-1': '#F7B67D',

            'error': '#E76F51',
            'error-darken-1': '#CE5D42',
            'error-lighten-1': '#ED8A71',

            // Text colors
            'onPrimary': '#1A2332',
            'onSecondary': '#F8FAFB',
            'onBackground': '#F8FAFB',
            'onSurface': '#F8FAFB',
            'onSurfaceVariant': '#B8C5D6',

            // Borders and dividers
            'border': '#344256',
            'divider': '#2A3847',

            // Custom named colors
            'text-primary': '#F8FAFB',
            'text-secondary': '#B8C5D6',
            'text-disabled': '#7A8998',
          },
        },
      },
    },
    defaults: {
      VTextField: {
        variant: 'outlined',
        rounded: 'xl',
      },
      VAutocomplete: {
        variant: 'outlined',
        rounded: 'xl',
      },
      VSelect: {
        variant: 'outlined',
        rounded: 'xl',
      },
      VBtn: {
        variant: 'outlined',
        rounded: 'xl',
      },
      VContainer: {
        style: 'max-width: 1200px',
      },
      VCard: {
        rounded: 'xl',
        width: '100%',
      },
      VTab: {
        rounded: 'xl',
      },
      VListItem: {
        rounded: 'xl',
      },
      VAlert: {
        variant: 'tonal',
        rounded: 'xl',
      },
      VTooltip: {
        bgColor: 'onBackground',
        contentClass: 'text-onBackground',
      },
    },
    display: {
      mobileBreakpoint: 'sm',
    },
  })
  app.vueApp.use(vuetify)

  if (import.meta.client) {
    const themeStore = useThemeStore()

    const syncVuetifyTheme = () => {
      const next = colorMode.value === 'dark'
        ? 'dark'
        : 'light'

      vuetify.theme.change(next)
      // Keeps the store's `isDark`/`currentTheme` in lockstep with what
      // Vuetify actually applied, so components reading them flip in the same
      // tick as Vuetify's own classes rather than mid-hydration.
      themeStore.setAppliedTheme(next)
    }

    // This timing is load-bearing. `initialTheme` is pinned light so the SSR
    // HTML stays visitor-neutral and cacheable, so the client's first render
    // has to agree with it: Vue does not patch mismatched classes while
    // hydrating a production build. Change the theme any earlier and Vuetify
    // rewrites the :root variables to dark while the `v-theme--light` class it
    // stamps on every component stays frozen at the server's value — light
    // components on a dark page canvas, which only rights itself on the next
    // unrelated re-render.
    //
    // `app:mounted` is NOT early enough to be safe here: nuxt-root wraps the
    // app in <Suspense>, so it fires when the root mounts, while the suspended
    // page subtree is still hydrating. `app:suspense:resolve` is the hook
    // deferHydration() calls once `isHydrating` goes false, which is the real
    // all-clear — after it, a theme change is an ordinary reactive update and
    // every one of those classes patches.
    watch(() => colorMode.value, () => {
      if (!app.isHydrating)
        syncVuetifyTheme()
    })

    app.hook('app:suspense:resolve', syncVuetifyTheme)
  }
})
