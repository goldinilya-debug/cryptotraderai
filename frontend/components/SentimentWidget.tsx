'use client'

// Файл: components/SentimentWidget.tsx

import { useState, useEffect } from 'react'

type SentimentData = {
  fearGreed: { value: number; classification: string } | null
  fundingRate: { rate: number; pct: string; nextFundingTime: number } | null
  longShort: { longPct: number; shortPct: number; ratio: string } | null
}

function fgColor(v: number) {
  if (v <= 20) return '#ef4444'
  if (v <= 40) return '#f97316'
  if (v <= 60) return '#eab308'
  if (v <= 80) return '#84cc16'
  return '#22c55e'
}

function fgLabel(c: string) {
  const map: Record<string, string> = {
    'Extreme Fear': 'Крайний страх',
    'Fear': 'Страх',
    'Neutral': 'Нейтрально',
    'Greed': 'Жадность',
    'Extreme Greed': 'Крайняя жадность',
  }
  return map[c] ?? c
}

function timeUntil(ts: number) {
  const diff = ts - Date.now()
  if (diff <= 0) return 'сейчас'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return h > 0 ? `${h}ч ${m}м` : `${m}м`
}

export default function SentimentWidget() {
  const [data, setData] = useState<SentimentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/sentiment')
        if (res.ok) setData(await res.json())
      } catch {}
      finally { setLoading(false) }
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  const fg = data?.fearGreed
  const fr = data?.fundingRate
  const ls = data?.longShort

  const frColor = fr
    ? fr.rate > 0.0001 ? '#22c55e' : fr.rate < -0.0001 ? '#ef4444' : '#9ca3af'
    : '#9ca3af'

  return (
    <div style={s.wrap}>
      {/* Заголовок */}
      <div style={s.header}>
        <span style={s.dot} />
        <span style={s.title}>Рынок</span>
      </div>

      {/* Fear & Greed */}
      <div style={s.block}>
        <span style={s.label}>Fear & Greed</span>
        {loading ? <div style={s.skel} /> : fg ? (
          <div style={s.fgRow}>
            <span style={{ ...s.fgNum, color: fgColor(fg.value) }}>{fg.value}</span>
            <div style={s.fgBar}>
              <div style={{ ...s.fgFill, width: `${fg.value}%`, background: fgColor(fg.value) }} />
            </div>
            <span style={{ ...s.fgTag, color: fgColor(fg.value) }}>{fgLabel(fg.classification)}</span>
          </div>
        ) : <span style={s.err}>—</span>}
      </div>

      {/* Funding Rate */}
      <div style={s.block}>
        <span style={s.label}>Funding Rate</span>
        {loading ? <div style={s.skel} /> : fr ? (
          <div style={s.row}>
            <span style={{ ...s.val, color: frColor }}>{fr.pct}</span>
            <span style={s.sub}>через {timeUntil(fr.nextFundingTime)}</span>
          </div>
        ) : <span style={s.err}>—</span>}
      </div>

      {/* Long / Short */}
      <div style={s.block}>
        <span style={s.label}>Long / Short</span>
        {loading ? <div style={s.skel} /> : ls ? (
          <>
            <div style={s.lsBar}>
              <div style={{ ...s.lsLong, width: `${ls.longPct}%` }} />
              <div style={{ ...s.lsShort, width: `${ls.shortPct}%` }} />
            </div>
            <div style={s.lsLabels}>
              <span style={{ color: '#22c55e' }}>{ls.longPct}%</span>
              <span style={{ color: '#ef4444' }}>{ls.shortPct}%</span>
            </div>
          </>
        ) : <span style={s.err}>—</span>}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    margin: '8px 12px',
    padding: '12px',
    background: '#0d0d1a',
    border: '1px solid #1c1c2e',
    borderRadius: '10px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px #22c55e',
  },
  title: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  block: {
    marginBottom: '10px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    color: '#4b5563',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  fgRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  fgNum: {
    fontSize: '18px',
    fontWeight: '800',
    lineHeight: 1,
    minWidth: '28px',
  },
  fgBar: {
    flex: 1,
    height: '4px',
    background: '#1e293b',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  fgFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  fgTag: {
    fontSize: '9px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  val: {
    fontSize: '13px',
    fontWeight: '700',
  },
  sub: {
    fontSize: '10px',
    color: '#374151',
  },
  lsBar: {
    display: 'flex',
    height: '4px',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '3px',
  },
  lsLong: {
    background: 'linear-gradient(90deg, #16a34a, #22c55e)',
    transition: 'width 0.5s ease',
  },
  lsShort: {
    background: 'linear-gradient(90deg, #ef4444, #dc2626)',
    transition: 'width 0.5s ease',
  },
  lsLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    fontWeight: '700',
  },
  skel: {
    height: '20px',
    background: '#1e293b',
    borderRadius: '4px',
  },
  err: {
    color: '#374151',
    fontSize: '12px',
  },
}
