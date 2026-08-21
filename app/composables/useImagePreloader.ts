// Warms the same URLs the cards will request. Preloading the raw OpenLibrary
// address instead would leave the proxied one the components actually use cold.
export function useImagePreloader() {
  const { coverUrl } = useCoverUrl()

  function preloadImages(
    urls: (string | null | undefined)[],
    renderedWidth = 240,
    timeoutMs = 5000,
  ): Promise<void> {
    const validUrls = urls
      .map(url => coverUrl(url, renderedWidth))
      .filter(Boolean) as string[]

    if (validUrls.length === 0)
      return Promise.resolve()

    const loadImage = (url: string): Promise<void> => new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = url
    })

    return Promise.race([
      Promise.allSettled(validUrls.map(loadImage)).then(() => {}),
      new Promise<void>(resolve => setTimeout(resolve, timeoutMs)),
    ])
  }

  return { preloadImages }
}
