import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { API_BASE } from '../../_utils/env';
import { getAccessOr401, fetchJson, toNextJson } from '../../_utils/auth';

const API = `${API_BASE}/api`;

export async function GET() {
  try {
    const auth = getAccessOr401(); if (auth instanceof NextResponse) return auth;
    const headersObj = new Headers(auth.headers);
    const userId = cookies().get('user_id')?.value;
    if (userId) headersObj.set('X-User-Id', String(userId));
    const { res, data } = await fetchJson(`${API}/auth/me`, { headers: headersObj, cache: 'no-store' });
    if (!res.ok) return toNextJson(res, data);
    // Ensure roastery_id cookie is set based on memberships
    try {
      const roasteries: any[] = Array.isArray((data as any)?.roasteries) ? (data as any).roasteries : [];
      const first = roasteries[0];
      const firstId = first ? ((first as any).id ?? (first as any).roastery_id ?? null) : null;
      if (firstId) {
        const out = NextResponse.json(data);
        out.cookies.set('roastery_id', String(firstId), { httpOnly: true, sameSite: 'lax', path: '/' });
        return out;
      }
    } catch {}
    return toNextJson(res, data);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Failed' }, { status: 500 });
  }
}



