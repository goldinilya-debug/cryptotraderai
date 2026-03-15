'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { Activity, RefreshCw, Plus, Trash2, Grid, List } from 'lucide-react'

const API_URL = 'https://cryptotraderai-api.onrender.com'

const AVAILABLE_PAIRS = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'ADA/USDT', 'DOGE/USDT', 'LINK/USDT', 'POL/USDT', 'DOT/USDT',
  'AVAX/USDT', 'LTC/USDT', 'BCH/USDT', 'PEPE/USDT', 'SHIB/USDT',
]

const SYMBOL_MAP: Record<string, string> = {
  '1000PEPEUSDT': 'PEPEUSDT',
  '1000SHIBUSDT': 'SHIBUSDT',
  'MATICUSDT': 'POLUSDT',
}

type Session = 'all' | 'asia' | 'london' | 'ny'
type ViewMode = 'ladder' | 'candles'
type TickMultiplier = 1 | 5 | 10 | 25
type ImbalanceThreshold = 2 | 3 | 4 | 5
type ColorScheme = 'delta' | 'heatmap' | 'proportion'
type Timeframe = '1m' | '5m' | '15m' | '1h'

interface PriceLevel {
  price: number
  bidVol: number
  askVol: number
  totalVol: number
  delta: number
  imbalance: 'bid' | 'ask' | null
  isPOC: boolean
  inValueArea: boolean
  tradeCount: number
  isAbsorption: boolean
  isStackedImbalance: boolean
}

interface FootprintState {
  levels: PriceLevel[]
  poc: number
  vah: number
  val: number
  totalBuy: number
  totalSell: number
  totalDelta: number
  deltaPercent: number
  cvd: number[]
  currentPrice: number
  high24h: number
  low24h: number
  volume24h: number
  priceChange24h: number
  tradeCount: number
}

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface CandleFootprint {
  candle: CandleData
  levels: { price: number; bidVol: number; askVol: number; totalVol: number; delta: number; isPOC: boolean }[]
  poc: number
  totalDelta: number
  totalBuy: number
  totalSell: number
  tradeCount: number
}

// ── helpers ────────────────────────────────────────────────────────────────────

function getTickSize(price: number): number {
  if (price > 50000) return 100
  if (price > 10000) return 50
  if (price > 1000) return 5
  if (price > 100) return 0.5
  if (price > 10) return 0.1
  if (price > 1) return 0.01
  return 0.0001
}

function fmtPrice(p: number): string {
  if (!p) return '0'
  if (p < 0.0001) return p.toExponential(4)
  if (p < 0.01) return p.toFixed(6)
  if (p < 1) return p.toFixed(4)
  if (p < 1000) return p.toFixed(2)
  return p.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function fmtVol(v: number): string {
  if (v === undefined || v === null || isNaN(v)) return '—'
  const a = Math.abs(v)
  if (a === 0) return '—'
  if (a >= 1000) return (v / 1000).toFixed(1) + 'K'
  if (a >= 100) return v.toFixed(0)
  if (a >= 10) return v.toFixed(1)
  return v.toFixed(2)
}

function fmtUSD(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return v.toFixed(0)
}

function fmtTime(ms: number): string {
  const d = new Date(ms)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function sessionRange(session: Session): { start: number; end: number } {
  const now = Date.now()
  const today = new Date(); today.setUTCHours(0, 0, 0, 0)
  const d = today.getTime()
  switch (session) {
    case 'asia':   return { start: d + 21 * 3600e3 - 86400e3, end: d + 8 * 3600e3 }
    case 'london': return { start: d + 8 * 3600e3, end: d + 16 * 3600e3 }
    case 'ny':     return { start: d + 13 * 3600e3, end: d + 21 * 3600e3 }
    default:       return { start: now - 86400e3, end: now }
  }
}

// ── core footprint builder ─────────────────────────────────────────────────────

function buildFootprint(
  trades: any[],
  session: Session,
  currentPrice: number,
  high24h: number,
  low24h: number,
  tickMultiplier: TickMultiplier,
  imbalanceThreshold: ImbalanceThreshold,
): FootprintState | null {
  if (!trades || !trades.length || !currentPrice) return null

  const { start, end } = sessionRange(session)
  const filtered = session === 'all' ? trades : trades.filter(t => t.time >= start && t.time <= end)
  if (!filtered.length) return null

  const baseTick = getTickSize(currentPrice)
  const tick = baseTick * tickMultiplier

  const levelMap = new Map<number, { bid: number; ask: number; count: number }>()
  let totalBuy = 0, totalSell = 0
  const cvd: number[] = []
  let running = 0

  for (const t of filtered) {
    const qty = parseFloat(t.qty)
    const price = parseFloat(t.price)
    if (isNaN(qty) || isNaN(price)) continue
    const lp = Math.round(price / tick) * tick

    if (!levelMap.has(lp)) levelMap.set(lp, { bid: 0, ask: 0, count: 0 })
    const lv = levelMap.get(lp)!
    lv.count++

    if (t.buyerMaker) {
      lv.bid += qty; totalSell += qty; running -= qty
    } else {
      lv.ask += qty; totalBuy += qty; running += qty
    }
    cvd.push(running)
  }

  if (!levelMap.size) return null

  const prices = Array.from(levelMap.keys()).sort((a, b) => b - a)

  let pocPrice = prices[0], maxVol = 0
  for (const p of prices) {
    const { bid, ask } = levelMap.get(p)!
    if (bid + ask > maxVol) { maxVol = bid + ask; pocPrice = p }
  }

  const totalVol = totalBuy + totalSell
  const target = totalVol * 0.70
  let vaVol = maxVol
  let vah = pocPrice, val = pocPrice
  const pocIdx = prices.indexOf(pocPrice)
  let ui = pocIdx - 1, di = pocIdx + 1

  while (vaVol < target && (ui >= 0 || di < prices.length)) {
    const ua = ui >= 0 ? (levelMap.get(prices[ui])!.bid + levelMap.get(prices[ui])!.ask) : 0
    const da = di < prices.length ? (levelMap.get(prices[di])!.bid + levelMap.get(prices[di])!.ask) : 0
    if (ua >= da && ui >= 0) { vaVol += ua; vah = prices[ui]; ui-- }
    else if (di < prices.length) { vaVol += da; val = prices[di]; di++ }
    else ui--
  }

  // Build raw levels first for stacked imbalance detection
  const rawLevels = prices.map(p => {
    const { bid, ask, count } = levelMap.get(p)!
    const total = bid + ask
    const delta = ask - bid
    let imbalance: 'bid' | 'ask' | null = null
    if (bid > 0 && ask / bid >= imbalanceThreshold) imbalance = 'ask'
    else if (ask > 0 && bid / ask >= imbalanceThreshold) imbalance = 'bid'
    const isAbsorption = total > maxVol * 0.6 && Math.abs(delta) < total * 0.1
    return {
      price: p, bidVol: bid, askVol: ask, totalVol: total, delta, imbalance,
      isPOC: p === pocPrice,
      inValueArea: p <= vah && p >= val,
      tradeCount: count,
      isAbsorption,
      isStackedImbalance: false,
    }
  })

  // Detect stacked imbalances: 3+ consecutive same direction
  for (let i = 0; i < rawLevels.length; i++) {
    if (!rawLevels[i].imbalance) continue
    const dir = rawLevels[i].imbalance
    let streak = 1
    let j = i + 1
    while (j < rawLevels.length && rawLevels[j].imbalance === dir) { streak++; j++ }
    if (streak >= 3) {
      for (let k = i; k < j; k++) rawLevels[k].isStackedImbalance = true
    }
  }

  const levels: PriceLevel[] = rawLevels

  const totalDelta = totalBuy - totalSell
  const deltaPercent = totalVol > 0 ? (totalDelta / totalVol) * 100 : 0

  return {
    levels, poc: pocPrice, vah, val,
    totalBuy, totalSell, totalDelta, deltaPercent, cvd,
    currentPrice, high24h, low24h,
    volume24h: 0, priceChange24h: 0, tradeCount: filtered.length,
  }
}

// ── candle footprint builder ───────────────────────────────────────────────────

function buildCandleFootprints(trades: any[], klines: CandleData[]): CandleFootprint[] {
  if (!trades || !trades.length || !klines || !klines.length) return []

  const sorted = [...klines].sort((a, b) => a.time - b.time)
  const results: CandleFootprint[] = []

  for (let ci = 0; ci < sorted.length; ci++) {
    const candle = sorted[ci]
    const nextOpen = ci + 1 < sorted.length ? sorted[ci + 1].time : Infinity

    const candleTrades = trades.filter(t => t.time >= candle.time && t.time < nextOpen)
    if (!candleTrades.length) continue

    const range = candle.high - candle.low || 0.0001
    const refPrice = candle.close
    const tick = getTickSize(refPrice)

    const levelMap = new Map<number, { bid: number; ask: number }>()
    let totalBuy = 0, totalSell = 0

    for (const t of candleTrades) {
      const qty = parseFloat(t.qty)
      const price = parseFloat(t.price)
      if (isNaN(qty) || isNaN(price)) continue
      const lp = Math.round(price / tick) * tick
      if (!levelMap.has(lp)) levelMap.set(lp, { bid: 0, ask: 0 })
      const lv = levelMap.get(lp)!
      if (t.buyerMaker) { lv.bid += qty; totalSell += qty }
      else { lv.ask += qty; totalBuy += qty }
    }

    if (!levelMap.size) continue

    let pocPrice = 0, maxVol = 0
    levelMap.forEach((v, p) => {
      if (v.bid + v.ask > maxVol) { maxVol = v.bid + v.ask; pocPrice = p }
    })

    // Show top 12 levels sorted descending, filtered to candle range with some margin
    const allPrices = Array.from(levelMap.keys()).sort((a, b) => b - a)
    const margin = range * 0.1
    const inRangePrices = allPrices.filter(p => p >= candle.low - margin && p <= candle.high + margin)
    const displayPrices = inRangePrices.slice(0, 12)

    const levels = displayPrices.map(p => {
      const { bid, ask } = levelMap.get(p)!
      return {
        price: p,
        bidVol: bid,
        askVol: ask,
        totalVol: bid + ask,
        delta: ask - bid,
        isPOC: p === pocPrice,
      }
    })

    results.push({
      candle,
      levels,
      poc: pocPrice,
      totalDelta: totalBuy - totalSell,
      totalBuy,
      totalSell,
      tradeCount: candleTrades.length,
    })
  }

  // Return up to 8 most recent candles that have data, newest last (left=oldest, right=newest)
  return results.slice(-8)
}

// ── CVD sparkline ──────────────────────────────────────────────────────────────

function CVDChart({ data }: { data: number[] }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: 12 }}>
        No CVD data
      </div>
    )
  }
  const W = 300, H = 60
  const min = Math.min(...data), max = Math.max(...data)
  const range = Math.max(max - min, 0.0001)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`).join(' ')
  const last = data[data.length - 1]
  const zeroY = H - ((0 - min) / range) * H
  const color = last >= 0 ? '#10b981' : '#ef4444'

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {min < 0 && max > 0 && (
        <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="#374151" strokeWidth={1} strokeDasharray="3,3" />
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * W} cy={H - ((last - min) / range) * H} r={3} fill={color} />
    </svg>
  )
}

// ── CVD line chart for candles ──────────────────────────────────────────────────

function CandleCVDChart({ candles }: { candles: CandleFootprint[] }) {
  if (!candles.length) return null
  const W = 600, H = 50
  // Build running CVD across all candles
  let running = 0
  const points: number[] = [0]
  for (const c of candles) {
    running += c.totalDelta
    points.push(running)
  }
  const min = Math.min(...points), max = Math.max(...points)
  const range = Math.max(max - min, 0.0001)
  const step = W / (points.length - 1)
  const pts = points.map((v, i) => `${i * step},${H - ((v - min) / range) * H}`).join(' ')
  const last = points[points.length - 1]
  const color = last >= 0 ? '#10b981' : '#ef4444'
  const zeroY = H - ((0 - min) / range) * H

  return (
    <div style={{ marginTop: 12, background: '#0a0a0f', borderRadius: 6, padding: '8px 4px' }}>
      <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, paddingLeft: 4 }}>CVD across candles</div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {min < 0 && max > 0 && (
          <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="#374151" strokeWidth={1} strokeDasharray="3,3" />
        )}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── candle OHLC mini bar ───────────────────────────────────────────────────────

function MiniCandle({ candle, height = 40 }: { candle: CandleData; height?: number }) {
  const range = candle.high - candle.low || 0.0001
  const isBull = candle.close >= candle.open
  const color = isBull ? '#10b981' : '#ef4444'
  const bodyTop = Math.min(candle.open, candle.close)
  const bodyBot = Math.max(candle.open, candle.close)
  const topWickPct = ((candle.high - bodyTop) / range) * 100
  const bodyPct = ((bodyBot - bodyTop) / range) * 100
  const botWickPct = ((bodyBot - candle.low) / range) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height, width: 20 }}>
      {/* top wick */}
      <div style={{ flex: topWickPct, width: 1, background: color, minHeight: 1 }} />
      {/* body */}
      <div style={{ flex: Math.max(bodyPct, 2), width: 10, background: color, borderRadius: 1 }} />
      {/* bot wick */}
      <div style={{ flex: botWickPct, width: 1, background: color, minHeight: 1 }} />
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────────

export default function FootprintPage() {
  const [pair, setPair] = useState('BTC/USDT')
  const [session, setSession] = useState<Session>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('ladder')
  const [tickMultiplier, setTickMultiplier] = useState<TickMultiplier>(1)
  const [imbalanceThreshold, setImbalanceThreshold] = useState<ImbalanceThreshold>(3)
  const [colorScheme, setColorScheme] = useState<ColorScheme>('heatmap')
  const [timeframe, setTimeframe] = useState<Timeframe>('5m')
  const [fp, setFp] = useState<FootprintState | null>(null)
  const [candleFootprints, setCandleFootprints] = useState<CandleFootprint[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('')
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [customPairs, setCustomPairs] = useState<string[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newPair, setNewPair] = useState('')
  const [addError, setAddError] = useState('')
  const rawTrades = useRef<any[]>([])
  const ticker24h = useRef({ priceChange24h: 0, volume24h: 0 })
  const rawKlines = useRef<CandleData[]>([])

  useEffect(() => {
    try {
      const s = localStorage.getItem('footprintCustomPairs')
      if (s) setCustomPairs(JSON.parse(s))
    } catch {}
  }, [])

  const saveCustom = (pairs: string[]) => {
    setCustomPairs(pairs)
    try { localStorage.setItem('footprintCustomPairs', JSON.stringify(pairs)) } catch {}
  }

  const addPair = () => {
    setAddError('')
    const p = newPair.toUpperCase().trim()
    const formatted = p.includes('/') ? p : p.replace('USDT', '/USDT')
    if (!formatted.endsWith('/USDT')) { setAddError('Must end with USDT'); return }
    if (allPairs.includes(formatted)) { setAddError('Already exists'); return }
    saveCustom([...customPairs, formatted])
    setNewPair(''); setShowAdd(false)
  }

  const removePair = (p: string) => {
    saveCustom(customPairs.filter(x => x !== p))
    if (pair === p) setPair('BTC/USDT')
  }

  const allPairs = [...AVAILABLE_PAIRS, ...customPairs]
  const filteredPairs = allPairs.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))

  const loadData = useCallback(async (target = pair, tf = timeframe) => {
    setLoading(true); setError('')
    try {
      let sym = target.replace('/', '')
      sym = SYMBOL_MAP[sym] || sym
      const proxy = sym.replace('USDT', '-USDT')

      const requests: Promise<Response>[] = [
        fetch(`${API_URL}/proxy/ticker/${proxy}`),
        fetch(`${API_URL}/proxy/trades/${proxy}?limit=1000`),
      ]

      if (viewMode === 'candles') {
        requests.push(fetch(`${API_URL}/proxy/klines/${proxy}?interval=${tf}&limit=20`))
      }

      const responses = await Promise.all(requests)
      const jsons = await Promise.all(responses.map(r => r.json()))

      const td = jsons[0]
      const rd = jsons[1]

      const tk = td?.data || {}
      const currentPrice = parseFloat(tk.lastPrice) || 0
      const high24h = parseFloat(tk.highPrice) || 0
      const low24h = parseFloat(tk.lowPrice) || 0

      ticker24h.current = {
        priceChange24h: parseFloat(tk.priceChangePercent) || 0,
        volume24h: (parseFloat(tk.volume) || 0) * currentPrice,
      }

      rawTrades.current = rd?.data || []

      if (viewMode === 'candles' && jsons[2]) {
        const kd = jsons[2]
        rawKlines.current = (kd?.data || []).map((k: any) => ({
          time: k.time,
          open: parseFloat(k.open),
          high: parseFloat(k.high),
          low: parseFloat(k.low),
          close: parseFloat(k.close),
          volume: parseFloat(k.volume),
        }))
        const cf = buildCandleFootprints(rawTrades.current, rawKlines.current)
        setCandleFootprints(cf)
      }

      const result = buildFootprint(rawTrades.current, session, currentPrice, high24h, low24h, tickMultiplier, imbalanceThreshold)
      if (result) {
        result.priceChange24h = ticker24h.current.priceChange24h
        result.volume24h = ticker24h.current.volume24h
        setFp(result)
      } else {
        setError('No trade data for selected session/period')
      }

      setLastUpdate(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    }
    setLoading(false)
  }, [pair, session, viewMode, tickMultiplier, imbalanceThreshold, timeframe])

  // Recompute when session/tick/imbalance changes without re-fetching
  useEffect(() => {
    if (!rawTrades.current.length || !fp) return
    const result = buildFootprint(rawTrades.current, session, fp.currentPrice, fp.high24h, fp.low24h, tickMultiplier, imbalanceThreshold)
    if (result) {
      result.priceChange24h = ticker24h.current.priceChange24h
      result.volume24h = ticker24h.current.volume24h
      setFp(result)
    }
  }, [session, tickMultiplier, imbalanceThreshold])

  // Recompute candle footprints when timeframe or viewMode changes
  useEffect(() => {
    if (viewMode === 'candles') {
      loadData(pair, timeframe)
    }
  }, [viewMode, timeframe])

  useEffect(() => {
    loadData()
    const t = setInterval(() => loadData(), 30000)
    return () => clearInterval(t)
  }, [pair])

  const sessions: { id: Session; label: string; color: string }[] = [
    { id: 'all',    label: 'All',         color: '#00d4ff' },
    { id: 'asia',   label: 'Asia 21-8',   color: '#f59e0b' },
    { id: 'london', label: 'London 8-16', color: '#3b82f6' },
    { id: 'ny',     label: 'NY 13-21',    color: '#10b981' },
  ]

  const maxVol = fp ? Math.max(...fp.levels.map(l => l.totalVol), 0.0001) : 1
  const baseTick = fp ? getTickSize(fp.currentPrice) : 1
  const effectiveTick = baseTick * tickMultiplier

  // ── color bar helper ───────────────────────────────────────────────────────
  function getBarColors(lv: PriceLevel) {
    const heatOpacity = Math.min(0.6, (lv.totalVol / maxVol) * 0.8)
    const bidPct = lv.totalVol > 0 ? (lv.bidVol / lv.totalVol) * 100 : 50
    const askPct = 100 - bidPct

    if (colorScheme === 'delta') {
      const dColor = lv.delta >= 0 ? '#10b981' : '#ef4444'
      const dAlpha = Math.min(0.8, Math.abs(lv.delta) / (maxVol * 0.5 + 0.001))
      return { barBg: `rgba(${lv.delta >= 0 ? '16,185,129' : '239,68,68'},${dAlpha})`, bidPct, askPct, pct: (lv.totalVol / maxVol) * 100, heatOpacity }
    }
    if (colorScheme === 'proportion') {
      return { barBg: null, bidPct, askPct, pct: (lv.totalVol / maxVol) * 100, heatOpacity: 0.5 }
    }
    // heatmap default
    return { barBg: null, bidPct, askPct, pct: (lv.totalVol / maxVol) * 100, heatOpacity }
  }

  const totalCandleTrades = candleFootprints.reduce((s, c) => s + c.tradeCount, 0)

  return (
    <Sidebar>
      <div style={{ padding: '20px', maxWidth: '1400px', background: '#0a0a0f', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#e5e7eb' }}>
              <Activity size={26} color="#00d4ff" />
              Footprint & Order Flow
            </h1>
            <p style={{ margin: '3px 0 0', color: '#6b7280', fontSize: '12px' }}>
              Bid×Ask per level · Delta · Imbalance · CVD · Session filter
              {lastUpdate && <span> · Updated {lastUpdate}</span>}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View mode toggle */}
            <div style={{ display: 'flex', background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('ladder')}
                style={{
                  padding: '7px 14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold',
                  background: viewMode === 'ladder' ? '#00d4ff' : 'transparent',
                  color: viewMode === 'ladder' ? '#000' : '#9ca3af',
                }}>
                <List size={13} /> Ladder
              </button>
              <button
                onClick={() => setViewMode('candles')}
                style={{
                  padding: '7px 14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold',
                  background: viewMode === 'candles' ? '#00d4ff' : 'transparent',
                  color: viewMode === 'candles' ? '#000' : '#9ca3af',
                }}>
                <Grid size={13} /> Candles
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={{ padding: '7px 12px', background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', width: '120px' }}
              />
              {searchQuery && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1c1c2e', border: '1px solid #2a2a3e', borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 100 }}>
                  {filteredPairs.map(p => (
                    <div key={p} onClick={() => { setPair(p); setSearchQuery('') }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: pair === p ? '#2a2a3e' : 'transparent' }}>
                      <span style={{ color: '#e5e7eb', fontSize: 13 }}>{p}</span>
                      {customPairs.includes(p) && (
                        <Trash2 size={12} color="#ef4444" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); removePair(p) }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '7px 14px', background: '#1c1c2e', border: '1px solid #00d4ff', borderRadius: '8px', color: '#00d4ff', fontWeight: 'bold', fontSize: '14px' }}>
              {pair}
            </div>

            <button onClick={() => { setShowAdd(!showAdd); setAddError('') }}
              style={{ padding: '7px 10px', background: '#13131f', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', cursor: 'pointer' }}>
              <Plus size={15} />
            </button>

            {showAdd && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input value={newPair} onChange={e => setNewPair(e.target.value)}
                    placeholder="ACE/USDT" onKeyDown={e => e.key === 'Enter' && addPair()}
                    style={{ padding: '7px', background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', width: '100px' }} />
                  <button onClick={addPair} style={{ padding: '7px 12px', background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>OK</button>
                </div>
                {addError && <span style={{ color: '#ef4444', fontSize: '11px' }}>{addError}</span>}
              </div>
            )}

            <button onClick={() => loadData()} disabled={loading}
              style={{ padding: '7px 16px', background: loading ? '#1c1c2e' : 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} />
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#ef4444', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {loading && !fp && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading footprint data…</div>
        )}

        {fp && (
          <>
            {/* ── Summary Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '18px' }}>
              {[
                {
                  label: 'Current Price',
                  value: `$${fmtPrice(fp.currentPrice)}`,
                  sub: `${fp.priceChange24h >= 0 ? '+' : ''}${(fp.priceChange24h * 100).toFixed(2)}% 24h`,
                  subColor: fp.priceChange24h >= 0 ? '#10b981' : '#ef4444',
                  border: '#2a2a3e',
                },
                {
                  label: 'CVD Total',
                  value: `${fp.totalDelta >= 0 ? '+' : ''}${fmtVol(fp.totalDelta)}`,
                  sub: `${fp.deltaPercent.toFixed(1)}% net`,
                  valueColor: fp.totalDelta >= 0 ? '#10b981' : '#ef4444',
                  border: fp.totalDelta >= 0 ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)',
                },
                {
                  label: 'POC',
                  value: `$${fmtPrice(fp.poc)}`,
                  sub: 'Max volume level',
                  valueColor: '#f59e0b', border: 'rgba(245,158,11,0.4)',
                },
                {
                  label: 'VAH / VAL',
                  value: `$${fmtPrice(fp.vah)}`,
                  sub: `$${fmtPrice(fp.val)}`,
                  valueColor: '#3b82f6', subColor: '#3b82f6', border: 'rgba(59,130,246,0.4)',
                },
                {
                  label: 'Buy Volume',
                  value: `+${fmtVol(fp.totalBuy)}`,
                  sub: `${fp.tradeCount} trades`,
                  valueColor: '#10b981', border: 'rgba(16,185,129,0.3)',
                },
                {
                  label: 'Sell Volume',
                  value: `-${fmtVol(fp.totalSell)}`,
                  sub: `24h $${fmtUSD(fp.volume24h)}`,
                  valueColor: '#ef4444', border: 'rgba(239,68,68,0.3)',
                },
              ].map(c => (
                <div key={c.label} style={{ background: '#13131f', padding: '14px', borderRadius: '10px', border: `1px solid ${c.border}` }}>
                  <p style={{ margin: '0 0 4px', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: (c as any).valueColor || '#e5e7eb' }}>{c.value}</p>
                  {c.sub && <p style={{ margin: '2px 0 0', fontSize: '11px', color: (c as any).subColor || '#6b7280' }}>{c.sub}</p>}
                </div>
              ))}
            </div>

            {/* ── Controls Row ── */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Session tabs */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: '#6b7280', fontSize: '11px', marginRight: '2px' }}>Session:</span>
                {sessions.map(s => (
                  <button key={s.id} onClick={() => setSession(s.id)}
                    style={{
                      padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold',
                      background: session === s.id ? s.color : 'transparent',
                      color: session === s.id ? '#000' : s.color,
                      border: `1px solid ${s.color}`,
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {viewMode === 'ladder' && (
                <>
                  {/* Tick size */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>Tick:</span>
                    {([1, 5, 10, 25] as TickMultiplier[]).map(m => (
                      <button key={m} onClick={() => setTickMultiplier(m)}
                        style={{
                          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
                          background: tickMultiplier === m ? '#00d4ff' : '#13131f',
                          color: tickMultiplier === m ? '#000' : '#9ca3af',
                          border: `1px solid ${tickMultiplier === m ? '#00d4ff' : '#2a2a3e'}`,
                        }}>
                        {m}×
                      </button>
                    ))}
                  </div>

                  {/* Imbalance threshold */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>Imbal:</span>
                    {([2, 3, 4, 5] as ImbalanceThreshold[]).map(t => (
                      <button key={t} onClick={() => setImbalanceThreshold(t)}
                        style={{
                          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
                          background: imbalanceThreshold === t ? '#7c3aed' : '#13131f',
                          color: imbalanceThreshold === t ? '#fff' : '#9ca3af',
                          border: `1px solid ${imbalanceThreshold === t ? '#7c3aed' : '#2a2a3e'}`,
                        }}>
                        {t}×
                      </button>
                    ))}
                  </div>

                  {/* Color scheme */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>Color:</span>
                    {(['delta', 'heatmap', 'proportion'] as ColorScheme[]).map(cs => (
                      <button key={cs} onClick={() => setColorScheme(cs)}
                        style={{
                          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
                          background: colorScheme === cs ? '#1c1c2e' : 'transparent',
                          color: colorScheme === cs ? '#00d4ff' : '#6b7280',
                          border: `1px solid ${colorScheme === cs ? '#00d4ff' : '#2a2a3e'}`,
                        }}>
                        {cs.charAt(0).toUpperCase() + cs.slice(1)}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {viewMode === 'candles' && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>TF:</span>
                  {(['1m', '5m', '15m', '1h'] as Timeframe[]).map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)}
                      style={{
                        padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
                        background: timeframe === tf ? '#00d4ff' : '#13131f',
                        color: timeframe === tf ? '#000' : '#9ca3af',
                        border: `1px solid ${timeframe === tf ? '#00d4ff' : '#2a2a3e'}`,
                      }}>
                      {tf}
                    </button>
                  ))}
                </div>
              )}

              <span style={{ alignSelf: 'center', color: '#4b5563', fontSize: '11px', marginLeft: 'auto' }}>
                {fp.tradeCount} trades loaded
              </span>
            </div>

            {/* ── Main Grid: Content + Right Panel ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>

              {/* ── LADDER MODE ── */}
              {viewMode === 'ladder' && (
                <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', overflow: 'hidden' }}>
                  {/* Column headers */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 60px 1fr 60px 70px 45px 55px',
                    gap: '4px', padding: '9px 14px',
                    background: '#0a0a0f', borderBottom: '1px solid #2a2a3e',
                    fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    <span>Price</span>
                    <span style={{ textAlign: 'right', color: '#ef4444' }}>Bid</span>
                    <span style={{ textAlign: 'center' }}>Volume Bar</span>
                    <span style={{ color: '#10b981' }}>Ask</span>
                    <span style={{ textAlign: 'right' }}>Delta</span>
                    <span style={{ textAlign: 'center' }}>Imbal</span>
                    <span style={{ textAlign: 'center' }}># Trades</span>
                  </div>

                  <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
                    {fp.levels.map(lv => {
                      const { bidPct, askPct, pct, heatOpacity } = getBarColors(lv)
                      const isNow = Math.abs(lv.price - fp.currentPrice) < effectiveTick * 1.5

                      let rowBg = `rgba(255,255,255,${heatOpacity * 0.03})`
                      if (lv.isPOC)                  rowBg = 'rgba(245,158,11,0.12)'
                      else if (lv.isAbsorption)      rowBg = 'rgba(139,92,246,0.10)'
                      else if (lv.isStackedImbalance && lv.imbalance === 'ask') rowBg = 'rgba(16,185,129,0.10)'
                      else if (lv.isStackedImbalance && lv.imbalance === 'bid') rowBg = 'rgba(239,68,68,0.10)'
                      else if (lv.imbalance === 'ask') rowBg = 'rgba(16,185,129,0.06)'
                      else if (lv.imbalance === 'bid') rowBg = 'rgba(239,68,68,0.06)'
                      else if (lv.inValueArea)       rowBg = 'rgba(59,130,246,0.04)'

                      const leftBorder =
                        lv.isPOC         ? '3px solid #f59e0b' :
                        isNow            ? '3px solid #00d4ff' :
                        lv.isAbsorption  ? '3px solid #8b5cf6' :
                        lv.inValueArea   ? '3px solid rgba(59,130,246,0.5)' :
                        '3px solid transparent'

                      return (
                        <div key={lv.price} style={{
                          display: 'grid',
                          gridTemplateColumns: '110px 60px 1fr 60px 70px 45px 55px',
                          gap: '4px', padding: '2px 14px',
                          background: rowBg,
                          borderLeft: leftBorder,
                          borderBottom: '1px solid rgba(42,42,62,0.4)',
                          alignItems: 'center', fontSize: '12px',
                        }}>
                          {/* Price + badges */}
                          <span style={{ fontWeight: lv.isPOC || isNow ? 'bold' : 'normal', color: lv.isPOC ? '#f59e0b' : isNow ? '#00d4ff' : '#d1d5db', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                            ${fmtPrice(lv.price)}
                            {lv.isPOC && <span style={{ fontSize: '8px', background: '#f59e0b', color: '#000', padding: '1px 3px', borderRadius: '2px', lineHeight: 1.2 }}>POC</span>}
                            {isNow && !lv.isPOC && <span style={{ fontSize: '8px', background: '#00d4ff', color: '#000', padding: '1px 3px', borderRadius: '2px', lineHeight: 1.2 }}>NOW</span>}
                            {lv.isAbsorption && <span style={{ fontSize: '8px', background: '#8b5cf6', color: '#fff', padding: '1px 3px', borderRadius: '2px', lineHeight: 1.2 }}>ABS</span>}
                            {lv.isStackedImbalance && <span style={{ fontSize: '8px', background: lv.imbalance === 'ask' ? '#10b981' : '#ef4444', color: '#fff', padding: '1px 3px', borderRadius: '2px', lineHeight: 1.2 }}>STACK</span>}
                          </span>

                          {/* Bid vol */}
                          <span style={{ textAlign: 'right', color: '#ef4444', fontWeight: lv.imbalance === 'bid' ? 'bold' : 'normal', fontSize: '11px' }}>
                            {fmtVol(lv.bidVol)}
                          </span>

                          {/* Volume bar */}
                          <div style={{ height: '12px', background: '#0a0a0f', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                            {colorScheme === 'delta' ? (
                              <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0,
                                width: `${pct}%`,
                                background: lv.delta >= 0
                                  ? `rgba(16,185,129,${0.3 + heatOpacity * 0.5})`
                                  : `rgba(239,68,68,${0.3 + heatOpacity * 0.5})`,
                              }} />
                            ) : (
                              <>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(bidPct / 100) * pct}%`, background: `rgba(239,68,68,${0.3 + heatOpacity * 0.5})` }} />
                                <div style={{ position: 'absolute', left: `${(bidPct / 100) * pct}%`, top: 0, bottom: 0, width: `${(askPct / 100) * pct}%`, background: `rgba(16,185,129,${0.3 + heatOpacity * 0.5})` }} />
                              </>
                            )}
                          </div>

                          {/* Ask vol */}
                          <span style={{ color: '#10b981', fontWeight: lv.imbalance === 'ask' ? 'bold' : 'normal', fontSize: '11px' }}>
                            {fmtVol(lv.askVol)}
                          </span>

                          {/* Delta */}
                          <span style={{ textAlign: 'right', color: lv.delta >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '11px' }}>
                            {lv.delta >= 0 ? '+' : ''}{fmtVol(lv.delta)}
                          </span>

                          {/* Imbalance arrow */}
                          <span style={{ textAlign: 'center', fontSize: '14px', color: lv.imbalance === 'ask' ? '#10b981' : '#ef4444' }}>
                            {lv.imbalance === 'ask' ? '▲' : lv.imbalance === 'bid' ? '▼' : ''}
                          </span>

                          {/* Trade count */}
                          <span style={{ textAlign: 'center', fontSize: '10px', color: '#6b7280' }}>
                            {lv.tradeCount}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── CANDLES MODE ── */}
              {viewMode === 'candles' && (
                <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', padding: '16px', overflowX: 'auto' }}>
                  {candleFootprints.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      {loading ? 'Loading candle data…' : 'No candle footprint data available'}
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#e5e7eb' }}>
                          Candle Footprint — {timeframe} ({candleFootprints.length} candles)
                        </span>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>
                          Based on last {rawTrades.current.length} trades
                        </span>
                      </div>

                      {/* Candle columns */}
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: 8 }}>
                        {candleFootprints.map((cf, ci) => {
                          const cfMaxVol = Math.max(...cf.levels.map(l => l.totalVol), 0.0001)
                          const isBull = cf.candle.close >= cf.candle.open
                          const candleColor = isBull ? '#10b981' : '#ef4444'

                          return (
                            <div key={cf.candle.time} style={{ flexShrink: 0, width: 110, background: '#0a0a0f', borderRadius: 8, border: '1px solid #2a2a3e', overflow: 'hidden' }}>
                              {/* Candle header: time + OHLC mini bar */}
                              <div style={{ background: '#13131f', padding: '6px 8px', borderBottom: '1px solid #2a2a3e' }}>
                                <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>{fmtTime(cf.candle.time)}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <MiniCandle candle={cf.candle} height={32} />
                                  <div style={{ fontSize: 9, color: '#9ca3af', lineHeight: 1.5 }}>
                                    <div style={{ color: candleColor }}>O {fmtPrice(cf.candle.open)}</div>
                                    <div>H {fmtPrice(cf.candle.high)}</div>
                                    <div>L {fmtPrice(cf.candle.low)}</div>
                                    <div style={{ color: candleColor }}>C {fmtPrice(cf.candle.close)}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Price levels */}
                              <div style={{ padding: '4px 0' }}>
                                {cf.levels.map(lv => {
                                  const lvPct = (lv.totalVol / cfMaxVol) * 100
                                  const bidFrac = lv.totalVol > 0 ? lv.bidVol / lv.totalVol : 0.5
                                  return (
                                    <div key={lv.price} style={{
                                      padding: '1px 6px',
                                      background: lv.isPOC ? 'rgba(245,158,11,0.15)' : 'transparent',
                                      borderLeft: lv.isPOC ? '2px solid #f59e0b' : '2px solid transparent',
                                    }}>
                                      <div style={{ fontSize: 9, color: lv.isPOC ? '#f59e0b' : '#6b7280', marginBottom: 1, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{fmtPrice(lv.price)}{lv.isPOC ? ' POC' : ''}</span>
                                      </div>
                                      <div style={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 1 }}>
                                        <span style={{ fontSize: 8, color: '#ef4444', width: 26, textAlign: 'right' }}>{fmtVol(lv.bidVol)}</span>
                                        <div style={{ flex: 1, height: 5, background: '#1c1c2e', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${bidFrac * lvPct}%`, background: 'rgba(239,68,68,0.6)' }} />
                                          <div style={{ position: 'absolute', left: `${bidFrac * lvPct}%`, top: 0, bottom: 0, width: `${(1 - bidFrac) * lvPct}%`, background: 'rgba(16,185,129,0.6)' }} />
                                        </div>
                                        <span style={{ fontSize: 8, color: '#10b981', width: 26 }}>{fmtVol(lv.askVol)}</span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Delta bar at bottom */}
                              <div style={{ borderTop: '1px solid #2a2a3e', padding: '6px 8px', background: '#0d0d18' }}>
                                <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 3 }}>Delta</div>
                                <div style={{ height: 6, background: '#1c1c2e', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${Math.min(100, Math.abs(cf.totalDelta) / Math.max(cf.totalBuy + cf.totalSell, 0.001) * 100)}%`,
                                    background: cf.totalDelta >= 0 ? '#10b981' : '#ef4444',
                                    borderRadius: 3,
                                  }} />
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 'bold', color: cf.totalDelta >= 0 ? '#10b981' : '#ef4444', textAlign: 'center' }}>
                                  {cf.totalDelta >= 0 ? '+' : ''}{fmtVol(cf.totalDelta)}
                                </div>
                                <div style={{ fontSize: 9, color: '#4b5563', textAlign: 'center', marginTop: 2 }}>
                                  {cf.tradeCount} trades
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* CVD line across all candles */}
                      <CandleCVDChart candles={candleFootprints} />
                    </>
                  )}
                </div>
              )}

              {/* Right Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* CVD sparkline */}
                <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#e5e7eb' }}>CVD</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: fp.totalDelta >= 0 ? '#10b981' : '#ef4444' }}>
                      {fp.totalDelta >= 0 ? '+' : ''}{fmtVol(fp.totalDelta)}
                    </span>
                  </div>
                  <CVDChart data={fp.cvd} />
                  <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#6b7280' }}>Cumulative Volume Delta (buy − sell)</p>
                </div>

                {/* 24h Range minimap */}
                <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '13px', color: '#e5e7eb' }}>24h Range</p>
                  {(() => {
                    const range = fp.high24h - fp.low24h || 1
                    const pricePct = Math.max(0, Math.min(100, ((fp.high24h - fp.currentPrice) / range) * 100))
                    const pocPct   = Math.max(0, Math.min(100, ((fp.high24h - fp.poc) / range) * 100))
                    const vahPct   = Math.max(0, Math.min(100, ((fp.high24h - fp.vah) / range) * 100))
                    const valPct   = Math.max(0, Math.min(100, ((fp.high24h - fp.val) / range) * 100))
                    return (
                      <div style={{ position: 'relative', height: '140px' }}>
                        <div style={{ position: 'absolute', left: '45%', top: 0, bottom: 0, width: '10%', background: '#1c1c2e', borderRadius: '4px' }} />
                        <div style={{
                          position: 'absolute', left: '40%', width: '20%',
                          background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.5)', borderRadius: '3px',
                          top: `${vahPct}%`, height: `${Math.max(valPct - vahPct, 2)}%`,
                        }} />
                        <div style={{ position: 'absolute', left: '36%', right: '36%', height: '2px', background: '#f59e0b', top: `${pocPct}%` }} />
                        <div style={{ position: 'absolute', left: '36%', right: '36%', height: '2px', background: '#00d4ff', top: `${pricePct}%` }} />
                        <span style={{ position: 'absolute', right: 0, top: 0, fontSize: '10px', color: '#6b7280' }}>H ${fmtPrice(fp.high24h)}</span>
                        <span style={{ position: 'absolute', right: 0, bottom: 0, fontSize: '10px', color: '#6b7280' }}>L ${fmtPrice(fp.low24h)}</span>
                        <span style={{ position: 'absolute', right: 0, top: `${pocPct}%`, fontSize: '10px', color: '#f59e0b', transform: 'translateY(-50%)' }}>POC</span>
                        <span style={{ position: 'absolute', right: 0, top: `${Math.max(5, Math.min(90, pricePct))}%`, fontSize: '10px', color: '#00d4ff', transform: 'translateY(-50%)' }}>▶ Now</span>
                        <span style={{ position: 'absolute', left: 0, top: `${vahPct}%`, fontSize: '9px', color: '#3b82f6', transform: 'translateY(-50%)' }}>VAH</span>
                        <span style={{ position: 'absolute', left: 0, top: `${valPct}%`, fontSize: '9px', color: '#3b82f6', transform: 'translateY(-50%)' }}>VAL</span>
                      </div>
                    )
                  })()}
                </div>

                {/* Legend */}
                <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 'bold', fontSize: '13px', color: '#e5e7eb' }}>Legend</p>
                  {[
                    { color: '#f59e0b', label: 'POC — max volume level' },
                    { color: '#00d4ff', label: 'Current Price' },
                    { color: '#3b82f6', label: 'Value Area (70% vol)' },
                    { color: '#10b981', label: '▲ Ask Imbalance' },
                    { color: '#ef4444', label: '▼ Bid Imbalance' },
                    { color: '#8b5cf6', label: 'ABS — Absorption' },
                    { color: '#10b981', label: 'STACK — Stacked Imbalance' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '10px', height: '10px', background: item.color, borderRadius: '2px', flexShrink: 0 }} />
                      <span style={{ color: '#9ca3af', fontSize: '11px' }}>{item.label}</span>
                    </div>
                  ))}
                  <hr style={{ border: 'none', borderTop: '1px solid #2a2a3e', margin: '10px 0' }} />
                  <p style={{ margin: 0, fontSize: '10px', color: '#4b5563', lineHeight: 1.6 }}>
                    Bid = sell aggressor (market sell)<br />
                    Ask = buy aggressor (market buy)<br />
                    Delta = Ask − Bid per level<br />
                    ABS: high vol, tiny delta<br />
                    STACK: 3+ consecutive imbalance<br />
                    Bar color: {colorScheme}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Sidebar>
  )
}
