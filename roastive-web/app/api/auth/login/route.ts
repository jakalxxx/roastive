import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '../../_utils/env';
import { readJson, fetchJson } from '../../_utils/auth';

const API = `${API_BASE}/api`;
const COOKIE_NAME = 'auth_token';
const REFRESH_COOKIE = 'refresh_token';

export async function POST(req: Request) {
  try {
    const { email, password, remember } = await readJson(req);
    const { res, data } = await fetchJson(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    const accessToken = data?.access_token || data?.token;
    const refreshToken = data?.refresh_token;
    const userId = data?.user?.user_id || data?.user_id;
    if (!accessToken) return NextResponse.json({ message: 'Invalid response' }, { status: 500 });

    const secure = process.env.NODE_ENV === 'production';
    cookies().set({
      name: COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: remember ? 60 * 60 * 24 * 14 : 60 * 60 * 24,
    });
    if (refreshToken) {
      cookies().set({
        name: REFRESH_COOKIE,
        value: refreshToken,
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: remember ? 60 * 60 * 24 * 60 : 60 * 60 * 24 * 14,
      });
    }
    if (userId) {
      cookies().set({ name: 'user_id', value: String(userId), httpOnly: true, sameSite: 'lax', path: '/' });
    }
    // roastery_id 쿠키 설정은 /api/auth/me에서만 처리 (단일화)
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Login failed' }, { status: 500 });
  }
}


