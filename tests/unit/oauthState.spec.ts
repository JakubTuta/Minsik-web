import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consumeOAuthState, createOAuthState } from '../../app/utils/oauthState'

function stubSessionStorage() {
  const store = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  })
}

describe('oauth state', () => {
  beforeEach(stubSessionStorage)

  it('accepts the state that was sent, once', () => {
    const state = createOAuthState()

    expect(state).toMatch(/^[0-9a-f]{32}$/)
    expect(consumeOAuthState(state)).toBe(true)
    expect(consumeOAuthState(state)).toBe(false)
  })

  it('rejects a different or missing state', () => {
    createOAuthState()

    expect(consumeOAuthState('forged')).toBe(false)
    createOAuthState()
    expect(consumeOAuthState(undefined)).toBe(false)
  })

  it('rejects when nothing was ever sent from this tab', () => {
    expect(consumeOAuthState('anything')).toBe(false)
  })

  it('does not throw when storage is blocked', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })

    expect(() => createOAuthState()).not.toThrow()
    expect(consumeOAuthState('x')).toBe(false)
  })
})
