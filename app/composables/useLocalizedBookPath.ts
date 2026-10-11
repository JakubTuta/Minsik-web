import { APP_LOCALES, DEFAULT_LOCALE } from '~~/locales.config'

const SUPPORTED_LOCALES = new Set(APP_LOCALES.map(entry => entry.code))

/**
 * Path of a book page in the language of the edition. An edition in a language the app has no
 * locale for renders at the default locale's URL: `localePath` returns '' for those, which would
 * canonicalise the book to the site root.
 */
export function useLocalizedBookPath() {
  const localePath = useLocalePath()

  return (bookSlug: string, language: string): string => {
    const locale = SUPPORTED_LOCALES.has(language)
      ? language
      : DEFAULT_LOCALE

    // `localePath` is typed to the configured codes; the guard above establishes it.
    return localePath({ name: 'books-slug', params: { slug: bookSlug } }, locale as Parameters<typeof localePath>[1])
  }
}
