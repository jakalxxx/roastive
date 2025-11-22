import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export function getAuthHeadersOr401(): { headers: Headers } | NextResponse {
  const token = cookies().get('auth_token')?.value
  const rid = cookies().get('roastery_id')?.value
  if (!token || !rid) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  const headers = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Roastery-Id': rid,
  })
  return { headers }
}

export function getAuthOr401(): { token: string, rid: string, headers: Headers } | NextResponse {
  const token = cookies().get('auth_token')?.value
  const rid = cookies().get('roastery_id')?.value
  if (!token || !rid) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  const headers = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Roastery-Id': rid,
  })
  return { token, rid, headers }
}

export async function readJson(req: Request): Promise<any> {
  return await req.json().catch(() => ({}))
}

export async function fetchJson(url: string, init?: RequestInit): Promise<{ res: Response, data: any }>
export async function fetchJson(input: RequestInfo, init?: RequestInit): Promise<{ res: Response, data: any }> {
  const res = await fetch(input, init)
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

export function toNextJson(res: Response, data: any): NextResponse {
  return NextResponse.json(data, { status: res.status })
}

export type AuthContext = { token: string, rid: string, headers: Headers }

export function wrapAuth<T extends any[]>(
  handler: (ctx: AuthContext, ...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T) => {
    const auth = getAuthOr401()
    if (auth instanceof NextResponse) return auth
    const ctx: AuthContext = { token: auth.token, rid: auth.rid, headers: auth.headers }
    return handler(ctx, ...args)
  }
}

export function getAccessOr401(): { token: string, headers: Headers } | NextResponse {
  const token = cookies().get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const headers = new Headers({ 'Authorization': `Bearer ${token}` })
  return { token, headers }
}


