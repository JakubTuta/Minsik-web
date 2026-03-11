export function useImagePreloader() {
  function preloadImages(urls: (string | null | undefined)[], timeoutMs = 5000): Promise<void> {
    const validUrls = urls.filter(Boolean) as string[]
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
