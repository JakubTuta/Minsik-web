import { describe, expect, it } from 'vitest'
import { ageBetween, formatAuthorDate, parseAuthorDate } from '../../app/utils/authorDates'

describe('parseAuthorDate', () => {
  it('reads ISO dates at any precision', () => {
    expect(parseAuthorDate('1892-01-03')).toMatchObject({ year: 1892, month: 1, day: 3 })
    expect(parseAuthorDate('1892-01')).toMatchObject({ year: 1892, month: 1, day: null })
    expect(parseAuthorDate('1892')).toMatchObject({ year: 1892, month: null, day: null })
    expect(parseAuthorDate('1892-01-03T00:00:00')).toMatchObject({ year: 1892, month: 1, day: 3 })
  })

  it('takes a year out of free text and keeps the text', () => {
    expect(parseAuthorDate('c. 1850')).toMatchObject({ year: 1850, month: null, raw: 'c. 1850' })
    expect(parseAuthorDate('unknown')).toMatchObject({ year: null, raw: 'unknown' })
  })

  it('treats empty values as missing', () => {
    expect(parseAuthorDate(null)).toBeNull()
    expect(parseAuthorDate('  ')).toBeNull()
  })

  it('ignores an impossible month rather than rendering a wrong date', () => {
    expect(parseAuthorDate('1892-13-40')).toMatchObject({ year: 1892, month: null, day: null })
  })
})

describe('formatAuthorDate', () => {
  it('prints the calendar day that is stored, whatever zone the viewer is in', () => {
    const text = formatAuthorDate(parseAuthorDate('1892-01-03')!, 'en')

    expect(text).toContain('3')
    expect(text).toContain('1892')
    expect(text).toContain('Jan')
  })

  it('prints only what is known', () => {
    expect(formatAuthorDate(parseAuthorDate('1892')!, 'en')).toBe('1892')
    expect(formatAuthorDate(parseAuthorDate('unknown')!, 'en')).toBe('unknown')
  })
})

describe('ageBetween', () => {
  const now = new Date(Date.UTC(2026, 5, 15))

  it('counts a birthday that has not happened yet this year', () => {
    expect(ageBetween(parseAuthorDate('1990-06-16'), null, now)).toBe(35)
    expect(ageBetween(parseAuthorDate('1990-06-15'), null, now)).toBe(36)
  })

  it('uses the death date for people who died', () => {
    expect(ageBetween(parseAuthorDate('1892-01-03'), parseAuthorDate('1973-09-02'), now)).toBe(81)
  })

  it('falls back to whole years when only years are known', () => {
    expect(ageBetween(parseAuthorDate('1850'), parseAuthorDate('1910'), now)).toBe(60)
  })

  it('is unknown without a birth year, or with an unreadable death date', () => {
    expect(ageBetween(null, null, now)).toBeNull()
    expect(ageBetween(parseAuthorDate('unknown'), null, now)).toBeNull()
    expect(ageBetween(parseAuthorDate('1850'), parseAuthorDate('died young'), now)).toBeNull()
  })
})
