/**
 * Serialize params the way the API reads them: an array becomes the same key
 * repeated, not `key[]` or a comma-joined string, which is what FastAPI's
 * `Query(default=[])` binds to. Shared because both the app's axios client and
 * the sitemap server route talk to the same endpoints.
 */
export function serializeQueryParams(params: Record<string, unknown>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value))
      value.forEach(entry => search.append(key, String(entry)))
    else if (value !== null && value !== undefined)
      search.append(key, String(value))
  }

  return search.toString()
}
