const STORAGE_KEY = 'minsik_google_oauth_state'

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))

  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

/** A fresh `state` for the Google redirect, remembered for this tab so the callback can check it came back. */
export function createOAuthState(): string {
  const state = randomToken()
  try {
    sessionStorage.setItem(STORAGE_KEY, state)
  }
  catch {
    // Storage blocked: the callback will not be able to confirm the state and sign-in will be refused.
  }

  return state
}

/** True when `received` is the state this tab sent; the stored value is single-use. */
export function consumeOAuthState(received: string | null | undefined): boolean {
  let expected: string | null = null
  try {
    expected = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }
  catch {
    return false
  }

  return Boolean(expected) && received === expected
}
