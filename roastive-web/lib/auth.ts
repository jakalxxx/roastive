import { apiFetch } from './api';

export async function login(email: string, password: string, remember?: boolean) {
  const res = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, remember: !!remember }) });
  if (typeof window !== 'undefined' && res?.token) {
    window.localStorage.setItem('auth_token', res.token);
  }
  return res;
}

export async function register(payload: { email: string; password: string; display_name?: string; autoLogin?: boolean }) {
  return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function logout() { return apiFetch('/api/auth/logout', { method: 'POST' }); }

export async function me() { return apiFetch('/api/auth/me'); }



