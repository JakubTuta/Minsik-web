// Cover/photo URLs come from openlibrary, which serves sized images straight
// from its CDN (-S/-M/-L suffixes). Returning the URL untouched keeps every
// image request on openlibrary's edge instead of funneling it through the
// single-process Bun SSR container (which saturated it and caused 502s).
export function useOptimizedImage() {
  function optimized(src: string | null | undefined, _width: number): string | undefined {
    return src ?? undefined
  }

  return { optimized }
}
