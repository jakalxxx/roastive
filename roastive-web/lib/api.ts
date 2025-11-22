const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

function toUrl(input: string): string {
  if (!input) return API_BASE;
  if (/^https?:\/\//i.test(input)) return input;
  // Next API routes는 프록시를 위해 앱 도메인으로 직접 호출
  if (input.startsWith('/api/')) return input;
  if (input.startsWith('/')) return `${API_BASE}${input}`;
  return `${API_BASE}/${input}`;
}

export async function apiFetch(input: string, init?: RequestInit) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as any || {}) };
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token');
    if (token && !headers['Authorization']) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(toUrl(input), { ...init, headers, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.message || 'Request failed'), { status: res.status, data });
  return data;
}



