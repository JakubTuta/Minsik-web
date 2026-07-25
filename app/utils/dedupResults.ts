interface Dedupable {
  type: string
  slug: string
  language?: string
  readers: number
  work_id?: string
}

export function dedupByWork<T extends Dedupable>(items: T[], preferredLanguage: string): T[] {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    // Books group by work_id (falls back to slug for older responses or
    // items missing it); authors/series have no work_id and group by slug,
    // since each is a single global/per-language entity, not a translation.
    const identity = item.type === 'book'
      ? (item.work_id || item.slug)
      : item.slug
    const key = `${item.type}:${identity}`
    const group = groups.get(key)
    if (group)
      group.push(item)
    else
      groups.set(key, [item])
  }

  const out: T[] = []

  for (const group of groups.values()) {
    if (group.length === 1) {
      out.push(group[0]!)
      continue
    }

    const match = group.find(g => g.language === preferredLanguage)
    if (match) {
      out.push(match)
      continue
    }

    const combinedReaders = group.reduce((sum, g) => sum + (g.readers || 0), 0)
    const top = group.reduce((best, g) => (g.readers > best.readers
      ? g
      : best), group[0]!)
    out.push({ ...top, readers: combinedReaders })
  }

  return out
}
