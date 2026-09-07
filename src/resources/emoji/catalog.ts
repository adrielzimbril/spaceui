import { getEmoji, getEmojiName } from '@usespaceui/emoji'
import assetIndex from './asset-index.json'
import unicodeOrder from './unicode-order.json'

const ASSETS = assetIndex as Record<string, string[]>
const RANK = unicodeOrder as Record<string, number>

export function normId(id: string) {
  return id.toLowerCase().replace(/-fe0f/g, '').replace(/--+/g, '-').replace(/^-|-$/g, '')
}

function orderKey(id: string) {
  const hex = id.toLowerCase()
  return RANK[hex] ?? RANK[normId(hex)] ?? Number.MAX_SAFE_INTEGER
}

const COMBOS = Object.keys(ASSETS).map((key) => {
  const map = new Map<string, string>()
  for (const id of ASSETS[key] ?? []) map.set(normId(id), id)
  return { key, map }
})

export const UNIVERSAL_IDS = (() => {
  if (!COMBOS.length) return [] as string[]
  let ids = [...COMBOS[0]!.map.keys()]
  for (const combo of COMBOS.slice(1)) ids = ids.filter((id) => combo.map.has(id))
  return ids.sort((a, b) => orderKey(a) - orderKey(b) || a.localeCompare(b))
})()

export function assetId(source: string, type: string, format: string | undefined, preferred?: string) {
  if (!format) return null
  const list = ASSETS[`${source}/${type}/${format}`]
  if (!list?.length) {
    if (source === 'noto')
      return preferred && UNIVERSAL_IDS.includes(normId(preferred)) ? normId(preferred) : (UNIVERSAL_IDS[0] ?? null)
    return null
  }
  const want = preferred ? normId(preferred) : undefined
  if (want) {
    const hit = list.find((id) => normId(id) === want)
    if (hit) return hit
  }
  const first = UNIVERSAL_IDS[0]
  return list.find((id) => normId(id) === first) ?? list[0] ?? null
}

export function catalogFor(source: string, type: string, format: string | undefined) {
  if (!format) return []
  const list = ASSETS[`${source}/${type}/${format}`]
  if (list?.length) {
    const byNorm = new Map(list.map((id) => [normId(id), id]))
    return UNIVERSAL_IDS.map((id) => byNorm.get(id)).filter((id): id is string => Boolean(id))
  }
  if (source === 'noto') return UNIVERSAL_IDS
  return []
}

export function matchesQuery(id: string, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hex = id.toLowerCase()
  const compact = hex.replace(/-/g, '')
  const hexQuery = q.replace(/^u\+/i, '').replace(/\s+/g, '')
  if (/^[0-9a-f]{2,6}(-[0-9a-f]{2,6})*$/i.test(hexQuery)) {
    const compactQuery = hexQuery.replace(/-/g, '')
    return hex === hexQuery || compact === compactQuery || hex.startsWith(hexQuery) || compact.startsWith(compactQuery)
  }
  let glyph = ''
  try {
    glyph = hex
      .split('-')
      .map((part) => String.fromCodePoint(Number.parseInt(part, 16)))
      .join('')
  } catch {
    return false
  }
  if (glyph && (q === glyph || [...q].some((char) => char === glyph))) return true
  const name = getEmojiName(glyph)?.toLowerCase() ?? ''
  const slug = q.replace(/\s+/g, '-')
  if (name) {
    const tokens = name.split('-')
    if (name === q || name === slug || name.startsWith(`${slug}-`) || name.endsWith(`-${slug}`) || name.includes(`-${slug}-`))
      return true
    if (tokens.some((token) => token === q || token.startsWith(q))) return true
  }
  const named = getEmoji(slug)
  if (named) {
    const namedHex = [...named].map((char) => char.codePointAt(0)!.toString(16)).join('-')
    if (normId(namedHex) === normId(hex)) return true
  }
  return false
}
