import { describe, expect, it } from 'vitest'
import { apiErrorMessage } from '../../app/utils/apiError'

const t = (key: string) => `t:${key}`

describe('apiErrorMessage', () => {
  it('prefers a translation keyed by the server error code', () => {
    const error = { response: { data: { error: { code: 'INVALID_CREDENTIALS' } } } }

    expect(apiErrorMessage(error, t, key => key === 'apiErrors.INVALID_CREDENTIALS', 'auth.signInFailed'))
      .toBe('t:apiErrors.INVALID_CREDENTIALS')
  })

  it('falls back to the caller key when the code has no translation', () => {
    const error = { response: { data: { error: { code: 'INTERNAL_ERROR' } } } }

    expect(apiErrorMessage(error, t, () => false, 'auth.signInFailed')).toBe('t:auth.signInFailed')
  })

  it('falls back when the error carries no code at all', () => {
    expect(apiErrorMessage(new Error('network'), t, () => true, 'auth.signInFailed'))
      .toBe('t:auth.signInFailed')
  })
})
