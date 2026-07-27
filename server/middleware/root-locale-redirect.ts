import { APP_LOCALES, DEFAULT_LOCALE } from '~~/locales.config'

const SUPPORTED = new Set(APP_LOCALES.map(entry => entry.code))
const LOCALE_COOKIE = 'pref_lang'

/**
 * Sends a non-default-locale reader from `/` to `/{locale}`.
 *
 * `@nuxtjs/i18n` is configured to do this (`detectBrowserLanguage.redirectOn:
 * 'root'`), but measured against a production build it does not: `/` answers
 * 200 with `<html lang="en-US">` for a reader sending `pref_lang=pl` or
 * `Accept-Language: pl-PL`, on a cold cache key as well as a warm one. The
 * home page was the only route where language detection had no other way in —
 * every other page carries its locale in the path — so without this the
 * default locale was the only thing `/` could ever serve.
 *
 * Running it as Nitro middleware rather than fixing it inside the app also
 * keeps `/` cacheable. Middleware run before the router, so they run before
 * the `swr` cache wrapper Nitro puts on the route; the locale is decided
 * above the cache, and the only thing that reaches the cache is
 * default-locale HTML. Anything that redirects *inside* the render handler
 * would be stored instead — Nitro keys that cache on path alone and only
 * refuses to store responses with status >= 400, so a 3xx is cacheable and
 * would be replayed to every later visitor.
 *
 * Detection order matches i18n's own (`pref_lang`, then `Accept-Language`),
 * and matching is by base subtag, which is broader than i18n's full-tag
 * match — so should i18n's root redirect ever start firing, it can only agree
 * with the decision already made here.
 *
 * The cookie is deliberately not written: arriving at `/{locale}` makes i18n
 * resolve that locale from the route prefix and persist it itself
 * (`setLocaleSuspend` -> `setCookieLocale`), so there is one writer, not two.
 */
function localeFromCookie(event: Parameters<typeof getCookie>[0]): string | null {
  const cookie = getCookie(event, LOCALE_COOKIE)

  return cookie && SUPPORTED.has(cookie)
    ? cookie
    : null
}

function localeFromAcceptLanguage(header: string): string | null {
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const quality = params.find(param => param.trim().startsWith('q='))

      return {
        code: (tag ?? '').trim().toLowerCase().split('-')[0] ?? '',
        quality: quality
          ? Number.parseFloat(quality.trim().slice(2))
          : 1,
      }
    })
    .filter(entry => entry.code && !Number.isNaN(entry.quality))
    .sort((a, b) => b.quality - a.quality)

  return ranked.find(entry => SUPPORTED.has(entry.code))?.code ?? null
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (url.pathname !== '/')
    return

  const detected = localeFromCookie(event)
    ?? localeFromAcceptLanguage(getRequestHeader(event, 'accept-language') ?? '')
    ?? DEFAULT_LOCALE

  if (detected === DEFAULT_LOCALE)
    return

  return sendRedirect(event, `/${detected}${url.search}`, 302)
})
