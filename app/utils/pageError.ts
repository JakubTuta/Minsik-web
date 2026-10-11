interface ErrorWithStatus {
  statusCode?: number
  status?: number
  response?: { status?: number }
  cause?: ErrorWithStatus
}

/** Status of a failed fetch, wherever it sits: a Nuxt error (SSR or hydrated), an axios error, or the cause behind either. */
export function fetchErrorStatus(error: unknown): number | undefined {
  const candidate = error as ErrorWithStatus | null | undefined

  return candidate?.statusCode
    ?? candidate?.response?.status
    ?? candidate?.status
    ?? (candidate?.cause
      ? fetchErrorStatus(candidate.cause)
      : undefined)
}

/**
 * The page error for a failed or empty fetch. Only an API 404 means the page
 * does not exist; an outage must surface as a 5xx so it is retried and never
 * cached or indexed as a missing page.
 */
export function pageErrorProps(
  error: unknown,
  messages: { notFound: string, failed: string },
): { statusCode: number, message: string, fatal: true } {
  const notFound = !error || fetchErrorStatus(error) === 404

  return {
    statusCode: notFound
      ? 404
      : 500,
    message: notFound
      ? messages.notFound
      : messages.failed,
    fatal: true,
  }
}
