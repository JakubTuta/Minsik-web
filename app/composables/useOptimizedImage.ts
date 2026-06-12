// Builds IPX-optimized URLs (resized WebP) for remote covers and photos.
// Falls back to the original URL for anything IPX cannot proxy.
export function useOptimizedImage() {
  const img = useImage()

  function optimized(src: string | null | undefined, width: number): string | undefined {
    if (!src)
      return undefined

    if (!src.startsWith('http'))
      return src

    try {
      return img(src, { width, format: 'webp' })
    }
    catch {
      return src
    }
  }

  return { optimized }
}
