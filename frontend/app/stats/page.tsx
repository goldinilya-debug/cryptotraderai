'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { TrendingUp, TrendingDown, Activity, Target, BarChart3, Calendar, RefreshCw } from 'lucide-react'

const API_URL = 'https://cryptotraderai-api.onrender.com'

interface Trade {
  id: string
  pair: string
  direction: string
  entry_price: number
  exit_price: number
  pnl: number
  pnl_percent: number
  status: string
  created_at: string
  timeframe?: string
  stop_loss?: number
  take_profit?: number
}

interface Metrics {
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnL: number
  avgPnL: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  avgRR: number
  bestTrade: number
  worstTrade: number
  byPair: Record<string, { trades: number; wins: number; pnl: number }>
  dailyPnL: { date: string; pnl: number }[]
}

function calcMetrics(trades: Trade[]): Metrics {
  const closed = trades.filter(t => t.status === 'CLOSED' && t.pnl_percent !== undefined)
  if (closed.length === 0) return {
    totalTrades: 0, wins: 0, losses: 0, winRate: 0, totalPnL: 0,
    avgPnL: 0, profitFactor: 0, maxDrawdown: 0, sharpeRatio: 0,
    avgRR: 0, bestTrade: 0, worstTrade: 0, byPair: {}, dailyPnL: []
  }

  const wins = closed.filter(t => t.pnl_percent > 0)
  const losses = closed.filter(t => t.pnl_percent <= 0)
  const totalPnL = closed.reduce((s, t) => s + t.pnl_percent, 0)
  const grossWin = wins.reduce((s, t) => s + t.pnl_percent, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl_percent, 0))
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0
  const avgPnL = totalPnL / closed.length

  // Sharpe (simplified)
  const variance = closed.reduce((s, t) => s + Math.pow(t.pnl_percent - avgPnL, 2), 0) / closed.length
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? avgPnL / stdDev : 0

  // Max drawdown
  let peak = 0, equity = 0, maxDD = 0
  closed.forEach(t => {
    equity += t.pnl_percent
    if (equity > peak) peak = equity
    const dd = peak - equity
    if (dd > maxDD) maxDD = dd
  })

  // Avg R:R
  const rrTrades = closed.filter(t => t.stop_loss && t.take_profit && t.entry_price)
  const avgRR = rrTrades.length > 0
    ? rrTrades.reduce((s, t) => s + Math.abs((t.take_profit! - t.entry_price) / (t.entry_price - t.stop_loss!)), 0) / rrTrades.length
    : 0

  // By pair
  const byPair: Record<string, { trades: number; wins: number; pnl: number }> = {}
  closed.forEach(t => {
    if (!byPair[t.pair]) byPair[t.pair] = { trades: 0, wins: 0, pnl: 0 }
    byPair[t.pair].trades++
    byPair[t.pair].pnl += t.pnl_percent
    if (t.pnl_percent > 0) byPair[t.pair].wins++
  })

  // Daily P&L
  const dailyMap: Record<string, number> = {}
  closed.forEach(t => {
    const date = t.created_at?.slice(0, 10) || ''
    if (date) dailyMap[date] = (dailyMap[date] || 0) + t.pnl_percent
  })
  const dailyPnL = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, pnl]) => ({ date, pnl: Math.round(pnl * 100) / 100 }))

  return {
    totalTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
    winRate: (wins.length / closed.length) * 100,
    totalPnL: Math.round(totalPnL * 100) / 100,
    avgPnL: Math.round(avgPnL * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    maxDrawdown: Math.round(-maxDD * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    avgRR: Math.round(avgRR * 100) / 100,
    bestTrade: Math.max(...closed.map(t => t.pnl_percent)),
    worstTrade: Math.min(...closed.map(t => t.pnl_percent)),
    byPair,
    dailyPnL,
  }
}

export default function StatsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token') || '')
    }
  }, [])

  const fetchTrades = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/diary/entries`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setTrades(data.entries || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  // Filter by period
  const now = new Date()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 99999
  const filtered = trades.filter(t => {
    if (!t.created_at) return true
    const diff = (now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return diff <= days
  })

  const m = calcMetrics(filtered)
  const maxBar = Math.max(...m.dailyPnL.map(d => Math.abs(d.pnl)), 1)

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Trading Statistics</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Performance metrics from your Trading Journal</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px', background: '#13131f', padding: '4px', borderRadius: '8px' }}>
              {(['7d', '30d', '90d', 'all'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                  background: period === p ? '#00d4ff' : 'transparent',
                  color: period === p ? '#000' : '#6b7280',
                }}>{p === 'all' ? 'All' : p}</button>
              ))}
            </div>
            <button onClick={fetchTrades} style={{ padding: '8px', background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {!token && (
          <div style={{ padding: '40px', textAlign: 'center', background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', color: '#6b7280' }}>
            <Activity size={48} color="#2a2a3e" style={{ marginBottom: '16px' }} />
            <p style={{ margin: 0, fontSize: '16px' }}>Войди в аккаунт чтобы увидеть статистику</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Статистика рассчитывается из сделок в Trading Journal</p>
          </div>
        )}

        {token && loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Загрузка...</div>
        )}

        {token && !loading && m.totalTrades === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', color: '#6b7280' }}>
            <BarChart3 size={48} color="#2a2a3e" style={{ marginBottom: '16px' }} />
            <p style={{ margin: 0, fontSize: '16px' }}>Нет закрытых сделок за этот период</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Добавь сделки в Trading Journal чтобы видеть статистику</p>
          </div>
        )}

        {token && !loading && m.totalTrades > 0 && (
          <>
            {/* Main stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Trades', value: m.totalTrades, sub: `${m.wins}W / ${m.losses}L`, color: '#00d4ff', icon: <Activity size={20} color="#00d4ff" /> },
                { label: 'Win Rate', value: `${m.winRate.toFixed(1)}%`, color: m.winRate >= 50 ? '#10b981' : '#ef4444', icon: <Target size={20} color={m.winRate >= 50 ? '#10b981' : '#ef4444'} /> },
                { label: 'Total P&L', value: `${m.totalPnL >= 0 ? '+' : ''}${m.totalPnL.toFixed(2)}%`, color: m.totalPnL >= 0 ? '#10b981' : '#ef4444', icon: m.totalPnL >= 0 ? <TrendingUp size={20} color="#10b981" /> : <TrendingDown size={20} color="#ef4444" /> },
                { label: 'Profit Factor', value: m.profitFactor.toFixed(2), color: m.profitFactor >= 1.5 ? '#10b981' : '#f59e0b', icon: <BarChart3 size={20} color="#00d4ff" /> },
              ].map((s, i) => (
                <div key={i} style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '13px' }}>{s.label}</p>
                      <p style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: s.color }}>{s.value}</p>
                      {s.sub && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{s.sub}</p>}
                    </div>
                    <div style={{ padding: '8px', borderRadius: '8px', background: s.color + '20' }}>{s.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Sharpe Ratio', value: m.sharpeRatio.toFixed(2), color: m.sharpeRatio >= 1.5 ? '#10b981' : '#f59e0b', sub: 'Risk/Return' },
                { label: 'Max Drawdown', value: `${m.maxDrawdown}%`, color: '#ef4444', sub: 'Max loss' },
                { label: 'Avg R:R', value: m.avgRR > 0 ? `1:${m.avgRR}` : '—', color: '#00d4ff', sub: 'Average ratio' },
                { label: 'Avg Trade', value: `${m.avgPnL >= 0 ? '+' : ''}${m.avgPnL.toFixed(2)}%`, color: m.avgPnL >= 0 ? '#10b981' : '#ef4444', sub: 'Per trade' },
                { label: 'Best Trade', value: `+${m.bestTrade.toFixed(2)}%`, color: '#10b981', sub: 'Top win' },
                { label: 'Worst Trade', value: `${m.worstTrade.toFixed(2)}%`, color: '#ef4444', sub: 'Biggest loss' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', padding: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>{s.label}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#444' }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* P&L Chart */}
            {m.dailyPnL.length > 0 && (
              <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                  <Calendar size={16} color="#00d4ff" /> P&L История
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
                  {m.dailyPnL.map((day, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '10px', color: day.pnl >= 0 ? '#10b981' : '#ef4444', marginBottom: '4px', fontWeight: 'bold' }}>
                        {day.pnl >= 0 ? '+' : ''}{day.pnl.toFixed(1)}
                      </div>
                      <div style={{
                        width: '100%', borderRadius: '4px 4px 0 0',
                        background: day.pnl >= 0 ? '#10b98180' : '#ef444480',
                        height: `${Math.max((Math.abs(day.pnl) / maxBar) * 80, 4)}%`,
                      }} />
                      <div style={{ fontSize: '10px', color: '#444', marginTop: '6px', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        {day.date.slice(5)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By pair */}
            {Object.keys(m.byPair).length > 0 && (
              <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Статистика по парам</h3>
                {Object.entries(m.byPair)
                  .sort(([, a], [, b]) => b.pnl - a.pnl)
                  .map(([pair, stats]) => {
                    const wr = (stats.wins / stats.trades) * 100
                    return (
                      <div key={pair} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#1c1c2e', borderRadius: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 'bold', minWidth: '90px' }}>{pair}</span>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>{stats.trades} сделок</span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: wr >= 50 ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>{wr.toFixed(1)}%</div>
                            <div style={{ fontSize: '11px', color: '#444' }}>Win Rate</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: stats.pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>{stats.pnl >= 0 ? '+' : ''}{stats.pnl.toFixed(2)}%</div>
                            <div style={{ fontSize: '11px', color: '#444' }}>P&L</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </>
        )}

      </div>
    </Sidebar>
  )
}
