import { describe, expect, it } from 'vitest'
import { fetchErrorStatus, pageErrorProps } from '../../app/utils/pageError'

const messages = { notFound: 'missing', failed: 'broken' }

describe('fetchErrorStatus', () => {
  it('reads a Nuxt error status code', () => {
    expect(fetchErrorStatus({ statusCode: 404 })).toBe(404)
  })

  it('reads an axios error response status', () => {
    expect(fetchErrorStatus({ response: { status: 503 } })).toBe(503)
  })

  it('walks down to the cause behind a wrapped error', () => {
    expect(fetchErrorStatus({ cause: { response: { status: 404 } } })).toBe(404)
  })

  it('is undefined for a network error', () => {
    expect(fetchErrorStatus(new Error('socket hang up'))).toBeUndefined()
  })
})

describe('pageErrorProps', () => {
  it('maps an API 404 to a not-found page', () => {
    expect(pageErrorProps({ response: { status: 404 } }, messages))
      .toEqual({ statusCode: 404, message: 'missing', fatal: true })
  })

  it('maps an empty payload without an error to not found', () => {
    expect(pageErrorProps(undefined, messages).statusCode).toBe(404)
  })

  it('does not pass an outage off as a missing page', () => {
    expect(pageErrorProps({ response: { status: 502 } }, messages))
      .toEqual({ statusCode: 500, message: 'broken', fatal: true })
    expect(pageErrorProps(new Error('timeout'), messages).statusCode).toBe(500)
  })
})
