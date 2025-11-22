import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '../../_utils/env';
import { readJson, fetchJson } from '../../_utils/auth';

const COOKIE_NAME = 'auth_token';

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const { res, data } = await fetchJson(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    // optional auto-login
    if (body?.autoLogin && body?.email && body?.password) {
      const { res: loginRes, data: l } = await fetchJson(`${API_BASE}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email, password: body.password })
      });
      if (loginRes.ok && l?.access_token) {
        const secure = process.env.NODE_ENV === 'production';
        cookies().set({ name: COOKIE_NAME, value: l.access_token, httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60*60 });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Register failed' }, { status: 500 });
  }
}



