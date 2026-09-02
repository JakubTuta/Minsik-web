import { describe, expect, it } from 'vitest'
import { serializeQueryParams } from '../../shared/utils/queryParams'

describe('serializeQueryParams', () => {
  it('repeats the key for array values instead of bracketing or joining', () => {
    expect(serializeQueryParams({ languages: ['en', 'pl'] })).toBe('languages=en&languages=pl')
  })

  it('drops null and undefined but keeps falsy scalars', () => {
    expect(serializeQueryParams({ a: null, b: undefined, c: 0, d: false })).toBe('c=0&d=false')
  })

  it('encodes reserved characters', () => {
    expect(serializeQueryParams({ q: 'a b&c' })).toBe('q=a+b%26c')
  })

  it('returns an empty string for no params', () => {
    expect(serializeQueryParams({})).toBe('')
  })
})
