'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Clock, TrendingUp, AlertCircle } from 'lucide-react'

const ZONES = [
  { name: 'Asian',        start: 0,  end: 3,  color: '#f59e0b', volatility: 'Medium' },
  { name: 'London',       start: 7,  end: 10, color: '#3b82f6', volatility: 'High'   },
  { name: 'New York',     start: 12, end: 15, color: '#10b981', volatility: 'High'   },
  { name: 'London Close', start: 15, end: 17, color: '#a855f7', volatility: 'Medium' },
]

function pad(n: number) { return n.toString().padStart(2, '0') }
function fmtUTC(h: number) { return `${pad(h)}:00 UTC` }

function isActive(utcHour: number, start: number, end: number) {
  if (start < end) return utcHour >= start && utcHour < end
  return utcHour >= start || utcHour < end
}

function getProgress(utcHour: number, utcMin: number, start: number, end: number) {
  const totalMins = (end - start) * 60
  const elapsedMins = (utcHour - start) * 60 + utcMin
  return Math.min(100, Math.max(0, (elapsedMins / totalMins) * 100))
}

function getNextZone(utcHour: number) {
  const sorted = [...ZONES].sort((a, b) => a.start - b.start)
  for (const z of sorted) {
    if (z.start > utcHour) return z
  }
  return sorted[0]
}

export default function KillZonesPage() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const utcH = now.getUTCHours()
  const utcM = now.getUTCMinutes()
  const utcS = now.getUTCSeconds()
  const utcStr = `${pad(utcH)}:${pad(utcM)}:${pad(utcS)} UTC`

  const activeZone = ZONES.find(z => isActive(utcH, z.start, z.end))
  const nextZone = activeZone ? null : getNextZone(utcH)

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Kill Zones</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>High-probability trading sessions</p>
          </div>
          {/* Live clock */}
          <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} color="#00d4ff" />
            <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', color: '#00d4ff' }}>{utcStr}</span>
          </div>
        </div>

        {/* Active zone banner */}
        {activeZone ? (
          <div style={{ background: `${activeZone.color}15`, border: `1px solid ${activeZone.color}40`, borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: activeZone.color, boxShadow: `0 0 8px ${activeZone.color}`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', color: activeZone.color, fontSize: '15px' }}>{activeZone.name} Kill Zone активна</span>
              <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '12px' }}>{fmtUTC(activeZone.start)} – {fmtUTC(activeZone.end)}</span>
              <div style={{ marginTop: '8px', height: '4px', background: '#2a2a3e', borderRadius: '2px' }}>
                <div style={{ height: '4px', background: activeZone.color, borderRadius: '2px', width: `${getProgress(utcH, utcM, activeZone.start, activeZone.end)}%`, transition: 'width 1s' }} />
              </div>
            </div>
          </div>
        ) : nextZone && (
          <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={18} color="#6b7280" />
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>
              Нет активной зоны · Следующая: <span style={{ color: nextZone.color, fontWeight: 'bold' }}>{nextZone.name}</span> в {fmtUTC(nextZone.start)}
            </span>
          </div>
        )}

        {/* Zone cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {ZONES.map(zone => {
            const active = isActive(utcH, zone.start, zone.end)
            const progress = active ? getProgress(utcH, utcM, zone.start, zone.end) : 0

            return (
              <div key={zone.name} style={{
                background: '#13131f', padding: '20px', borderRadius: '12px',
                border: `1px solid ${active ? zone.color + '60' : '#2a2a3e'}`,
                transition: 'border-color 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: zone.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={18} color={zone.color} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>{zone.name}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{fmtUTC(zone.start)} – {fmtUTC(zone.end)}</p>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
                    background: active ? zone.color + '20' : 'rgba(107,114,128,0.15)',
                    color: active ? zone.color : '#6b7280',
                  }}>
                    {active ? '● Active' : 'Closed'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: active ? '12px' : '0' }}>
                  <TrendingUp size={13} color="#6b7280" />
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Volatility:</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: zone.color }}>{zone.volatility}</span>
                </div>

                {active && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#555' }}>Progress</span>
                      <span style={{ fontSize: '11px', color: zone.color }}>{progress.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#2a2a3e', borderRadius: '2px' }}>
                      <div style={{ height: '4px', background: zone.color, borderRadius: '2px', width: `${progress}%`, transition: 'width 1s' }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info */}
        <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertCircle color="#00d4ff" size={18} />
            <span style={{ fontWeight: 'bold' }}>Kill Zone Strategy</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Trade only during high volatility sessions (London, NY, London Close)',
              'Look for breakouts during session opens',
              'Asian session (00:00–03:00 UTC) — range market, avoid unless scalping',
              'Best setups: London–NY overlap (12:00–15:00 UTC)',
            ].map((tip, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px', color: '#9ca3af', fontSize: '14px' }}>
                <span style={{ color: '#00d4ff', flexShrink: 0 }}>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </Sidebar>
  )
}
