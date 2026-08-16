const SITEMAP_ENTITIES = ['books', 'authors', 'series']

// Warms the sitemap URL caches at boot. Building one entity can exceed Bun's
// 10s request timeout, so populating the caches in the background keeps the
// sitemap files fast from the first external request. Sequential, because the
// three builds together pull the whole catalogue into memory.
export default defineNitroPlugin(() => {
  setTimeout(async () => {
    for (const entity of SITEMAP_ENTITIES) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await $fetch('/api/__sitemap__/urls', { params: { entity } })
      }
      catch (error) {
        console.error(`[sitemap] warmup failed for ${entity}`, error)
      }
    }
  }, 3000)
})
