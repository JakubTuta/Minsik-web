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

    watch(() => themeStore.currentTheme, (newTheme) => {
      vuetify.theme.change(newTheme)
    }, { immediate: true })
  }
})
