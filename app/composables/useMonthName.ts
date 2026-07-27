/**
 * Localized month name (1-12), derived from the interface locale instead of a
 * hardcoded English array — stays correct for any language added later with no
 * extra translation keys to maintain.
 */
export function useMonthName() {
  const { locale } = useI18n()

  function monthName(monthNumber: number, style: 'long' | 'short' = 'long'): string {
    const formatter = new Intl.DateTimeFormat(locale.value, { month: style })

    return formatter.format(new Date(2000, monthNumber - 1, 1))
  }

  return { monthName }
}
