import { NextResponse } from 'next/server'
import { API_BASE } from '../../_utils/env'
import { wrapAuth, fetchJson, toNextJson, readJson } from '../../_utils/auth'

type RawUser = Record<string, any>

function normalizeUser(row: RawUser) {
  return {
    userId: String(row.userId ?? row.user_id ?? ''),
    email: String(row.email ?? ''),
    displayName: row.displayName ?? row.display_name ?? '',
    status: row.status ?? 'ACTIVE',
    lastLoginAt: row.lastLoginAt ?? row.last_login_at ?? null,
    createdAt: row.createdAt ?? row.created_at ?? null,
    roles: row.roles ?? row.roleNames ?? [],
  }
}

export const GET = wrapAuth(async ({ headers }) => {
  const { res, data } = await fetchJson(`${API_BASE}/v2/users`, { headers, cache: 'no-store' })
  return toNextJson(res, data)
})

export const POST = wrapAuth(async ({ headers }, req: Request) => {
  const body = await readJson(req)
  const payload = {
    email: (body?.email ?? '').trim(),
    password: body?.password,
    displayName: body?.displayName ?? body?.display_name,
    status: body?.status ?? 'ACTIVE',
  }
  if (!payload.email || !payload.password) {
    return NextResponse.json({ message: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 })
  }
  const { res, data } = await fetchJson(`${API_BASE}/v2/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return toNextJson(res, data)
})




























