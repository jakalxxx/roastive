import { NextResponse } from 'next/server'

const INVESTING_PROXY_URL = 'https://r.jina.ai/https://www.investing.com/commodities/us-coffee-c'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const FALLBACK_INDEX = {
  price: 190.25,
  changePercent: 0,
  currency: 'USD',
}

export async function GET() {
  try {
    const res = await fetch(INVESTING_PROXY_URL, {
      cache: 'no-store',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,*/*',
      },
    })
    if (!res.ok) {
      throw new Error(`가격 정보를 불러오지 못했습니다. (status: ${res.status})`)
    }
    const html = await res.text()
    const priceMatch = html.match(/data-test="instrument-price-last">([\d.,]+)/i)
    const changeMatch = html.match(/data-test="instrument-price-change-percent"[^>]*>.*?(-?\d+\.?\d*)%/i)
    if (!priceMatch) {
      throw new Error('커피지수 데이터를 찾을 수 없습니다.')
    }
    const price = Number(priceMatch[1].replace(/,/g, ''))
    const changePercent = changeMatch ? Number(changeMatch[1]) : 0
    const currency = 'USD'
    const updatedAt = new Date().toISOString()

    return NextResponse.json({ price, changePercent, currency, updatedAt }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[coffee-index]', error)
    const updatedAt = new Date().toISOString()
    return NextResponse.json(
      {
        ...FALLBACK_INDEX,
        updatedAt,
        fallback: true,
        message: '실시간 지수를 불러오지 못해 임시값을 표시합니다.',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

