'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Activity, Filter, Bell, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

const API_URL = 'https://cryptotraderai.onrender.com'

interface Signal {
  pair: string
  direction: string
  entry: number
  stop_loss: number
  take_profit_1: number
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

  // Filters
  const [filterDirection, setFilterDirection] = useState('')
  const [filterPair, setFilterPair] = useState('')
  const [filterMinConfidence, setFilterMinConfidence] = useState(0)

  // Alerts
  const [alertEnabled, setAlertEnabled] = useState(false)
  const [alertMinConfidence, setAlertMinConfidence] = useState(80)

  async function fetchSignals() {
    try {
      const res = await fetch(`${API_URL}/api/signals`)
      const data = await res.json()
      const list = data.signals || []
      setSignals(list)
      setLastUpdate(new Date().toLocaleTimeString())

      // Browser notification alert
      if (alertEnabled && Notification.permission === 'granted') {
        const highConfidence = list.filter((s: Signal) => s.confidence >= alertMinConfidence)
        highConfidence.forEach((s: Signal) => {
          new Notification(`🚨 ${s.pair} ${s.direction}`, {
            body: `Confidence: ${s.confidence}% | Entry: $${s.entry}`,
          })
        })
      }
    } catch (e) {
      console.error('Error fetching signals:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()
    const interval = setInterval(fetchSignals, 30000)
    return () => clearInterval(interval)
  }, [alertEnabled, alertMinConfidence])

  useEffect(() => {
    let result = [...signals]
    if (filterDirection) result = result.filter(s => s.direction === filterDirection)
    if (filterPair) result = result.filter(s => s.pair.toLowerCase().includes(filterPair.toLowerCase()))
    if (filterMinConfidence > 0) result = result.filter(s => s.confidence >= filterMinConfidence)
    setFiltered(result)
  }, [signals, filterDirection, filterPair, filterMinConfidence])

  async function enableAlerts() {
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    setAlertEnabled(!alertEnabled)
  }

  const displaySignals = filtered.length > 0 || filterDirection || filterPair || filterMinConfidence > 0 ? filtered : signals

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Trading Signals</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>AI-generated buy/sell signals</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {lastUpdate && <span style={{ color: '#6b7280', fontSize: '12px' }}>Updated: {lastUpdate}</span>}
            <button onClick={fetchSignals} style={btnStyle}>
              <RefreshCw size={16} />
              Refresh
            </button>
            <button onClick={() => { setShowFilter(!showFilter); setShowAlerts(false) }} style={{
              ...btnStyle,
              background: showFilter ? 'rgba(0, 212, 255, 0.1)' : '#13131f',
              color: showFilter ? '#00d4ff' : '#fff',
              border: showFilter ? '1px solid #00d4ff' : '1px solid #2a2a3e',
            }}>
              <Filter size={16} />
              Filter
            </button>
            <button onClick={() => { setShowAlerts(!showAlerts); setShowFilter(false) }} style={{
              ...btnStyle,
              background: alertEnabled ? 'rgba(16, 185, 129, 0.1)' : showAlerts ? 'rgba(0, 212, 255, 0.1)' : '#13131f',
              color: alertEnabled ? '#10b981' : showAlerts ? '#00d4ff' : '#fff',
              border: alertEnabled ? '1px solid #10b981' : showAlerts ? '1px solid #00d4ff' : '1px solid #2a2a3e',
            }}>
              <Bell size={16} />
              {alertEnabled ? 'Alerts ON' : 'Alerts'}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#00d4ff' }}>Фильтры</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Направление</label>
                <select value={filterDirection} onChange={e => setFilterDirection(e.target.value)} style={selectStyle}>
                  <option value="">Все</option>
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Пара</label>
                <input
                  placeholder="BTC, ETH..."
                  value={filterPair}
                  onChange={e => setFilterPair(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Мин. уверенность: {filterMinConfidence}%</label>
                <input
                  type="range" min={0} max={100} value={filterMinConfidence}
                  onChange={e => setFilterMinConfidence(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00d4ff' }}
                />
              </div>
            </div>
            <button onClick={() => { setFilterDirection(''); setFilterPair(''); setFilterMinConfidence(0) }}
              style={{ ...btnStyle, marginTop: '16px', color: '#ff4757' }}>
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Alerts Panel */}
        {showAlerts && (
          <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#00d4ff' }}>Настройки алертов</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Мин. уверенность для алерта: {alertMinConfidence}%</label>
                <input
                  type="range" min={50} max={100} value={alertMinConfidence}
                  onChange={e => setAlertMinConfidence(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={enableAlerts} style={{
                  ...btnStyle,
                  background: alertEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 212, 255, 0.1)',
                  color: alertEnabled ? '#10b981' : '#00d4ff',
                  border: `1px solid ${alertEnabled ? '#10b981' : '#00d4ff'}`,
                  width: '100%',
                  justifyContent: 'center',
                }}>
                  <Bell size={16} />
                  {alertEnabled ? '🔔 Алерты включены' : '🔕 Включить алерты'}
                </button>
              </div>
            </div>
            <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              Браузер запросит разрешение на уведомления. Алерты приходят при обновлении сигналов каждые 30 сек.
            </p>
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Всего сигналов', value: signals.length, color: '#e0e0e0' },
            { label: 'LONG', value: signals.filter(s => s.direction === 'LONG').length, color: '#10b981' },
            { label: 'SHORT', value: signals.filter(s => s.direction === 'SHORT').length, color: '#ef4444' },
            { label: 'Показано', value: displaySignals.length, color: '#00d4ff' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '12px 20px' }}>
              <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Signals List */}
        <div>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              Загрузка сигналов...
            </div>
          )}

          {!loading && displaySignals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <Activity size={48} color="#2a2a3e" style={{ marginBottom: '16px' }} />
              <p style={{ margin: 0, fontSize: '16px' }}>Нет активных сигналов</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Сигналы появятся здесь когда будут сгенерированы</p>
            </div>
          )}

          {displaySignals.map((signal, i) => {
            const isLong = signal.direction === 'LONG'
            const rr = signal.stop_loss && signal.take_profit_1 && signal.entry
              ? Math.abs((signal.take_profit_1 - signal.entry) / (signal.entry - signal.stop_loss)).toFixed(1)
              : '—'
            return (
              <div key={i} style={{
                background: '#13131f', padding: '20px', borderRadius: '12px',
                border: '1px solid #2a2a3e', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '12px', transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = isLong ? '#10b98140' : '#ef444440')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a3e')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isLong ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  }}>
                    {isLong ? <TrendingUp color="#10b981" /> : <TrendingDown color="#ef4444" />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{signal.pair}</span>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                        background: isLong ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: isLong ? '#10b981' : '#ef4444',
                      }}>{signal.direction}</span>
                      {signal.timeframe && (
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: '#1a1a2e', color: '#6b7280' }}>
                          {signal.timeframe}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                      Entry: ${signal.entry?.toLocaleString()} · TP: ${signal.take_profit_1?.toLocaleString()} · SL: ${signal.stop_loss?.toLocaleString()}
                      {rr !== '—' && ` · R:R ${rr}`}
                    </p>
                    {signal.exchange && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#444' }}>{signal.exchange}</p>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '28px', fontWeight: 'bold',
                    color: signal.confidence >= 80 ? '#10b981' : signal.confidence >= 60 ? '#f59e0b' : '#ef4444',
                  }}>
                    {signal.confidence}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>уверенность</div>
                  {signal.status && (
                    <span style={{
                      display: 'inline-block', marginTop: '6px',
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px',
                      background: signal.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : '#1a1a2e',
                      color: signal.status === 'ACTIVE' ? '#10b981' : '#6b7280',
                    }}>{signal.status}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </Sidebar>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '8px 16px', background: '#13131f', borderRadius: '8px',
  display: 'flex', alignItems: 'center', gap: '8px',
  border: '1px solid #2a2a3e', color: '#fff', cursor: 'pointer', fontSize: '14px',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', color: '#555',
  marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: '#0a0a0f', border: '1px solid #2a2a3e',
  borderRadius: '8px', color: '#e0e0e0', fontSize: '13px',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: 'pointer',
}
