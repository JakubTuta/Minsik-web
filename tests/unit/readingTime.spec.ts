import { describe, expect, it } from 'vitest'
import { formatReadingTime } from '../../app/utils/readingTime'

describe('formatReadingTime', () => {
  it('returns null when the page count is missing or non-positive', () => {
    expect(formatReadingTime(null)).toBeNull()
    expect(formatReadingTime(undefined)).toBeNull()
    expect(formatReadingTime(0)).toBeNull()
    expect(formatReadingTime(-10)).toBeNull()
  })

  it('stays in minutes below an hour', () => {
    expect(formatReadingTime(45)).toBe('45 min')
  })

  it('drops the minute part on a whole number of hours', () => {
    expect(formatReadingTime(120)).toBe('2h')
  })

  it('reports hours and remaining minutes', () => {
    expect(formatReadingTime(135)).toBe('2h 15min')
  })
})
