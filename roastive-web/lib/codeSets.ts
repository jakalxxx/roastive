export type CodeSetOption = {
  codeType: string
  codeKey: string
  label: string
  sort: number
  active: boolean
  meta?: Record<string, any> | null
}

type FetchOptions = {
  includeInactive?: boolean
  force?: boolean
  signal?: AbortSignal
}

type RawCodeSet = {
  code_type?: string
  codeType?: string
  code_key?: string
  codeKey?: string
  code?: string
  key?: string
  label?: string
  name?: string
  title?: string
  sort?: number | string
  active?: boolean
  enabled?: boolean
  meta?: Record<string, any> | null
}

function normalizeEntry(entry: RawCodeSet | undefined | null, fallbackType: string): CodeSetOption | null {
  if (!entry) return null
  const codeKey = entry.code_key ?? entry.codeKey ?? entry.code ?? entry.key
  if (!codeKey) return null
  const codeType = entry.code_type ?? entry.codeType ?? fallbackType
  const label = entry.label ?? entry.name ?? entry.title ?? codeKey
  const sortRaw = entry.sort
  let sort = 0
  if (typeof sortRaw === 'number') sort = sortRaw
  else if (typeof sortRaw === 'string') {
    const parsed = Number(sortRaw)
    sort = Number.isNaN(parsed) ? 0 : parsed
  }
  const active = entry.active ?? entry.enabled ?? true
  return { codeType, codeKey: String(codeKey), label: String(label), sort, active: Boolean(active), meta: entry.meta ?? null }
}

function extractPayload(payload: any): RawCodeSet[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (payload?.result && Array.isArray(payload.result)) return payload.result
  return []
}

const cache = new Map<string, CodeSetOption[]>()

export async function fetchCodeSetOptions(codeType: string, options: FetchOptions = {}): Promise<CodeSetOption[]> {
  const { includeInactive = false, force = false, signal } = options
  const cacheKey = `${codeType}:${includeInactive ? 'all' : 'active'}`
  if (!force && cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? []
  }

  const res = await fetch(`/api/codes/${encodeURIComponent(codeType)}`, { cache: 'no-store', signal })
  const raw = await res.json().catch(() => ([] as RawCodeSet[]))
  if (!res.ok) {
    const message = (raw as any)?.message || '코드 정보를 불러오지 못했습니다.'
    throw new Error(message)
  }
  const list = extractPayload(raw)
    .map((entry) => normalizeEntry(entry, codeType))
    .filter((entry): entry is CodeSetOption => Boolean(entry))

  const filtered = includeInactive ? list : list.filter((item) => item.active)
  cache.set(cacheKey, filtered)
  return filtered
}

export function clearCodeSetCache(codeType?: string) {
  if (!codeType) {
    cache.clear()
    return
  }
  const activeKey = `${codeType}:active`
  const allKey = `${codeType}:all`
  cache.delete(activeKey)
  cache.delete(allKey)
}

