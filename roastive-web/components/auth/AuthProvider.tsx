"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { me, login as doLogin, logout as doLogout, register as doRegister } from '@/lib/auth';

type User = { user?: any; roasteries?: any[] } | null;
type Ctx = { user: User; loading: boolean; login: (e:string,p:string)=>Promise<void>; logout: ()=>Promise<void>; register: (p:{email:string;password:string;display_name?:string;autoLogin?:boolean})=>Promise<void> };

const AuthCtx = createContext<Ctx>({ user: null, loading: true, async login(){}, async logout(){}, async register(){} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const u = await me(); setUser(u); } catch { setUser(null); } finally { setLoading(false); } })(); }, []);
  const login = async (email: string, password: string) => { setLoading(true); try { await doLogin(email, password); const u = await me(); setUser(u); } finally { setLoading(false); } };
  const logout = async () => { setLoading(true); try { await doLogout(); if (typeof window !== 'undefined') window.localStorage.removeItem('auth_token'); setUser(null); } finally { setLoading(false); } };
  const register = async (payload: { email: string; password: string; display_name?: string; autoLogin?: boolean }) => { setLoading(true); try { await doRegister(payload); const u = await me().catch(() => null); setUser(u); } finally { setLoading(false); } };
  return <AuthCtx.Provider value={{ user, loading, login, logout, register }}>{children}</AuthCtx.Provider>;
}

export function useAuth(){ return useContext(AuthCtx); }



