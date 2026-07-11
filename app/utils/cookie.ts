export function readCookie(name: string): string | null {
  if (!import.meta.client)
    return null

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  if (!match)
    return null

  return decodeURIComponent(match[1]!)
}

export function deleteCookie(name: string, path: string = '/'): void {
  if (!import.meta.client)
    return

  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}
