import { describe, expect, it } from 'vitest'
import { coverColor, hashColor } from '../../app/utils/coverColor'

describe('hashColor', () => {
  it('returns a hex colour', () => {
    expect(hashColor('Neuromancer')).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('is deterministic for the same input', () => {
    expect(hashColor('Neuromancer')).toBe(hashColor('Neuromancer'))
  })

  it('separates different inputs', () => {
    expect(hashColor('Neuromancer')).not.toBe(hashColor('Count Zero'))
  })

  it('ignores empty parts so a missing author does not shift the colour', () => {
    expect(hashColor('Neuromancer', null, undefined)).toBe(hashColor('Neuromancer'))
  })

  it('falls back to a fixed key when every part is empty', () => {
    expect(hashColor(null, undefined)).toBe(hashColor(''))
  })
})

describe('coverColor', () => {
  it('reads the author from either shape', () => {
    expect(coverColor({ title: 'Neuromancer', author_name: 'William Gibson' }))
      .toBe(coverColor({ title: 'Neuromancer', authors: [{ name: 'William Gibson' }] }))
  })

  it('reads the series from either shape', () => {
    expect(coverColor({ title: 'Neuromancer', series_name: 'Sprawl' }))
      .toBe(coverColor({ title: 'Neuromancer', series: { name: 'Sprawl' } }))
  })

  it('hashes the extra parts alone when there is no source', () => {
    expect(coverColor(null, 'fallback')).toBe(hashColor('fallback'))
  })
})
