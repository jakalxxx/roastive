import { NextResponse, NextRequest } from 'next/server';

const LOCALES = ['ko','en','ja'];
const DEFAULT_LOCALE = 'ko';
// 공개 경로 최소화: 로그인/가입만 허용
const PUBLIC_PATHS = ['/login','/signup'];

function base64UrlDecode(input: string): string {
  // Edge runtime-safe base64url decode
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad === 2) b64 += '==';
  else if (pad === 3) b64 += '=';
  else if (pad !== 0) b64 += '==='; // safety
  // atob is available in Edge runtime
  return atob(b64);
}

function decodeJwtExp(token?: string): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payloadSegment = parts[1] || '';
    const json = base64UrlDecode(payloadSegment);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // locale 프리픽스가 없으면 기본 ko로 리다이렉트/리라이트 처리
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    const effective = DEFAULT_LOCALE;
    // 루트('/')는 즉시 로그인으로 리다이렉트
    if (pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = `/${effective}/login`;
      return NextResponse.redirect(url);
    }
    const isPublicNoLocale = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (isPublicNoLocale) {
      const url = req.nextUrl.clone();
      url.pathname = `/${effective}${pathname}`;
      return NextResponse.rewrite(url);
    }
    const token = req.cookies.get('auth_token')?.value;
    const exp = decodeJwtExp(token);
    const nowSec = Math.floor(Date.now() / 1000);
    const skewSec = 60; // 1분 스큐 허용
    if (!token || (exp !== null && exp + skewSec < nowSec)) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = `/${effective}/login`;
      const res = NextResponse.redirect(redirectUrl);
      // 만료/무효 토큰 정리
      res.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
      res.cookies.set('roastery_id', '', { maxAge: 0, path: '/' });
      return res;
    }
    const url = req.nextUrl.clone();
    url.pathname = `/${effective}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 보호 라우트 인증 체크 (로케일 프리픽스가 있는 모든 경로는 공개 경로를 제외하고 보호)
  const localeMatch = pathname.match(/^\/(ko|en|ja)(?:\/|$)/);
  const currentLocale = (localeMatch?.[1] as 'ko'|'en'|'ja') ?? DEFAULT_LOCALE;
  const localizedPath = pathname.replace(/^\/(ko|en|ja)/, '');
  if (PUBLIC_PATHS.some((p) => localizedPath.startsWith(p))) {
    return NextResponse.next();
  }
  const token = req.cookies.get('auth_token')?.value;
  const exp = decodeJwtExp(token);
  const nowSec = Math.floor(Date.now() / 1000);
  const skewSec = 60;
  if (!token || (exp !== null && exp + skewSec < nowSec)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${currentLocale}/login`;
    const res = NextResponse.redirect(url);
    res.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
    res.cookies.set('roastery_id', '', { maxAge: 0, path: '/' });
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|assets/).*)'],
};


