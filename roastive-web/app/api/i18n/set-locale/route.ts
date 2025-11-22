import { NextResponse } from 'next/server'
import { readJson } from '../../_utils/auth'

const LOCALES = ['ko','en','ja'] as const

export async function POST(req: Request) {
  try {
    const { locale } = await readJson(req)
    if (!LOCALES.includes(locale)) {
      return NextResponse.json({ ok: false, error: 'invalid-locale' }, { status: 400 })
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set('locale', locale, { httpOnly: false, sameSite: 'lax', path: '/' })
    return res
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}


