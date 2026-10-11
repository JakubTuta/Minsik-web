const ISBN_SEPARATORS = /[\s-]/g
const ISBN_SHAPE = /^(?:\d{9}[\dX]|\d{13})$/i

/** The digits of `query` when it is shaped like an ISBN-10/13 (hyphens and spaces allowed), else null. */
export function isbnFromQuery(query: string): string | null {
  const compact = query.replace(ISBN_SEPARATORS, '')

  return ISBN_SHAPE.test(compact)
    ? compact.toUpperCase()
    : null
}
