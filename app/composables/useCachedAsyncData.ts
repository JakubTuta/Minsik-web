/**
 * `useAsyncData` refetches on every client-side return to a page even though
 * the payload is still in memory. This reuses it for `cause === 'initial'`
 * only — a `watch` re-run or `refresh()` must still hit the network.
 */
export const useCachedAsyncData = createUseAsyncData({
  getCachedData: (key, nuxtApp, ctx) => {
    if (ctx.cause !== 'initial')
      return undefined

    return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
  },
})
