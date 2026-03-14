'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { Search, Play, RefreshCw, Clock, Zap, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const API_URL = 'https://cryptotraderai-api.onrender.com'

const ALL_PAIRS = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'BNB/USDT',
  'DOT/USDT', 'ADA/USDT', 'LINK/USDT', 'POL/USDT', 'XRP/USDT'
]

interface ScreenerResult {
  pair: string
  price: number
  change24h: number
  volume24h: number
  rsi: number
  trend: 'bullish' | 'bearish' | 'neutral'
  signal: string
  confidence: number
  score: number
}

function getKillZone() {
  const now = new Date()
  const hour = (now.getUTCHours() + 3) % 24
  if (hour >= 20 || hour < 8) return { name: 'Asian', color: '#f59e0b', active: true }
  if (hour >= 13 && hour < 21) return { name: 'New York', color: '#10b981', active: true }
  if (hour >= 8 && hour < 16) return { name: 'London', color: '#3b82f6', active: true }
  return { name: 'None', color: '#6b7280', active: false }
}

async function fetchBinancePrice(symbol: string): Promise<{ price: number; change24h: number; volume: number } | null> {
  try {
    const bingxSymbol = symbol.replace('/', '-').replace('USDT', '-USDT').replace('--', '-')
    const res = await fetch(`https://open-api.bingx.com/openApi/spot/v1/ticker/24hr?symbol=${bingxSymbol}`)
    const json = await res.json()
    const data = json.data
    if (!data) return null
    return {
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.volume),
    }
  } catch {
    return null
  }
}

function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) gains += diff
    else losses -= diff
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return Math.round(100 - 100 / (1 + rs))
}

async function analyzeRSI(symbol: string): Promise<number> {
  try {
    const bingxSymbol = symbol.replace('/', '-').replace('USDT', '-USDT').replace('--', '-')
    const res = await fetch(`https://open-api.bingx.com/openApi/market/his/v1/kline?symbol=${bingxSymbol}&interval=4h&limit=30`)
    const json = await res.json()
    const klines = json.data || []
    const closes = klines.map((k: any) => parseFloat(k.close))
  } catch {
    return 50
  }
}

function scoreResult(rsi: number, change24h: number, confidence: number): number {
  let score = 0
  if (rsi < 35) score += 30
  else if (rsi > 65) score += 30
  else score += 10
  if (Math.abs(change24h) > 3) score += 20
  else if (Math.abs(change24h) > 1) score += 10
  score += Math.round(confidence * 0.5)
  return Math.min(100, score)
}

export default function ScreenerPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeframe, setTimeframe] = useState('4H')
  const [minScore, setMinScore] = useState(30)
  const [results, setResults] = useState<ScreenerResult[]>([])
  const [lastRun, setLastRun] = useState<Date | undefined>(undefined)
  const [autoScreener, setAutoScreener] = useState(false)
  const [killZone, setKillZone] = useState(getKillZone())
  const [progress, setProgress] = useState(0)

  // Загрузка настроек из localStorage при старте
  useEffect(() => {
    const tf = localStorage.getItem('screener_tf')
    const score = localStorage.getItem('screener_score')
    const auto = localStorage.getItem('screener_auto')
    if (tf) setTimeframe(tf)
    if (score) setMinScore(Number(score))
    if (auto) setAutoScreener(auto === 'true')
  }, [])

  // Сохранение при изменении
  useEffect(() => { localStorage.setItem('screener_tf', timeframe) }, [timeframe])
  useEffect(() => { localStorage.setItem('screener_score', String(minScore)) }, [minScore])
  useEffect(() => { localStorage.setItem('screener_auto', String(autoScreener)) }, [autoScreener])

  useEffect(() => {
    const interval = setInterval(() => setKillZone(getKillZone()), 60000)
    return () => clearInterval(interval)
  }, [])

  const runScreener = useCallback(async () => {
    setIsRunning(true)
    setResults([])
    setProgress(0)

    const newResults: ScreenerResult[] = []

    for (let i = 0; i < ALL_PAIRS.length; i++) {
      const pair = ALL_PAIRS[i]
      setProgress(Math.round((i / ALL_PAIRS.length) * 100))

      const [ticker, rsi] = await Promise.all([
        fetchBinancePrice(pair),
        analyzeRSI(pair),
      ])

      if (!ticker) continue

      const trend: 'bullish' | 'bearish' | 'neutral' =
        rsi > 55 && ticker.change24h > 0 ? 'bullish' :
        rsi < 45 && ticker.change24h < 0 ? 'bearish' : 'neutral'

      const signal = rsi < 35 ? 'LONG' : rsi > 65 ? 'SHORT' : '—'
      const confidence = signal !== '—' ? Math.min(95, 60 + Math.abs(50 - rsi)) : 0
      const score = scoreResult(rsi, ticker.change24h, confidence)

      newResults.push({
        pair,
        price: ticker.price,
        change24h: ticker.change24h,
        volume24h: ticker.volume,
        rsi,
        trend,
        signal,
        confidence: Math.round(confidence),
        score,
      })
    }

    const filtered = newResults
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)

    setResults(filtered)
    setLastRun(new Date())
    setIsRunning(false)
    setProgress(100)
  }, [minScore])

  // Auto-screener
  useEffect(() => {
    if (!autoScreener) return
    const interval = setInterval(runScreener, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoScreener, runScreener])

  const getScoreColor = (s: number) => s >= 70 ? '#10b981' : s >= 50 ? '#f59e0b' : '#9ca3af'
  const getRsiColor = (r: number) => r < 35 ? '#10b981' : r > 65 ? '#ef4444' : '#9ca3af'

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={28} color="#00d4ff" />
              Multi-Pair Screener
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Реальные цены с Binance · RSI анализ · {ALL_PAIRS.length} пар</p>
          </div>
          <button onClick={runScreener} disabled={isRunning} style={{
            padding: '12px 24px',
            background: isRunning ? '#2a2a3e' : '#00d4ff',
            color: '#0a0a0f', border: 'none', borderRadius: '8px',
            fontWeight: 'bold', cursor: isRunning ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {isRunning
              ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              : <Play size={18} />}
            {isRunning ? `Scanning... ${progress}%` : 'Run Screener'}
          </button>
        </div>

        {/* Progress bar */}
        {isRunning && (
          <div style={{ height: '4px', background: '#2a2a3e', borderRadius: '2px', marginBottom: '24px' }}>
            <div style={{ height: '4px', background: '#00d4ff', borderRadius: '2px', width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
        )}

        {/* Control Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>

          {/* Kill Zone */}
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#6b7280' }}>
              <Clock size={18} /><span>Kill Zone</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px',
              background: killZone.active ? `${killZone.color}20` : '#2a2a3e',
              color: killZone.active ? killZone.color : '#6b7280',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: killZone.active ? killZone.color : '#6b7280' }} />
              {killZone.name.toUpperCase()}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              {killZone.active ? '🟢 Активная зона' : '⏳ Ожидание зоны'}
            </p>
          </div>

          {/* Auto-Screener */}
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#6b7280' }}>
              <Zap size={18} /><span>Auto-Screener</span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#9ca3af' }}>Запускать каждые 5 минут</p>
            <button onClick={() => setAutoScreener(!autoScreener)} style={{
              width: '48px', height: '26px', borderRadius: '13px',
              background: autoScreener ? '#10b981' : '#2a2a3e',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
            }}>
              <span style={{
                position: 'absolute', top: '3px',
                left: autoScreener ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.3s',
              }} />
            </button>
            {autoScreener && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#10b981' }}>✅ Активен</div>
            )}
          </div>

          {/* Filters */}
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#6b7280' }}>
              <Filter size={18} /><span>Фильтры</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {['1H', '4H', '1D'].map(tf => (
                <button key={tf} onClick={() => setTimeframe(tf)} style={{
                  padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px',
                  background: timeframe === tf ? '#00d4ff' : '#2a2a3e',
                  color: timeframe === tf ? '#0a0a0f' : '#9ca3af',
                  fontWeight: timeframe === tf ? 'bold' : 'normal',
                }}>{tf}</button>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Мин. Score:</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: getScoreColor(minScore) }}>{minScore}</span>
              </div>
              <input type="range" min={0} max={100} value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00d4ff' }}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Результаты скрининга</h3>
                {lastRun && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {lastRun.toLocaleTimeString()} · {results.length} пар найдено
                </p>}
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { label: 'LONG', value: results.filter(r => r.signal === 'LONG').length, color: '#10b981' },
                  { label: 'SHORT', value: results.filter(r => r.signal === 'SHORT').length, color: '#ef4444' },
                  { label: 'Score 70+', value: results.filter(r => r.score >= 70).length, color: '#00d4ff' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['Пара', 'Цена', '24h %', 'Объём', 'RSI', 'Тренд', 'Сигнал', 'Уверенность', 'Score'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1c1c2e' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1a2e'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 12px', fontWeight: 'bold' }}>{r.pair}</td>
                      <td style={{ padding: '14px 12px' }}>${r.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                      <td style={{ padding: '14px 12px', color: r.change24h >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                        {r.change24h >= 0 ? '+' : ''}{r.change24h.toFixed(2)}%
                      </td>
                      <td style={{ padding: '14px 12px', color: '#9ca3af', fontSize: '13px' }}>
                        ${(r.volume24h / 1_000_000).toFixed(0)}M
                      </td>
                      <td style={{ padding: '14px 12px', color: getRsiColor(r.rsi), fontWeight: 'bold' }}>{r.rsi}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: r.trend === 'bullish' ? '#10b981' : r.trend === 'bearish' ? '#ef4444' : '#6b7280' }}>
                          {r.trend === 'bullish' ? <TrendingUp size={14} /> : r.trend === 'bearish' ? <TrendingDown size={14} /> : <Minus size={14} />}
                          {r.trend}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        {r.signal !== '—' ? (
                          <span style={{
                            padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                            background: r.signal === 'LONG' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: r.signal === 'LONG' ? '#10b981' : '#ef4444',
                          }}>{r.signal}</span>
                        ) : <span style={{ color: '#444' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 12px', color: r.confidence >= 70 ? '#10b981' : '#9ca3af' }}>
                        {r.confidence > 0 ? `${r.confidence}%` : '—'}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#2a2a3e', borderRadius: '3px' }}>
                            <div style={{ height: '6px', background: getScoreColor(r.score), borderRadius: '3px', width: `${r.score}%` }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: getScoreColor(r.score), minWidth: '30px' }}>{r.score}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isRunning && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', color: '#6b7280' }}>
            <Search size={48} color="#2a2a3e" style={{ marginBottom: '16px' }} />
            <p style={{ margin: 0, fontSize: '16px' }}>Нажми "Run Screener" чтобы начать анализ</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Реальные цены · RSI · Объём · {ALL_PAIRS.length} пар</p>
          </div>
        )}

      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Sidebar>
  )
}
