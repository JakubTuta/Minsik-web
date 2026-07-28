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
 * One file does NOT read this list and has to be edited by hand:
 * `public/robots.txt`, where every private path needs a copy under the new
 * language's prefix.
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
  { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
  { code: 'pl', language: 'pl-PL', name: 'Polski', file: 'pl.json' },
  { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
  { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
  { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
]

export const DEFAULT_LOCALE = 'en'

export function isSupportedLocale(code: string): boolean {
  return APP_LOCALES.some(entry => entry.code === code)
}

/**
 * Flag image URL for a locale's app-bar switcher entry, built from the region
 * subtag of `language` (e.g. `en-US` -> `US`) so a new locale needs no flag
 * asset of its own here — only a correctly regioned `language` tag.
 *
 * Served from flagcdn.com rather than a regional-indicator emoji: Windows has
 * no colour glyphs for those and renders the raw letters instead.
 */
export function localeFlagUrl(locale: AppLocale): string | undefined {
  const region = locale.language.split('-')[1]

  return region && region.length === 2
    ? `https://flagcdn.com/${region.toLowerCase()}.svg`
    : undefined
}
