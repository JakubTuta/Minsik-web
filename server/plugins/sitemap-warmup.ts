// Warms the sitemap URLs cache at boot. The harvest can exceed Bun's 10s request
// timeout, so populating the cache in the background keeps /sitemap.xml fast
// from the first external request.
export default defineNitroPlugin(() => {
  setTimeout(() => {
    $fetch('/api/__sitemap__/urls').catch(() => { /* Warmup is best-effort */ })
  }, 3000)
})
