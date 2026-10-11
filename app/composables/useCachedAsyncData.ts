// A page revisited within this window is served from memory; after it the data is fetched again,
// so a long-lived tab never shows a catalogue hours out of date.
const MAX_AGE_MS = 5 * 60 * 1000

// When each key's data was last put in place in this browser. Never touched on the server,
// where a module-level map would be shared between requests.
const loadedAt = new Map<string, number>()

/**
 * `useAsyncData` refetches on every client-side return to a page even though
 * the payload is still in memory. This reuses it for `cause === 'initial'`
 * only — a `watch` re-run or `refresh()` must still hit the network — and
 * only while the data is younger than `MAX_AGE_MS`.
 */
export const useCachedAsyncData = createUseAsyncData({
  getCachedData: (key, nuxtApp, ctx) => {
    const cached = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]

    if (import.meta.server) {
      return ctx.cause === 'initial'
        ? cached
        : undefined
    }

    const now = Date.now()
    const loaded = loadedAt.get(key)
    const reusable = ctx.cause === 'initial'
      && cached !== undefined
      // No stamp: the data arrived with the server-rendered page, which is as fresh as the page.
      && (loaded === undefined || now - loaded <= MAX_AGE_MS)

    if (loaded === undefined || !reusable)
      loadedAt.set(key, now)

    return reusable
      ? cached
      : undefined
  },
})
