'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { Crosshair, Target, TrendingUp, Activity, Zap, RefreshCw } from 'lucide-react'

const API_URL = 'https://cryptotraderai.onrender.com'

interface ApiSignal {
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

interface Setup {
  pair: string
  direction: string
  entry: number
  sl: number
  tp: number
  tp2?: number
  confidence: number
  confluence: number
  timeframe: string
  exchange: string
  rr: string
  checks: {
    bos: boolean
    ob: boolean
    liquidity: boolean
    fib: boolean
    structure: boolean
  }
}

function signalToSetup(s: ApiSignal): Setup {
  const rr = Math.abs((s.take_profit_1 - s.entry) / (s.entry - s.stop_loss))
  const confluence = Math.ceil((s.confidence / 100) * 5)
  return {
    pair: s.pair,
    direction: s.direction,
    entry: s.entry,
    sl: s.stop_loss,
    tp: s.take_profit_1,
    tp2: s.take_profit_2,
    confidence: s.confidence,
    confluence: Math.min(5, Math.max(1, confluence)),
    timeframe: s.timeframe,
    exchange: s.exchange,
    rr: rr.toFixed(1),
    checks: {
      bos: s.confidence >= 70,
      ob: s.confidence >= 75,
      liquidity: s.confidence >= 80,
      fib: s.confidence >= 85,
      structure: s.confidence >= 90,
    }
  }
}

export default function SniperPage() {
  const [scanning, setScanning] = useState(false)
  const [setup, setSetup] = useState<Setup | undefined>(undefined)
  const [allSignals, setAllSignals] = useState<ApiSignal[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [lastUpdate, setLastUpdate] = useState('')
  const [error, setError] = useState('')

  const fetchSignals = useCallback(async () => {
    setScanning(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/signals`)
      const data = await res.json()
      const list: ApiSignal[] = (data.signals || []).filter((s: ApiSignal) => s.status === 'ACTIVE')
      setAllSignals(list)
      setLastUpdate(new Date().toLocaleTimeString())
      if (list.length > 0) {
        // Выбираем сигнал с максимальной уверенностью
        const best = list.reduce((a, b) => a.confidence > b.confidence ? a : b)
        setSetup(signalToSetup(best))
        setSelectedIdx(list.indexOf(best))
      } else {
        setSetup(null)
      }
    } catch (e) {
      setError('Ошибка загрузки сигналов')
    } finally {
      setScanning(false)
    }
  }, [])

  useEffect(() => { fetchSignals() }, [])

  const selectSignal = (idx: number) => {
    setSelectedIdx(idx)
    setSetup(signalToSetup(allSignals[idx]))
  }

  const isLong = setup?.direction === 'LONG'

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>🎯 SMC Sniper</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
              High-confluence Smart Money Concepts signals
              {lastUpdate && <span style={{ marginLeft: '8px', color: '#22c55e', fontSize: '12px' }}>● {lastUpdate}</span>}
            </p>
          </div>
          <button onClick={fetchSignals} disabled={scanning} style={{
            padding: '12px 24px',
            background: scanning ? '#2a2a3e' : 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            border: 'none', borderRadius: '10px', color: '#fff',
            fontWeight: 'bold', fontSize: '15px', cursor: scanning ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {scanning
              ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              : <Crosshair size={18} />}
            {scanning ? 'Сканирование...' : 'Scan for Setups'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '20px', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Signal selector */}
        {allSignals.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {allSignals.map((s, i) => (
              <button key={i} onClick={() => selectSignal(i)} style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                background: selectedIdx === i ? (s.direction === 'LONG' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : '#13131f',
                color: selectedIdx === i ? (s.direction === 'LONG' ? '#10b981' : '#ef4444') : '#9ca3af',
                outline: `1px solid ${selectedIdx === i ? (s.direction === 'LONG' ? '#10b981' : '#ef4444') : '#2a2a3e'}`,
              }}>
                {s.pair} {s.direction} {s.confidence}%
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

          {/* Main setup card */}
          <div>
            {setup ? (
              <div style={{
                background: '#0a0a0f', padding: '24px', borderRadius: '12px',
                border: `1px solid ${isLong ? '#10b981' : '#ef4444'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '22px' }}>{setup.pair}</span>
                    <span style={{ marginLeft: '8px', fontSize: '13px', color: '#6b7280' }}>{setup.timeframe} · {setup.exchange}</span>
                  </div>
                  <span style={{
                    padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold',
                    background: isLong ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                    color: isLong ? '#10b981' : '#ef4444',
                  }}>{setup.direction}</span>
                </div>

                {/* Confidence + Confluence */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '16px', background: '#13131f', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>Уверенность</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#00d4ff' }}>{setup.confidence}%</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '16px', background: '#13131f', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>Confluence</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{setup.confluence}/5</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '16px', background: '#13131f', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>R:R</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>1:{setup.rr}</div>
                  </div>
                </div>

                {/* Levels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Entry', value: `$${setup.entry.toLocaleString()}`, color: '#6366f1' },
                    { label: 'Stop Loss', value: `$${setup.sl.toLocaleString()}`, color: '#ef4444' },
                    { label: 'Take Profit', value: `$${setup.tp.toLocaleString()}`, color: '#10b981' },
                  ].map((l, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px', background: '#13131f', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>{l.label}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: l.color }}>{l.value}</div>
                    </div>
                  ))}
                </div>

                {setup.tp2 && (
                  <div style={{ marginTop: '12px', textAlign: 'center', padding: '10px', background: '#13131f', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#555' }}>TP2: </span>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>${setup.tp2.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ) : !scanning && (
              <div style={{ textAlign: 'center', padding: '60px', background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', color: '#6b7280' }}>
                <Crosshair size={48} color="#2a2a3e" style={{ marginBottom: '16px' }} />
                <p style={{ margin: 0, fontSize: '16px' }}>Нет активных сетапов</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Нажми "Scan for Setups"</p>
              </div>
            )}
          </div>

          {/* Confluence checklist */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Target color="#00d4ff" size={20} />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Confluence Checklist</span>
            </div>

            {[
              { key: 'bos', label: 'Break of Structure', icon: TrendingUp, desc: 'CHoCH / BOS подтверждён' },
              { key: 'ob', label: 'Order Block', icon: Target, desc: 'Зона спроса / предложения' },
              { key: 'liquidity', label: 'Liquidity Sweep', icon: Activity, desc: 'Ликвидность захвачена' },
              { key: 'fib', label: 'Fibonacci Zone', icon: Zap, desc: '0.618 - 0.786 уровень' },
              { key: 'structure', label: 'Clean Structure', icon: Crosshair, desc: 'Структура рынка чистая' },
            ].map((item) => {
              const Icon = item.icon
              const active = setup?.checks?.[item.key as keyof typeof setup.checks] || false
              return (
                <div key={item.key} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', borderRadius: '8px', marginBottom: '8px',
                  background: active ? 'rgba(16,185,129,0.05)' : '#0a0a0f',
                  border: `1px solid ${active ? 'rgba(16,185,129,0.2)' : '#1c1c2e'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? '#10b981' : '#2a2a3e',
                    color: active ? '#fff' : '#6b7280', fontSize: '13px', fontWeight: 'bold',
                  }}>{active ? '✓' : ''}</div>
                  <Icon size={16} color={active ? '#10b981' : '#6b7280'} />
                  <div>
                    <div style={{ color: active ? '#fff' : '#6b7280', fontSize: '14px', fontWeight: active ? 'bold' : 'normal' }}>{item.label}</div>
                    <div style={{ color: '#444', fontSize: '11px', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                </div>
              )
            })}

            {setup && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#0a0a0f', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Подтверждено: </span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                  {Object.values(setup.checks).filter(Boolean).length}/5
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Sidebar>
  )
}

