import { APP_LOCALES } from '~~/locales.config'

/**
 * CLDR's canonical category order. `Intl.PluralRules` reports the categories a
 * locale uses but sorts them lexicographically, which is not the order
 * translators write forms in — pinning the order here keeps the mapping from
 * "nth form in the message" to "plural category" stable and explicit.
 */
const CLDR_CATEGORY_ORDER = ['zero', 'one', 'two', 'few', 'many', 'other'] as const

/**
 * Derives a vue-i18n plural rule from the locale's own CLDR data.
 *
 * vue-i18n's default rule is English's (`n === 1 ? 0 : 1`), which silently
 * mangles every language with a different shape — Polish and Russian need
 * three forms, Arabic six, Japanese one. Reading `Intl.PluralRules` instead of
 * hand-maintaining a table per language is what makes adding a locale a matter
 * of dropping in a JSON file and a `locales.config.ts` entry, with nothing
 * here to remember to update.
 *
 * Message forms are written in CLDR order, e.g. Polish
 * `"książka | książki | książek"` for one/few/many. A locale that uses more
 * categories than the message supplies clamps to the last form, so the
 * fraction-only `other` category Polish and Russian carry needs no extra entry.
 */
function cldrPluralRule(locale: string): (choice: number, choicesLength: number) => number {
  const rules = new Intl.PluralRules(locale)
  const used = new Set(rules.resolvedOptions().pluralCategories)
  const categories = CLDR_CATEGORY_ORDER.filter(category => used.has(category))

  return (choice: number, choicesLength: number): number => {
    const index = categories.indexOf(rules.select(choice) as typeof CLDR_CATEGORY_ORDER[number])

    return index === -1 || index >= choicesLength
      ? Math.max(choicesLength - 1, 0)
      : index
  }
}

export default defineI18nConfig(() => ({
  pluralRules: Object.fromEntries(
    APP_LOCALES.map(entry => [entry.code, cldrPluralRule(entry.code)]),
  ),
}))
