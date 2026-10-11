const ISO_DATE = /^(-?\d{1,4})(?:-(\d{2})(?:-(\d{2}))?)?(?:$|T)/
const FOUR_DIGIT_YEAR = /\b(\d{4})\b/

export interface AuthorDate {
  year: number | null
  month: number | null
  day: number | null
  /** The text as stored; shown when nothing in it can be read as a date. */
  raw: string
}

/**
 * Reads the date forms an author record can hold: ISO (`1952-03-11`, `1952-03`, `1952`,
 * with or without a time) and the free text an admin may type (`c. 1850`). Nothing here goes
 * through `new Date(string)`, which reads ISO dates as UTC and then renders them in the
 * viewer's zone, so the server and the browser could print different days.
 */
export function parseAuthorDate(value: string | null | undefined): AuthorDate | null {
  const raw = value?.trim()
  if (!raw)
    return null

  const iso = ISO_DATE.exec(raw)
  if (iso) {
    const month = iso[2]
      ? Number(iso[2])
      : null
    const day = iso[3]
      ? Number(iso[3])
      : null

    return {
      year: Number(iso[1]),
      month: month && month >= 1 && month <= 12
        ? month
        : null,
      day: month && day && day >= 1 && day <= 31
        ? day
        : null,
      raw,
    }
  }

  const found = FOUR_DIGIT_YEAR.exec(raw)
  const year = found
    ? Number(found[1])
    : null

  return { year, month: null, day: null, raw }
}

function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)

  return date
}

export function formatAuthorDate(date: AuthorDate, locale: string): string {
  if (date.year === null)
    return date.raw

  if (date.month === null)
    return String(date.year)

  if (date.day === null) {
    return utcDate(date.year, date.month, 1)
      .toLocaleDateString(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' })
  }

  return utcDate(date.year, date.month, date.day)
    .toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** Whole years lived, using the finest precision both dates share. Null when it cannot be known. */
export function ageBetween(birth: AuthorDate | null, death: AuthorDate | null, now: Date): number | null {
  if (birth?.year == null)
    return null
  if (death && death.year === null)
    return null

  const end = death ?? {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
  }
  let years = end.year! - birth.year

  if (birth.month !== null && end.month !== null) {
    const birthdayNotYetReached = end.month < birth.month
      || (end.month === birth.month && birth.day !== null && end.day !== null && end.day < birth.day)
    if (birthdayNotYetReached)
      years--
  }

  return years >= 0
    ? years
    : null
}

/** The year, for the "1952–2001" line; null when the date has none. */
export function yearOf(date: AuthorDate | null): number | null {
  return date?.year ?? null
}
