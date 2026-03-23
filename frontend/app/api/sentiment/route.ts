// Файл: app/api/sentiment/route.ts
// Серверный прокси — запросы идут с сервера Vercel, не с браузера пользователя

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [fgRes, frRes, lsRes] = await Promise.allSettled([
      // Fear & Greed — Alternative.me, полностью бесплатно
      fetch('https://api.alternative.me/fng/?limit=1', { cache: 'no-store' }),
      // Funding Rate — Binance публичный эндпоинт
      fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT', { cache: 'no-store' }),
      // Long/Short Ratio — Binance публичный эндпоинт
      fetch('https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1', { cache: 'no-store' }),
    ])

    // Fear & Greed
    let fearGreed = null
    if (fgRes.status === 'fulfilled' && fgRes.value.ok) {
      const data = await fgRes.value.json()
      const d = data.data?.[0]
      if (d) fearGreed = {
        value: parseInt(d.value),
        classification: d.value_classification,
      }
    }

    // Funding Rate
    let fundingRate = null
    if (frRes.status === 'fulfilled' && frRes.value.ok) {
      const d = await frRes.value.json()
      const rate = parseFloat(d.lastFundingRate)
      fundingRate = {
        rate,
        pct: (rate * 100).toFixed(4) + '%',
        nextFundingTime: d.nextFundingTime,
      }
    }

    // Long/Short Ratio
    let longShort = null
    if (lsRes.status === 'fulfilled' && lsRes.value.ok) {
      const data = await lsRes.value.json()
      const d = data?.[0]
      if (d) longShort = {
        longPct: Math.round(parseFloat(d.longAccount) * 100 * 10) / 10,
        shortPct: Math.round(parseFloat(d.shortAccount) * 100 * 10) / 10,
        ratio: parseFloat(d.longShortRatio).toFixed(2),
      }
    }

    return NextResponse.json({ fearGreed, fundingRate, longShort }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch sentiment data' }, { status: 500 })
  }
}
