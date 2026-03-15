'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { Activity, RefreshCw, Plus, Trash2 } from 'lucide-react'

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

interface PriceLevel {
  price: number
  bidVol: number   // sell aggressor (buyerMaker=true)
  askVol: number   // buy aggressor (buyerMaker=false)
  totalVol: number
  delta: number
  imbalance: 'bid' | 'ask' | null
  isPOC: boolean
  inValueArea: boolean
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
  priceChange24h: number // raw decimal e.g. 0.0129
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
  if (!v) return '—'
  const a = Math.abs(v)
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
  trades: any[], session: Session,
  currentPrice: number, high24h: number, low24h: number,
): FootprintState | null {
  if (!trades.length || !currentPrice) return null

  const { start, end } = sessionRange(session)
  const filtered = session === 'all' ? trades : trades.filter(t => t.time >= start && t.time <= end)
  if (!filtered.length) return null

  const tick = getTickSize(currentPrice)
  const levelMap = new Map<number, { bid: number; ask: number }>()
  let totalBuy = 0, totalSell = 0
  const cvd: number[] = []
  let running = 0

  filtered.forEach((t: any) => {
    const qty = parseFloat(t.qty)
    const price = parseFloat(t.price)
    const lp = Math.round(price / tick) * tick

    if (!levelMap.has(lp)) levelMap.set(lp, { bid: 0, ask: 0 })
    const lv = levelMap.get(lp)!

    if (t.buyerMaker) {
      // seller is taker → sell aggressor → bid side
      lv.bid += qty; totalSell += qty; running -= qty
    } else {
      // buyer is taker → buy aggressor → ask side
      lv.ask += qty; totalBuy += qty; running += qty
    }
    cvd.push(running)
  })

  if (!levelMap.size) return null

  // Sort descending (highest price first)
  const prices = Array.from(levelMap.keys()).sort((a, b) => b - a)

  // Find POC
  let pocPrice = prices[0], maxVol = 0
  prices.forEach(p => {
    const { bid, ask } = levelMap.get(p)!
    if (bid + ask > maxVol) { maxVol = bid + ask; pocPrice = p }
  })

  // Value Area (70%)
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

  const IMBAL = 3.0

  const levels: PriceLevel[] = prices.map(p => {
    const { bid, ask } = levelMap.get(p)!
    const total = bid + ask
    const delta = ask - bid
    let imbalance: 'bid' | 'ask' | null = null
    if (bid > 0 && ask / bid >= IMBAL) imbalance = 'ask'
    else if (ask > 0 && bid / ask >= IMBAL) imbalance = 'bid'
    return {
      price: p, bidVol: bid, askVol: ask, totalVol: total, delta, imbalance,
      isPOC: p === pocPrice,
      inValueArea: p <= vah && p >= val,
    }
  })

  const totalDelta = totalBuy - totalSell
  const deltaPercent = totalVol > 0 ? (totalDelta / totalVol) * 100 : 0

  return {
    levels, poc: pocPrice, vah, val,
    totalBuy, totalSell, totalDelta, deltaPercent, cvd,
    currentPrice, high24h, low24h,
    volume24h: 0, priceChange24h: 0, tradeCount: filtered.length,
  }
}

// ── CVD sparkline ──────────────────────────────────────────────────────────────

function CVDChart({ data }: { data: number[] }) {
  if (data.length < 2) return <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: 12 }}>No CVD data</div>
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

// ── main component ─────────────────────────────────────────────────────────────

export default function FootprintPage() {
  const [pair, setPair] = useState('BTC/USDT')
  const [session, setSession] = useState<Session>('all')
  const [fp, setFp] = useState<FootprintState | null>(null)
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

  useEffect(() => {
    const s = localStorage.getItem('footprintCustomPairs')
    if (s) setCustomPairs(JSON.parse(s))
  }, [])

  const saveCustom = (pairs: string[]) => {
    setCustomPairs(pairs)
    localStorage.setItem('footprintCustomPairs', JSON.stringify(pairs))
  }

  const addPair = () => {
    setAddError('')
    const p = newPair.toUpperCase().trim()
    const formatted = p.includes('/') ? p : p.replace('USDT', '/USDT')
    if (!formatted.endsWith('/USDT')) { setAddError('Must end with USDT'); return }
    saveCustom([...customPairs, formatted])
    setNewPair(''); setShowAdd(false)
  }

  const removePair = (p: string) => {
    saveCustom(customPairs.filter(x => x !== p))
    if (pair === p) setPair('BTC/USDT')
  }

  const allPairs = [...AVAILABLE_PAIRS, ...customPairs]
  const filteredPairs = allPairs.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))

  const loadData = useCallback(async (target = pair) => {
    setLoading(true); setError('')
    try {
      let sym = target.replace('/', '')
      sym = SYMBOL_MAP[sym] || sym
      const proxy = sym.replace('USDT', '-USDT')

      const [tickerRes, tradesRes] = await Promise.all([
        fetch(`${API_URL}/proxy/ticker/${proxy}`),
        fetch(`${API_URL}/proxy/trades/${proxy}?limit=1000`),
      ])
      const [td, rd] = await Promise.all([tickerRes.json(), tradesRes.json()])

      const tk = td.data || {}
      const currentPrice = parseFloat(tk.lastPrice) || 0
      const high24h     = parseFloat(tk.highPrice) || 0
      const low24h      = parseFloat(tk.lowPrice) || 0

      ticker24h.current = {
        priceChange24h: parseFloat(tk.priceChangePercent) || 0,
        volume24h: (parseFloat(tk.volume) || 0) * currentPrice,
      }

      rawTrades.current = rd.data || []
      const result = buildFootprint(rawTrades.current, session, currentPrice, high24h, low24h)
      if (result) {
        result.priceChange24h = ticker24h.current.priceChange24h
        result.volume24h = ticker24h.current.volume24h
        setFp(result)
      } else {
        setError('No trade data for selected session/period')
      }
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    }
    setLoading(false)
  }, [pair, session])

  // Recompute when session changes without re-fetching
  useEffect(() => {
    if (!rawTrades.current.length || !fp) return
    const result = buildFootprint(rawTrades.current, session, fp.currentPrice, fp.high24h, fp.low24h)
    if (result) {
      result.priceChange24h = ticker24h.current.priceChange24h
      result.volume24h = ticker24h.current.volume24h
      setFp(result)
    }
  }, [session])

  useEffect(() => {
    loadData()
    const t = setInterval(() => loadData(), 30000)
    return () => clearInterval(t)
  }, [pair])

  const sessions: { id: Session; label: string; color: string }[] = [
    { id: 'all',    label: 'All (24h)',           color: '#00d4ff' },
    { id: 'asia',   label: '🌏 Asia 21-8 UTC',   color: '#f59e0b' },
    { id: 'london', label: '🇬🇧 London 8-16 UTC', color: '#3b82f6' },
    { id: 'ny',     label: '🗽 NY 13-21 UTC',     color: '#10b981' },
  ]

  const maxVol = fp ? Math.max(...fp.levels.map(l => l.totalVol), 0.0001) : 1
  const tick = fp ? getTickSize(fp.currentPrice) : 1

  return (
    <Sidebar>
      <div style={{ padding: '20px', maxWidth: '1300px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={26} color="#00d4ff" />
              Footprint & Order Flow
            </h1>
            <p style={{ margin: '3px 0 0', color: '#6b7280', fontSize: '12px' }}>
              Bid×Ask per level · Delta · Imbalance ≥3× · CVD · Session filter
              {lastUpdate && <span> · Updated {lastUpdate}</span>}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..." style={{ padding: '7px 12px', background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', width: '120px' }} />
              {searchQuery && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1c1c2e', border: '1px solid #2a2a3e', borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 100 }}>
                  {filteredPairs.map(p => (
                    <div key={p} onClick={() => { setPair(p); setSearchQuery('') }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: pair === p ? '#2a2a3e' : 'transparent' }}>
                      <span>{p}</span>
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
                  label: 'CVD Delta',
                  value: `${fp.totalDelta >= 0 ? '+' : ''}${fmtVol(fp.totalDelta)}`,
                  sub: `${fp.deltaPercent.toFixed(1)}% net`,
                  valueColor: fp.totalDelta >= 0 ? '#10b981' : '#ef4444',
                  border: fp.totalDelta >= 0 ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)',
                },
                {
                  label: 'POC',
                  value: `$${fmtPrice(fp.poc)}`,
                  sub: 'Max volume level',
                  valueColor: '#f59e0b', border: '#f59e0b',
                },
                {
                  label: 'VAH / VAL',
                  value: `$${fmtPrice(fp.vah)}`,
                  sub: `$${fmtPrice(fp.val)}`,
                  valueColor: '#3b82f6', subColor: '#3b82f6', border: '#3b82f6',
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
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: c.valueColor || '#e5e7eb' }}>{c.value}</p>
                  {c.sub && <p style={{ margin: '2px 0 0', fontSize: '11px', color: c.subColor || '#6b7280' }}>{c.sub}</p>}
                </div>
              ))}
            </div>

            {/* ── Session Tabs ── */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {sessions.map(s => (
                <button key={s.id} onClick={() => setSession(s.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
                    background: session === s.id ? s.color : 'transparent',
                    color: session === s.id ? '#000' : s.color,
                    border: `1px solid ${s.color}`,
                  }}>
                  {s.label}
                </button>
              ))}
              <span style={{ alignSelf: 'center', color: '#4b5563', fontSize: '11px', marginLeft: '4px' }}>
                {fp.tradeCount} trades loaded
              </span>
            </div>

            {/* ── Main Grid: Ladder + Right Panel ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>

              {/* Footprint Ladder */}
              <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', overflow: 'hidden' }}>
                {/* Column headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 65px 1fr 65px 75px 50px',
                  gap: '4px', padding: '9px 14px',
                  background: '#0a0a0f', borderBottom: '1px solid #2a2a3e',
                  fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  <span>Price</span>
                  <span style={{ textAlign: 'right', color: '#ef4444' }}>Bid Vol</span>
                  <span style={{ textAlign: 'center' }}>Volume Bar</span>
                  <span style={{ color: '#10b981' }}>Ask Vol</span>
                  <span style={{ textAlign: 'right' }}>Delta</span>
                  <span style={{ textAlign: 'center' }}>Imbal</span>
                </div>

                <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
                  {fp.levels.map(lv => {
                    const pct = (lv.totalVol / maxVol) * 100
                    const bidPct = lv.totalVol > 0 ? (lv.bidVol / lv.totalVol) * 100 : 50
                    const askPct = 100 - bidPct
                    const isNow = Math.abs(lv.price - fp.currentPrice) < tick * 1.5
                    const heatOpacity = Math.min(0.6, (lv.totalVol / maxVol) * 0.8)

                    let rowBg = `rgba(255,255,255,${heatOpacity * 0.03})`
                    if (lv.isPOC)            rowBg = 'rgba(245,158,11,0.10)'
                    else if (lv.imbalance === 'ask') rowBg = 'rgba(16,185,129,0.07)'
                    else if (lv.imbalance === 'bid') rowBg = 'rgba(239,68,68,0.07)'
                    else if (lv.inValueArea) rowBg = 'rgba(59,130,246,0.04)'

                    const leftBorder =
                      lv.isPOC     ? '3px solid #f59e0b' :
                      isNow        ? '3px solid #00d4ff' :
                      lv.inValueArea ? '3px solid rgba(59,130,246,0.5)' :
                      '3px solid transparent'

                    return (
                      <div key={lv.price} style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 65px 1fr 65px 75px 50px',
                        gap: '4px', padding: '3px 14px',
                        background: rowBg,
                        borderLeft: leftBorder,
                        borderBottom: '1px solid rgba(42,42,62,0.4)',
                        alignItems: 'center', fontSize: '12px',
                      }}>
                        {/* Price + badges */}
                        <span style={{ fontWeight: lv.isPOC || isNow ? 'bold' : 'normal', color: lv.isPOC ? '#f59e0b' : isNow ? '#00d4ff' : '#d1d5db', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ${fmtPrice(lv.price)}
                          {lv.isPOC && <span style={{ fontSize: '8px', background: '#f59e0b', color: '#000', padding: '1px 3px', borderRadius: '2px', lineHeight: 1.2 }}>POC</span>}
                          {isNow && !lv.isPOC && <span style={{ fontSize: '8px', background: '#00d4ff', color: '#000', padding: '1px 3px', borderRadius: '2px', lineHeight: 1.2 }}>NOW</span>}
                        </span>

                        {/* Bid vol */}
                        <span style={{ textAlign: 'right', color: '#ef4444', fontWeight: lv.imbalance === 'bid' ? 'bold' : 'normal', fontSize: '11px' }}>
                          {fmtVol(lv.bidVol)}
                        </span>

                        {/* Volume heatmap bar: bid(red)|ask(green), width = volume intensity */}
                        <div style={{ height: '12px', background: '#0a0a0f', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(bidPct / 100) * pct}%`, background: `rgba(239,68,68,${0.3 + heatOpacity * 0.5})` }} />
                          <div style={{ position: 'absolute', left: `${(bidPct / 100) * pct}%`, top: 0, bottom: 0, width: `${(askPct / 100) * pct}%`, background: `rgba(16,185,129,${0.3 + heatOpacity * 0.5})` }} />
                        </div>

                        {/* Ask vol */}
                        <span style={{ color: '#10b981', fontWeight: lv.imbalance === 'ask' ? 'bold' : 'normal', fontSize: '11px' }}>
                          {fmtVol(lv.askVol)}
                        </span>

                        {/* Delta */}
                        <span style={{ textAlign: 'right', color: lv.delta >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '11px' }}>
                          {lv.delta >= 0 ? '+' : ''}{fmtVol(lv.delta)}
                        </span>

                        {/* Imbalance arrows */}
                        <span style={{ textAlign: 'center', fontSize: '14px', color: lv.imbalance === 'ask' ? '#10b981' : '#ef4444' }}>
                          {lv.imbalance === 'ask' ? '▲' : lv.imbalance === 'bid' ? '▼' : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* CVD */}
                <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px' }}>CVD</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: fp.totalDelta >= 0 ? '#10b981' : '#ef4444' }}>
                      {fp.totalDelta >= 0 ? '+' : ''}{fmtVol(fp.totalDelta)}
                    </span>
                  </div>
                  <CVDChart data={fp.cvd} />
                  <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#6b7280' }}>Cumulative Volume Delta (buy − sell aggression)</p>
                </div>

                {/* 24h Range minimap */}
                <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '13px' }}>24h Range</p>
                  {(() => {
                    const range = fp.high24h - fp.low24h || 1
                    const pricePct = Math.max(0, Math.min(100, ((fp.high24h - fp.currentPrice) / range) * 100))
                    const pocPct   = Math.max(0, Math.min(100, ((fp.high24h - fp.poc) / range) * 100))
                    const vahPct   = Math.max(0, Math.min(100, ((fp.high24h - fp.vah) / range) * 100))
                    const valPct   = Math.max(0, Math.min(100, ((fp.high24h - fp.val) / range) * 100))
                    return (
                      <div style={{ position: 'relative', height: '130px' }}>
                        {/* Track */}
                        <div style={{ position: 'absolute', left: '45%', top: 0, bottom: 0, width: '10%', background: '#1c1c2e', borderRadius: '4px' }} />
                        {/* Value Area */}
                        <div style={{
                          position: 'absolute', left: '40%', width: '20%',
                          background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.6)', borderRadius: '3px',
                          top: `${vahPct}%`, height: `${valPct - vahPct}%`,
                        }} />
                        {/* POC line */}
                        <div style={{ position: 'absolute', left: '38%', right: '38%', height: '2px', background: '#f59e0b', top: `${pocPct}%` }} />
                        {/* Current price */}
                        <div style={{ position: 'absolute', left: '38%', right: '38%', height: '2px', background: '#00d4ff', top: `${pricePct}%` }} />
                        {/* Labels */}
                        <span style={{ position: 'absolute', right: 0, top: 0, fontSize: '10px', color: '#6b7280' }}>H ${fmtPrice(fp.high24h)}</span>
                        <span style={{ position: 'absolute', right: 0, bottom: 0, fontSize: '10px', color: '#6b7280' }}>L ${fmtPrice(fp.low24h)}</span>
                        <span style={{ position: 'absolute', right: 0, top: `${pocPct}%`, fontSize: '10px', color: '#f59e0b', transform: 'translateY(-50%)' }}>POC</span>
                        <span style={{ position: 'absolute', right: 0, top: `${Math.min(90, pricePct)}%`, fontSize: '10px', color: '#00d4ff', transform: 'translateY(-50%)' }}>▶ Now</span>
                      </div>
                    )
                  })()}
                </div>

                {/* Legend */}
                <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 'bold', fontSize: '13px' }}>Legend</p>
                  {[
                    { color: '#f59e0b', label: 'POC — max volume level' },
                    { color: '#00d4ff', label: 'Current Price' },
                    { color: '#3b82f6', label: 'Value Area (70% vol)' },
                    { color: '#10b981', label: '▲ Ask Imbalance (ask/bid ≥3×)' },
                    { color: '#ef4444', label: '▼ Bid Imbalance (bid/ask ≥3×)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                      <div style={{ width: '10px', height: '10px', background: item.color, borderRadius: '2px', flexShrink: 0 }} />
                      <span style={{ color: '#9ca3af', fontSize: '11px' }}>{item.label}</span>
                    </div>
                  ))}
                  <hr style={{ border: 'none', borderTop: '1px solid #2a2a3e', margin: '10px 0' }} />
                  <p style={{ margin: 0, fontSize: '10px', color: '#4b5563' }}>
                    Bid = sell aggressor (market sell)<br />
                    Ask = buy aggressor (market buy)<br />
                    Delta = Ask − Bid per level<br />
                    Bar color intensity = volume heat
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
