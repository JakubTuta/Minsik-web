import { Buffer } from 'node:buffer'
import axios from 'axios'

// In production nginx owns /covers/ and this never runs — see
// deploy/nginx-covers.conf. It exists so `bun dev`, which has no reverse proxy
// in front of it, still renders covers instead of a page of empty tiles.
const COVER_PATH = /^[ab]\/id\/\d{1,10}-[SML]\.jpg$/

export default defineEventHandler(async (event) => {
  if (!import.meta.dev)
    throw createError({ statusCode: 404 })

  const path = getRouterParam(event, 'path') ?? ''
  if (!COVER_PATH.test(path))
    throw createError({ statusCode: 404 })

  try {
    const response = await axios.get<ArrayBuffer>(`https://covers.openlibrary.org/${path}`, {
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    setResponseHeader(event, 'content-type', response.headers['content-type'] ?? 'image/jpeg')
    setResponseHeader(event, 'cache-control', 'public, max-age=2592000')

    return Buffer.from(response.data)
  }
  catch {
    throw createError({ statusCode: 502 })
  }
})
