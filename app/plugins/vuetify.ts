import type { Composer } from 'vue-i18n'
import type { IconProps, IconSet } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { de, en, es, fr, pl } from 'vuetify/locale'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { mdiIconMap } from '~/utils/mdiIcons'

// Named imports, not `import * as`: only the five referenced here survive
// tree-shaking, the wildcard pulls all 43 packs (~115KB). Keep in sync with
// APP_LOCALES by hand — importing that list would defeat the analysis.
const VUETIFY_LOCALE_PACKS: Record<string, Record<string, unknown>> = { en, pl, de, es, fr }

// Resolves "mdi-*" name strings to @mdi/js SVG paths so the 400KB+ icon font is not needed
const mdiSvg: IconSet = {
  component: (props: IconProps) => h(mdi.component, {
    ...props,
    icon: mdiIconMap[props.icon as string] ?? props.icon,
  }),
}

const LIGHT_INK = '#2C2420'
const LIGHT_INK_MUTED = '#6B5D56'
const DARK_INK = '#F8FAFB'
const DARK_INK_MUTED = '#B8C5D6'
const DARK_BASE = '#1A2332'

export default defineNuxtPlugin((app) => {
  const colorMode = useColorMode()

  // Pinned light so the SSR HTML stays visitor-neutral and swr-cacheable.
  // Vuetify compiles both theme blocks into the one stylesheet and color-mode's
  // pre-paint script sets the html class, so dark readers get correct chrome
  // with no flash; the client watcher below does the real theme.change().
  const initialTheme = 'light'

  // Vuetify's own component strings, merged into the shared i18n instance so a
  // new language needs only a locales.config.ts entry.
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

            /*
             * Kebab `on-<key>` is the foreground Vuetify paints when something
             * asks for that background; anything Vuetify cannot pair it guesses
             * by contrast, and for `surface-variant` it guessed from its own
             * stock #424242 surface and printed #EEE on our cream one.
             */
            'on-background': LIGHT_INK,
            'on-surface': LIGHT_INK,
            'on-surface-variant': LIGHT_INK,
            'on-primary': LIGHT_INK,
            'on-secondary': LIGHT_INK,

            // Standalone colors, not pairs — these are what `text-*`/`bg-*`
            // utilities are generated from (`on-*` keys get no utility class).
            'onBackground': LIGHT_INK,
            'onSurface': LIGHT_INK,

            // Borders and dividers
            'border': '#F0DCC8',
            'divider': '#F5E6D3',

            // Custom named colors
            'text-primary': LIGHT_INK,
            'text-secondary': LIGHT_INK_MUTED,
            'text-disabled': '#A39790',
          },
        },
        dark: {
          dark: true,
          colors: {
            // Base colors
            'background': DARK_BASE,
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

            // Pairs — see the note in the light theme
            'on-background': DARK_INK,
            'on-surface': DARK_INK,
            'on-surface-variant': DARK_INK,
            'on-primary': DARK_BASE,
            'on-secondary': DARK_BASE,

            // Standalone colors behind `text-*`/`bg-*`
            'onBackground': DARK_INK,
            'onSurface': DARK_INK,

            // Borders and dividers
            'border': '#344256',
            'divider': '#2A3847',

            // Custom named colors
            'text-primary': DARK_INK,
            'text-secondary': DARK_INK_MUTED,
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
      themeStore.setAppliedTheme(next)
    }

    // Timing is load-bearing: changing the theme before hydration finishes
    // rewrites the :root variables while the `v-theme--light` class Vuetify
    // stamped on every component stays frozen at the server's value. Vue does
    // not patch mismatched classes when hydrating a production build.
    // `app:suspense:resolve`, not `app:mounted` — the latter fires while the
    // suspended page subtree is still hydrating.
    watch(() => colorMode.value, () => {
      if (!app.isHydrating)
        syncVuetifyTheme()
    })

    app.hook('app:suspense:resolve', syncVuetifyTheme)
  }
})
