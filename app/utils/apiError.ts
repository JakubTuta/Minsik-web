/**
 * Resolves a user-facing message for a failed API call. Prefers a translation
 * keyed by the server's error `code` (`apiErrors.{code}`), falling back to the
 * caller's own key. Never surfaces the server's raw English `message` — this
 * is an English-only backend (see gateway `app.utils.responses`), so its text
 * can't be trusted to match the UI locale.
 *
 * `apiErrors.*` deliberately covers only the codes whose meaning beats the
 * caller's context ("Incorrect email or password" tells the reader more than
 * "Sign-in failed"). Catch-all codes like INTERNAL_ERROR and NOT_FOUND are
 * left unmapped on purpose: the caller's key names the operation that failed,
 * which is the more useful message.
 */
export function apiErrorMessage(
  error: unknown,
  t: (key: string, named?: Record<string, unknown>) => string,
  te: (key: string) => boolean,
  fallbackKey: string,
): string {
  const code = (error as { response?: { data?: { error?: { code?: string } } } })
    ?.response
    ?.data
    ?.error
    ?.code
  const codeKey = code
    ? `apiErrors.${code}`
    : null

  return codeKey && te(codeKey)
    ? t(codeKey)
    : t(fallbackKey)
}
