'use client'

import { useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { LineChart, Play, Download, TrendingUp, TrendingDown } from 'lucide-react'

interface BacktestTrade {
  date: string
  pair: string
  dir: 'LONG' | 'SHORT'
  entry: number
  exit: number
  pnlPct: number
  win: boolean
  rr: string
}

interface BacktestResult {
  trades: BacktestTrade[]
  winRate: number
  profitFactor: number
  netProfit: number
  totalTrades: number
  maxDrawdown: number
  sharpe: number
}

const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT']
const TIMEFRAMES = ['1h', '4h', '1d']
const PERIODS = [
  { label: 'Last 30 days', days: 30, limit: 720 },
  { label: 'Last 90 days', days: 90, limit: 500 },
  { label: 'Last 6 months', days: 180, limit: 500 },
]
const STRATEGIES = ['SMC + Kill Zones', 'RSI Reversal', 'EMA Crossover']

function calcRSI(closes: number[], period = 14): number[] {
  const rsi: number[] = new Array(period).fill(50)
  for (let i = period; i < closes.length; i++) {
    let gains = 0, losses = 0
    for (let j = i - period + 1; j <= i; j++) {
      const diff = closes[j] - closes[j - 1]
      if (diff > 0) gains += diff
      else losses -= diff
    }
    const rs = losses === 0 ? 100 : gains / losses
    rsi.push(100 - 100 / (1 + rs))
  }
  return rsi
}

function calcEMA(closes: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const ema: number[] = [closes[0]]
  for (let i = 1; i < closes.length; i++) {
    ema.push(closes[i] * k + ema[i - 1] * (1 - k))
  }
  return ema
}

function runBacktest(candles: any[], strategy: string, pair: string): BacktestTrade[] {
  const closes = candles.map((c: any) => c.close)
  const highs = candles.map((c: any) => c.high)
  const lows = candles.map((c: any) => c.low)
  const rsi = calcRSI(closes)
  const ema20 = calcEMA(closes, 20)
  const ema50 = calcEMA(closes, 50)

  const trades: BacktestTrade[] = []
  const atrPct = 0.015

  for (let i = 51; i < candles.length - 1; i++) {
    const price = closes[i]
    const nextPrice = closes[i + 1]
    const date = new Date(candles[i].time * 1000).toISOString().slice(0, 10)

    let signal: 'LONG' | 'SHORT' | null = null

    if (strategy === 'RSI Reversal') {
      if (rsi[i] < 35 && rsi[i - 1] < 35 && rsi[i] > rsi[i - 1]) signal = 'LONG'
      else if (rsi[i] > 65 && rsi[i - 1] > 65 && rsi[i] < rsi[i - 1]) signal = 'SHORT'
    } else if (strategy === 'EMA Crossover') {
      if (ema20[i] > ema50[i] && ema20[i - 1] <= ema50[i - 1]) signal = 'LONG'
      else if (ema20[i] < ema50[i] && ema20[i - 1] >= ema50[i - 1]) signal = 'SHORT'
    } else {
      // SMC + Kill Zones: BOS-like + RSI filter
      const bullishBOS = lows[i] > lows[i - 2] && closes[i] > highs[i - 1]
      const bearishBOS = highs[i] < highs[i - 2] && closes[i] < lows[i - 1]
      if (bullishBOS && rsi[i] > 40 && rsi[i] < 70 && ema20[i] > ema50[i]) signal = 'LONG'
      else if (bearishBOS && rsi[i] < 60 && rsi[i] > 30 && ema20[i] < ema50[i]) signal = 'SHORT'
    }

    if (!signal) continue

    const sl = signal === 'LONG' ? price * (1 - atrPct) : price * (1 + atrPct)
    const tp = signal === 'LONG' ? price * (1 + atrPct * 2) : price * (1 - atrPct * 2)

    // Check next 5 candles for exit
    let exitPrice = nextPrice
    let hit = false
    for (let j = i + 1; j < Math.min(i + 6, candles.length); j++) {
      if (signal === 'LONG') {
        if (lows[j] <= sl) { exitPrice = sl; hit = true; break }
        if (highs[j] >= tp) { exitPrice = tp; hit = true; break }
      } else {
        if (highs[j] >= sl) { exitPrice = sl; hit = true; break }
        if (lows[j] <= tp) { exitPrice = tp; hit = true; break }
      }
    }
    if (!hit) exitPrice = closes[Math.min(i + 5, candles.length - 1)]

    const pnlPct = signal === 'LONG'
      ? ((exitPrice - price) / price) * 100
      : ((price - exitPrice) / price) * 100

    trades.push({
      date,
      pair,
      dir: signal,
      entry: Math.round(price * 100) / 100,
      exit: Math.round(exitPrice * 100) / 100,
      pnlPct: Math.round(pnlPct * 100) / 100,
      win: pnlPct > 0,
      rr: '1:2',
    })

    i += 5 // skip candles used
  }

  return trades
}

function calcResults(trades: BacktestTrade[]): BacktestResult {
  if (trades.length === 0) return { trades: [], winRate: 0, profitFactor: 0, netProfit: 0, totalTrades: 0, maxDrawdown: 0, sharpe: 0 }
  const wins = trades.filter(t => t.win)
  const grossWin = wins.reduce((s, t) => s + t.pnlPct, 0)
  const grossLoss = Math.abs(trades.filter(t => !t.win).reduce((s, t) => s + t.pnlPct, 0))
  const netProfit = trades.reduce((s, t) => s + t.pnlPct, 0)
  const avg = netProfit / trades.length
  const std = Math.sqrt(trades.reduce((s, t) => s + Math.pow(t.pnlPct - avg, 2), 0) / trades.length)

  let peak = 0, eq = 0, maxDD = 0
  trades.forEach(t => {
    eq += t.pnlPct
    if (eq > peak) peak = eq
    const dd = peak - eq
    if (dd > maxDD) maxDD = dd
  })

  return {
    trades,
    winRate: (wins.length / trades.length) * 100,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : 99,
    netProfit: Math.round(netProfit * 100) / 100,
    totalTrades: trades.length,
    maxDrawdown: Math.round(-maxDD * 100) / 100,
    sharpe: std > 0 ? Math.round((avg / std) * 100) / 100 : 0,
  }
}

export default function BacktestPage() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<BacktestResult | undefined>(undefined)
  const [strategy, setStrategy] = useState(STRATEGIES[0])
  const [pair, setPair] = useState(PAIRS[0])
  const [tf, setTf] = useState(TIMEFRAMES[1])
  const [periodIdx, setPeriodIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const runTest = useCallback(async () => {
    setRunning(true)
    setError('')
    setProgress(10)

      const symbol = pair.replace('/', '')
      const bingxSymbol = symbol.replace('USDT', '-USDT')
      const period = PERIODS[periodIdx]
      const res = await fetch(`https://open-api.bingx.com/openApi/market/his/v1/kline?symbol=${bingxSymbol}&interval=${tf}&limit=${period.limit}`)
      const json = await res.json()
      setProgress(50)

      if (!json.data || !Array.isArray(json.data)) throw new Error('BingX error')

      const candles = (json.data || []).map((d: any) => ({
        time: Math.floor(d.time / 1000),
        open: parseFloat(d.open),
        high: parseFloat(d.high),
        low: parseFloat(d.low),
        close: parseFloat(d.close),
      }))

      setProgress(70)
      const trades = runBacktest(candles, strategy, pair)
      setProgress(90)
      const res2 = calcResults(trades)
      setResult(res2)
    } catch (e) {
      setError('Ошибка загрузки данных с Binance')
    } finally {
      setRunning(false)
      setProgress(100)
    }
  }, [pair, tf, periodIdx, strategy])

  const exportCSV = () => {
    if (!result) return
    const rows = ['Date,Pair,Direction,Entry,Exit,PnL%,Result']
    result.trades.forEach(t => rows.push(`${t.date},${t.pair},${t.dir},${t.entry},${t.exit},${t.pnlPct},${t.win ? 'WIN' : 'LOSS'}`))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `backtest_${pair.replace('/', '_')}_${tf}.csv`; a.click()
  }

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Strategy Backtest</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Реальные данные с Binance · SMC / RSI / EMA стратегии</p>
          </div>
          {result && (
            <button onClick={exportCSV} style={{ padding: '8px 16px', background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>

        {/* Config */}
        <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <LineChart color="#00d4ff" size={20} />
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Конфигурация</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Стратегия', value: strategy, options: STRATEGIES, set: setStrategy },
              { label: 'Пара', value: pair, options: PAIRS, set: setPair },
              { label: 'Таймфрейм', value: tf, options: TIMEFRAMES, set: setTf },
              { label: 'Период', value: PERIODS[periodIdx].label, options: PERIODS.map(p => p.label), set: (v: string) => setPeriodIdx(PERIODS.findIndex(p => p.label === v)) },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ display: 'block', fontSize: '11px', color: '#555', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>{f.label}</label>
                <select value={f.value} onChange={e => f.set(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', fontSize: '13px' }}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {running && (
            <div style={{ marginTop: '16px', height: '4px', background: '#2a2a3e', borderRadius: '2px' }}>
              <div style={{ height: '4px', background: '#00d4ff', borderRadius: '2px', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          )}

          <button onClick={runTest} disabled={running} style={{
            marginTop: '20px', padding: '12px 28px',
            background: running ? '#2a2a3e' : 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold',
            cursor: running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px',
          }}>
            <Play size={18} />
            {running ? `Запуск... ${progress}%` : 'Run Backtest'}
          </button>
        </div>

        {error && <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '20px', color: '#ef4444' }}>{error}</div>}

        {/* Results */}
        {result && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Trades', value: result.totalTrades, color: '#00d4ff' },
                { label: 'Win Rate', value: `${result.winRate.toFixed(1)}%`, color: result.winRate >= 50 ? '#10b981' : '#ef4444' },
                { label: 'Net Profit', value: `${result.netProfit >= 0 ? '+' : ''}${result.netProfit.toFixed(2)}%`, color: result.netProfit >= 0 ? '#10b981' : '#ef4444' },
                { label: 'Profit Factor', value: result.profitFactor.toFixed(2), color: result.profitFactor >= 1.5 ? '#10b981' : '#f59e0b' },
                { label: 'Max Drawdown', value: `${result.maxDrawdown}%`, color: '#ef4444' },
                { label: 'Sharpe Ratio', value: result.sharpe.toFixed(2), color: result.sharpe >= 1 ? '#10b981' : '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#555' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Equity curve */}
            {result.trades.length > 0 && (() => {
              let eq = 0
              const points = result.trades.map(t => { eq += t.pnlPct; return eq })
              const max = Math.max(...points, 0.1)
              const min = Math.min(...points, -0.1)
              const range = max - min || 1
              const h = 120
              const w = 100 / points.length

              return (
                <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>📈 Equity Curve</h3>
                  <svg width="100%" height={h + 20} style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={eq >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={eq >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke={eq >= 0 ? '#10b981' : '#ef4444'}
                      strokeWidth="2"
                      points={points.map((p, i) => `${i * w + w / 2}%,${h - ((p - min) / range) * h}`).join(' ')}
                    />
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555' }}>
                    <span>Start</span>
                    <span style={{ color: eq >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      End: {eq >= 0 ? '+' : ''}{eq.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* Trades table */}
            <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a3e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px' }}>Сделки ({result.trades.length})</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ position: 'sticky', top: 0, background: '#0a0a0f' }}>
                      {['Дата', 'Пара', 'Направление', 'Entry', 'Exit', 'P&L', 'Результат'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #2a2a3e' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.slice(-50).reverse().map((trade, i) => (
                      <tr key={i}
                        onMouseEnter={e => e.currentTarget.style.background = '#1c1c2e'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '13px', borderBottom: '1px solid #1c1c2e' }}>{trade.date}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '13px', borderBottom: '1px solid #1c1c2e' }}>{trade.pair}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #1c1c2e' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', background: trade.dir === 'LONG' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: trade.dir === 'LONG' ? '#10b981' : '#ef4444' }}>{trade.dir}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid #1c1c2e' }}>${trade.entry.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid #1c1c2e' }}>${trade.exit.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '13px', borderBottom: '1px solid #1c1c2e', color: trade.win ? '#10b981' : '#ef4444' }}>
                          {trade.pnlPct >= 0 ? '+' : ''}{trade.pnlPct.toFixed(2)}%
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #1c1c2e' }}>
                          {trade.win
                            ? <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>✓ WIN</span>
                            : <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>✗ LOSS</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </Sidebar>
  )
}
