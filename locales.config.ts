/**
 * Single source of truth for the languages the app ships.
 *
 * To add a language: drop `i18n/locales/<code>.json` next to `en.json`, add an
 * entry here, and add the same code to the server's AVAILABLE_LANGUAGES. That
 * is the whole list — everything else reads this one:
 *
 * - app bar switcher and the i18n module (locales, routing, `pref_lang`)
 * - locale-prefixed `routeRules` (nuxt.config.ts)
 * - plural rules, derived from CLDR per locale (i18n/i18n.config.ts)
 * - Vuetify's own component strings (app/plugins/vuetify.ts)
 * - which book editions may be linked or advertised (app/stores/books.ts)
 * - the root locale redirect (server/middleware/root-locale-redirect.ts)
 *
 * Server-side, AVAILABLE_LANGUAGES likewise drives language resolution, the
 * per-language Elasticsearch analyzers, and edition preference.
 *
 * Write pluralised messages in CLDR order (one, few, many, ...) rather than
 * English's two forms; see i18n/i18n.config.ts.
 */
export interface AppLocale {
  /** BCP 47 code, also sent to the API as the content language. */
  code: string
  /** Full tag for the `lang` attribute and `Accept-Language` matching. */
  language: string
  /** Endonym — shown in the switcher, always in its own language. */
  name: string
  /** Translation file inside `i18n/locales/`. */
  file: string
}

export const APP_LOCALES: AppLocale[] = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
]

export const DEFAULT_LOCALE = 'en'

export function isSupportedLocale(code: string): boolean {
  return APP_LOCALES.some(entry => entry.code === code)
}
