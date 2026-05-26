interface Dedupable {
  type: string
  slug: string
  language?: string
  readers: number
}

export function dedupBySlug<T extends Dedupable>(items: T[], preferredLanguage: string): T[] {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const key = `${item.type}:${item.slug}`
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
    const top = group.reduce((best, g) => (g.readers > best.readers ? g : best), group[0]!)
    out.push({ ...top, readers: combinedReaders })
  }

  return out
}
