/**
 * `useAsyncData` with no `getCachedData` refetches on every client-side
 * navigation back to a page, even though the payload from the last time it
 * was fetched is still sitting in memory. This variant reuses it — but only
 * for `cause === 'initial'` (re-mounting a page whose key hasn't changed).
 * A `watch`-triggered re-run (e.g. `{ watch: [language] }`) or an explicit
 * `refresh()`/`force` call must still hit the network: those exist
 * specifically because the answer may have changed, and the key alone
 * (typically a slug, not a language) doesn't reflect that.
 */
export const useCachedAsyncData = createUseAsyncData({
  getCachedData: (key, nuxtApp, ctx) => {
    if (ctx.cause !== 'initial')
      return undefined

    return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
  },
})
