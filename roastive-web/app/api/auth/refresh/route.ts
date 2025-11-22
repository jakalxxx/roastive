import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '../../_utils/env';

const API = `${API_BASE}/api`;
const ACCESS_COOKIE = 'auth_token';
const REFRESH_COOKIE = 'refresh_token';

export async function POST() {
  try {
    const refresh = cookies().get(REFRESH_COOKIE)?.value;
    if (!refresh) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const headers = new Headers({ 'Content-Type': 'application/json' });
    // Depending on backend, either send in body or Authorization
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refresh_token: refresh }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    const accessToken = data?.access_token || data?.token;
    const newRefresh = data?.refresh_token;
    if (!accessToken) return NextResponse.json({ message: 'Invalid response' }, { status: 500 });

    const secure = process.env.NODE_ENV === 'production';
    cookies().set({ name: ACCESS_COOKIE, value: accessToken, httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 });
    if (newRefresh) cookies().set({ name: REFRESH_COOKIE, value: newRefresh, httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Refresh failed' }, { status: 500 });
  }
}


