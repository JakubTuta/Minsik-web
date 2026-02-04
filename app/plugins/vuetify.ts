import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    ssr: true,
    theme: {
      defaultTheme: 'light', // Always start with light for SSR to avoid hydration mismatch
      themes: {
        light: {
          dark: false,
          colors: {
            // Base colors - cream/peachy tones
            'background': '#FFF5ED',
            'surface': '#FFF9F5',
            'surface-bright': '#FFFCFA',
            'surface-variant': '#FFEEE0',

            // Primary colors - lighter warm coral/peach
            'primary': '#FFB094',
            'primary-darken-1': '#FF9B71',
            'primary-darken-2': '#FF8557',
            'primary-lighten-1': '#FFC5AD',
            'primary-lighten-2': '#FFDAC6',

            // Secondary colors - lighter secondary coral
            'secondary': '#FF9B77',
            'secondary-darken-1': '#E8805C',
            'secondary-darken-2': '#D46942',
            'secondary-lighten-1': '#FFB08C',
            'secondary-lighten-2': '#FFC5A7',

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
            'on-primary': '#FFFFFF',
            'on-secondary': '#FFFFFF',
            'on-background': '#2C2420',
            'on-surface': '#2C2420',
            'on-surface-variant': '#6B5D56',

            // Borders and dividers
            'border': '#FFE5D6',
            'divider': '#FFEEE0',

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

            // Secondary colors - secondary orange
            'secondary': '#CC6F3A',
            'secondary-darken-1': '#B35F2E',
            'secondary-darken-2': '#994F22',
            'secondary-lighten-1': '#E08554',
            'secondary-lighten-2': '#F39B6E',

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
            'on-primary': '#1A2332',
            'on-secondary': '#F8FAFB',
            'on-background': '#F8FAFB',
            'on-surface': '#F8FAFB',
            'on-surface-variant': '#B8C5D6',

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
    },
    display: {
      mobileBreakpoint: 'sm',
    },
  })
  app.vueApp.use(vuetify)

  if (import.meta.client) {
    const themeStore = useThemeStore()

    watch(() => themeStore.currentTheme, (newTheme) => {
      vuetify.theme.change(newTheme)
    }, { immediate: true })
  }
})
