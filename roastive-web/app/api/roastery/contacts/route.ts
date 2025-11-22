import { API_BASE } from '../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../_utils/auth'

export const GET = wrapAuth(async ({ headers }) => {
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/contacts`, { headers, cache: 'no-store' })
  return toNextJson(res, data)
})

export const POST = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const { res, data } = await fetchJson(`${API_BASE}/v2/roasteries/contacts`, { method: 'POST', headers, body: JSON.stringify(body) })
  return toNextJson(res, data)
})


