import { describe, expect, it } from 'vitest'
import { isbnFromQuery } from '../../app/utils/isbn'

describe('isbnFromQuery', () => {
  it('accepts hyphenated and spaced ISBN-13', () => {
    expect(isbnFromQuery('978-0-306-40615-7')).toBe('9780306406157')
    expect(isbnFromQuery(' 978 0306406157 ')).toBe('9780306406157')
  })

  it('accepts an ISBN-10 with an X check digit, upper-cased', () => {
    expect(isbnFromQuery('0-8044-2957-x')).toBe('080442957X')
  })

  it('leaves ordinary searches alone', () => {
    expect(isbnFromQuery('hobbit')).toBeNull()
    expect(isbnFromQuery('1984')).toBeNull()
    expect(isbnFromQuery('2001 a space odyssey')).toBeNull()
    expect(isbnFromQuery('12345678901')).toBeNull()
  })
})
