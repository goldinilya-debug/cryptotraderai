'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { Activity, Filter, Bell, RefreshCw, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const API_URL = 'https://cryptotraderai.onrender.com'

interface Signal {
  id?: string
  pair: string
  direction: string
  entry: number
  stop_loss: number
  take_profit_1: number
  take_profit_2?: number
  confidence: number
  status: string
  timeframe: string
  exchange: string
  created_at?: string
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [filtered, setFiltered] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [activeTab, setActiveTab] = useState<'signals' | 'analytics'>('signals')

  const [filterDirection, setFilterDirection] = useState('')
  const [filterPair, setFilterPair] = useState('')
  const [filterMinConfidence, setFilterMinConfidence] = useState(0)
  const [alertEnabled, setAlertEnabled] = useState(false)
  const [alertMinConfidence, setAlertMinConfidence] = useState(80)

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/signals`)
      const data = await res.json()
      const list: Signal[] = (data.signals || []).map((s: any) => ({
        ...s,
        pair: s.pair ?? s.symbol ?? '',
        entry: s.entry ?? s.entry_price ?? 0,
        take_profit_1: s.take_profit_1 ?? s.take_profit ?? 0,
      }))
      setSignals(list)
      setLastUpdate(new Date().toLocaleTimeString())
      if (alertEnabled && Notification.permission === 'granted') {
        list.filter(s => s.confidence >= alertMinConfidence).forEach(s => {
          new Notification(`🚨 ${s.pair} ${s.direction}`, { body: `Confidence: ${s.confidence}%` })
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [alertEnabled, alertMinConfidence])

  useEffect(() => {
    fetchSignals()
    const i = setInterval(fetchSignals, 30000)
    return () => clearInterval(i)
  }, [fetchSignals])

  useEffect(() => {
    let r = [...signals]
    if (filterDirection) r = r.filter(s => s.direction === filterDirection)
    if (filterPair) r = r.filter(s => s.pair.toLowerCase().includes(filterPair.toLowerCase()))
    if (filterMinConfidence > 0) r = r.filter(s => s.confidence >= filterMinConfidence)
    setFiltered(r)
  }, [signals, filterDirection, filterPair, filterMinConfidence])

  const displaySignals = filterDirection || filterPair || filterMinConfidence > 0 ? filtered : signals

  // Analytics
  const pairStats = signals.reduce((acc, s) => {
    if (!acc[s.pair]) acc[s.pair] = { pair: s.pair.replace('/USDT', ''), count: 0, total: 0, long: 0, short: 0 }
    acc[s.pair].count++
    acc[s.pair].total += s.confidence
    if (s.direction === 'LONG') acc[s.pair].long++
    else acc[s.pair].short++
    return acc
  }, {} as Record<string, any>)

  const pairChart = Object.values(pairStats)
    .map((p: any) => ({ ...p, confidence: Math.round(p.total / p.count) }))
    .sort((a: any, b: any) => b.confidence - a.confidence)

  const tfStats = signals.reduce((acc, s) => {
    if (!acc[s.timeframe]) acc[s.timeframe] = { tf: s.timeframe, count: 0, total: 0 }
    acc[s.timeframe].count++
    acc[s.timeframe].total += s.confidence
    return acc
  }, {} as Record<string, any>)

  const radarData = Object.values(tfStats).map((t: any) => ({
    tf: t.tf,
    confidence: Math.round(t.total / t.count),
  }))

  const best = signals.length ? signals.reduce((a, b) => a.confidence > b.confidence ? a : b) : null

  const enableAlerts = async () => {
    if (Notification.permission === 'default') await Notification.requestPermission()
    setAlertEnabled(!alertEnabled)
  }

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Trading Signals</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
              AI-generated buy/sell signals
              {lastUpdate && <span style={{ marginLeft: '8px', color: '#22c55e', fontSize: '12px' }}>● {lastUpdate}</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={fetchSignals} style={btnStyle}><RefreshCw size={15} /> Refresh</button>
            <button onClick={() => { setShowFilter(!showFilter); setShowAlerts(false) }} style={{ ...btnStyle, background: showFilter ? 'rgba(0,212,255,0.1)' : '#13131f', color: showFilter ? '#00d4ff' : '#fff', border: showFilter ? '1px solid #00d4ff' : '1px solid #2a2a3e' }}>
              <Filter size={15} /> Filter
            </button>
            <button onClick={() => { setShowAlerts(!showAlerts); setShowFilter(false) }} style={{ ...btnStyle, background: alertEnabled ? 'rgba(16,185,129,0.1)' : showAlerts ? 'rgba(0,212,255,0.1)' : '#13131f', color: alertEnabled ? '#10b981' : showAlerts ? '#00d4ff' : '#fff', border: `1px solid ${alertEnabled ? '#10b981' : showAlerts ? '#00d4ff' : '#2a2a3e'}` }}>
              <Bell size={15} /> {alertEnabled ? 'Alerts ON' : 'Alerts'}
            </button>
          </div>
        </div>

        {showFilter && (
          <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#00d4ff' }}>Фильтры</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Направление</label>
                <select value={filterDirection} onChange={e => setFilterDirection(e.target.value)} style={selectStyle}>
                  <option value="">Все</option><option value="LONG">LONG</option><option value="SHORT">SHORT</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Пара</label>
                <input placeholder="BTC, ETH..." value={filterPair} onChange={e => setFilterPair(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Мин. уверенность: {filterMinConfidence}%</label>
                <input type="range" min={0} max={100} value={filterMinConfidence} onChange={e => setFilterMinConfidence(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff', marginTop: '12px' }} />
              </div>
            </div>
            <button onClick={() => { setFilterDirection(''); setFilterPair(''); setFilterMinConfidence(0) }} style={{ ...btnStyle, marginTop: '12px', color: '#ff4757' }}>Сбросить</button>
          </div>
        )}

        {showAlerts && (
          <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#00d4ff' }}>Настройки алертов</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Мин. уверенность: {alertMinConfidence}%</label>
                <input type="range" min={50} max={100} value={alertMinConfidence} onChange={e => setAlertMinConfidence(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981', marginTop: '10px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={enableAlerts} style={{ ...btnStyle, background: alertEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(0,212,255,0.1)', color: alertEnabled ? '#10b981' : '#00d4ff', border: `1px solid ${alertEnabled ? '#10b981' : '#00d4ff'}`, width: '100%', justifyContent: 'center' }}>
                  <Bell size={15} /> {alertEnabled ? '🔔 Включены' : '🔕 Включить'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Всего', value: signals.length, color: '#e0e0e0' },
            { label: 'LONG', value: signals.filter(s => s.direction === 'LONG').length, color: '#10b981' },
            { label: 'SHORT', value: signals.filter(s => s.direction === 'SHORT').length, color: '#ef4444' },
            { label: 'Показано', value: displaySignals.length, color: '#00d4ff' },
            { label: 'Ср. уверенность', value: signals.length ? Math.round(signals.reduce((a, s) => a + s.confidence, 0) / signals.length) + '%' : '—', color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '12px 20px' }}>
              <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {[{ key: 'signals', label: '📋 Сигналы' }, { key: 'analytics', label: '📊 Аналитика' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
              background: activeTab === tab.key ? '#00d4ff' : '#13131f',
              color: activeTab === tab.key ? '#0a0a0f' : '#9ca3af',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Signals list */}
        {activeTab === 'signals' && (
          <div>
            {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Загрузка...</div>}
            {!loading && displaySignals.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                <Activity size={48} color="#2a2a3e" style={{ marginBottom: '16px' }} />
                <p style={{ margin: 0, fontSize: '16px' }}>Нет активных сигналов</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Агент сгенерирует сигналы во время Kill Zone</p>
              </div>
            )}
            {displaySignals.map((signal, i) => {
              const isLong = signal.direction === 'LONG'
              const rr = Math.abs((signal.take_profit_1 - signal.entry) / (signal.entry - signal.stop_loss)).toFixed(1)
              return (
                <div key={i} style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '12px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = isLong ? '#10b98160' : '#ef444460')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a3e')}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isLong ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
                    {isLong ? <TrendingUp color="#10b981" size={22} /> : <TrendingDown color="#ef4444" size={22} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{signal.pair}</span>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: isLong ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isLong ? '#10b981' : '#ef4444' }}>{signal.direction}</span>
                      {signal.timeframe && <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: '#1a1a2e', color: '#6b7280' }}>{signal.timeframe}</span>}
                      {signal.exchange && <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: '#1a1a2e', color: '#6b7280' }}>{signal.exchange}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Entry', value: `$${signal.entry.toLocaleString()}`, color: '#6366f1' },
                        { label: 'TP', value: `$${signal.take_profit_1.toLocaleString()}`, color: '#10b981' },
                        { label: 'SL', value: `$${signal.stop_loss.toLocaleString()}`, color: '#ef4444' },
                        { label: 'R:R', value: `1:${rr}`, color: '#f59e0b' },
                      ].map((l, j) => (
                        <div key={j} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#444' }}>{l.label}:</span>
                          <span style={{ fontWeight: 'bold', fontSize: '13px', color: l.color }}>{l.value}</span>
                        </div>
                      ))}
                    </div>
                    {signal.created_at && <div style={{ marginTop: '6px', fontSize: '11px', color: '#333' }}>{new Date(signal.created_at).toLocaleString()}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '30px', fontWeight: 'bold', color: signal.confidence >= 80 ? '#10b981' : signal.confidence >= 60 ? '#f59e0b' : '#ef4444' }}>{signal.confidence}%</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>уверенность</div>
                    <div style={{ marginTop: '6px', display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', background: signal.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : '#1a1a2e', color: signal.status === 'ACTIVE' ? '#10b981' : '#6b7280' }}>{signal.status}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>🏆 Уверенность по парам</h3>
              {pairChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={pairChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="pair" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1c1c2e', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff' }} formatter={(v: any) => [`${v}%`, 'Уверенность']} />
                    <Bar dataKey="confidence" radius={[6, 6, 0, 0]}>
                      {pairChart.map((e: any, i: number) => <Cell key={i} fill={e.confidence >= 85 ? '#10b981' : e.confidence >= 70 ? '#f59e0b' : '#ef4444'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Нет данных</div>}
            </div>

            <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>📊 LONG vs SHORT</h3>
              {pairChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={pairChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="pair" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1c1c2e', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="long" name="LONG" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="short" name="SHORT" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Нет данных</div>}
            </div>

            {radarData.length > 1 && (
              <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '15px' }}>⏱ По таймфреймам</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a2a3e" />
                    <PolarAngleAxis dataKey="tf" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Radar dataKey="confidence" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: '#1c1c2e', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {best && (() => {
              const isLong = best.direction === 'LONG'
              return (
                <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: `1px solid ${isLong ? '#10b981' : '#ef4444'}` }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>🥇 Лучший сигнал</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '22px' }}>{best.pair}</span>
                    <span style={{ padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', background: isLong ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isLong ? '#10b981' : '#ef4444' }}>{best.direction}</span>
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', textAlign: 'center', margin: '16px 0' }}>{best.confidence}%</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                    {[{ label: 'Entry', value: `$${best.entry.toLocaleString()}`, color: '#6366f1' }, { label: 'TP', value: `$${best.take_profit_1.toLocaleString()}`, color: '#10b981' }, { label: 'SL', value: `$${best.stop_loss.toLocaleString()}`, color: '#ef4444' }].map((l, i) => (
                      <div key={i} style={{ padding: '10px', background: '#0a0a0f', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>{l.label}</div>
                        <div style={{ fontWeight: 'bold', color: l.color, fontSize: '14px' }}>{l.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

          </div>
        )}

      </div>
    </Sidebar>
  )
}

const btnStyle: React.CSSProperties = { padding: '8px 16px', background: '#13131f', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #2a2a3e', color: '#fff', cursor: 'pointer', fontSize: '13px' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#555', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#e0e0e0', fontSize: '13px', boxSizing: 'border-box' }
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

