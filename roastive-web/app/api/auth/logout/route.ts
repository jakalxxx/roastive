import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '../../_utils/env';
import { fetchJson } from '../../_utils/auth';

export async function POST() {
  try {
    const token = cookies().get('auth_token')?.value;
    const refresh = cookies().get('refresh_token')?.value;
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const { res, data } = await fetchJson(`${API_BASE}/api/auth/logout`, { method: 'POST', headers });
    // regardless of backend result, clear cookies locally
    cookies().delete('auth_token');
    cookies().delete('refresh_token');
    return NextResponse.json({ ok: true, ...data }, { status: res.status || 200 });
  } catch {
    cookies().delete('auth_token');
    cookies().delete('refresh_token');
    return NextResponse.json({ ok: true });
  }
}