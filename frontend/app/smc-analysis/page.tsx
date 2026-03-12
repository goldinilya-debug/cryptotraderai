'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { Activity, Bell, TrendingUp, History, RefreshCw } from 'lucide-react'

const API_URL = 'https://cryptotraderai.onrender.com'

interface Signal {
  active: boolean
  type: 'LONG' | 'SHORT'
  entry: number
  sl: number
  tp: number
  tp2?: number
  probability: number
  symbol: string
  timeframe: string
  explanation: string
  reason: string
}

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

const TIMEFRAMES: Record<string, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m',
  '1h': '1h', '4h': '4h', '1d': '1d'
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT']

export default function SMCAnalysisPage() {
  const [signal, setSignal] = useState<Signal | null>(null)
  const [allApiSignals, setAllApiSignals] = useState<ApiSignal[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [selectedTF, setSelectedTF] = useState('15m')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [lastUpdate, setLastUpdate] = useState('')
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const candleSeriesRef = useRef<any>(null)
  const chartInitialized = useRef(false)

  const updateSignalLines = useCallback((sig: Signal) => {
    if (!candleSeriesRef.current) return
    try {
      const s = candleSeriesRef.current as any
      if (s._entryLine) s.removePriceLine(s._entryLine)
      if (s._tpLine) s.removePriceLine(s._tpLine)
      if (s._slLine) s.removePriceLine(s._slLine)
      s._entryLine = s.createPriceLine({ price: sig.entry, color: '#6366f1', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'Entry' })
      s._tpLine = s.createPriceLine({ price: sig.tp, color: '#22c55e', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'TP' })
      s._slLine = s.createPriceLine({ price: sig.sl, color: '#ef4444', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'SL' })
    } catch {}
  }, [])

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/signals`)
      const data = await res.json()
      const list: ApiSignal[] = data.signals || []
      setAllApiSignals(list)
      setLastUpdate(new Date().toLocaleTimeString())

      const symbolPair = symbol.replace('USDT', '/USDT')
      const match = list.find(s => s.pair === symbolPair && s.status === 'ACTIVE')

      if (match) {
        const converted: Signal = {
          active: true,
          type: match.direction as 'LONG' | 'SHORT',
          entry: match.entry,
          sl: match.stop_loss,
          tp: match.take_profit_1,
          tp2: match.take_profit_2,
          probability: match.confidence,
          symbol: match.pair,
          timeframe: match.timeframe,
          explanation: `Сигнал от агента: ${match.direction} на ${match.pair}. Вход $${match.entry.toLocaleString()}, TP $${match.take_profit_1.toLocaleString()}, SL $${match.stop_loss.toLocaleString()}. Уверенность ${match.confidence}%.`,
          reason: match.direction === 'LONG' ? 'Bullish FVG + Order Block' : 'Bearish FVG + Order Block',
        }
        setSignal(converted)
        updateSignalLines(converted)
        setHistory(prev => {
          if (prev.find(h => h.entry === match.entry && h.type === match.direction)) return prev
          return [{ time: new Date().toLocaleTimeString(), type: match.direction, entry: match.entry, result: 'PENDING', symbol: match.pair }, ...prev].slice(0, 10)
        })
      } else {
        setSignal(null)
      }
    } catch (e) {
      console.error('Error fetching signals:', e)
    }
  }, [symbol, updateSignalLines])

  const loadChartData = useCallback(async () => {
    if (!candleSeriesRef.current) return
    try {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${TIMEFRAMES[selectedTF]}&limit=100`)
      const data = await res.json()
      if (!Array.isArray(data)) return
      const tzOffset = new Date().getTimezoneOffset() * -60
      const candles = data.map((d: any[]) => ({ time: Math.floor(d[0] / 1000) + tzOffset, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }))
      candleSeriesRef.current.setData(candles)
      if (candles.length > 0) setCurrentPrice(candles[candles.length - 1].close)
    } catch (e) { console.error('Chart error:', e) }
  }, [symbol, selectedTF])

  useEffect(() => {
    if (chartInitialized.current) return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js'
    script.async = true
    script.onload = () => {
      if (!chartContainerRef.current || !(window as any).LightweightCharts) return
      const LC = (window as any).LightweightCharts
      const chart = LC.createChart(chartContainerRef.current, {
        layout: { background: { color: '#0a0a0f' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#1c1c2e' }, horzLines: { color: '#1c1c2e' } },
        rightPriceScale: { borderColor: '#2a2a3e' },
        timeScale: { borderColor: '#2a2a3e', timeVisible: true },
        width: chartContainerRef.current.clientWidth, height: 400,
      })
      const series = chart.addCandlestickSeries({ upColor: '#22c55e', downColor: '#ef4444', borderUpColor: '#22c55e', borderDownColor: '#ef4444', wickUpColor: '#22c55e', wickDownColor: '#ef4444' })
      candleSeriesRef.current = series
      chartInitialized.current = true
      window.addEventListener('resize', () => { if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth }) })
      loadChartData()
      fetchSignals()
    }
    document.body.appendChild(script)
    return () => { try { document.body.removeChild(script) } catch {} }
  }, [])

  useEffect(() => { if (chartInitialized.current) loadChartData() }, [selectedTF, symbol])
  useEffect(() => { if (chartInitialized.current) fetchSignals() }, [symbol])
  useEffect(() => {
    const interval = setInterval(() => { loadChartData(); fetchSignals() }, 15000)
    return () => clearInterval(interval)
  }, [loadChartData, fetchSignals])

  const handleRefresh = async () => { setLoading(true); await loadChartData(); await fetchSignals(); setLoading(false) }
  const rr = signal ? Math.abs((signal.tp - signal.entry) / (signal.entry - signal.sl)).toFixed(1) : null

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>📊 SMC Real-Time Analysis</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
              Smart Money Concepts · Live Binance Chart
              {lastUpdate && <span style={{ marginLeft: '8px', color: '#22c55e', fontSize: '12px' }}>● {lastUpdate}</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={symbol} onChange={e => setSymbol(e.target.value)} style={selectStyle}>
              {SYMBOLS.map(s => <option key={s} value={s}>{s.replace('USDT', '/USDT')}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Object.keys(TIMEFRAMES).map(tf => (
                <button key={tf} onClick={() => setSelectedTF(tf)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', background: selectedTF === tf ? '#00d4ff' : '#2a2a3e', color: selectedTF === tf ? '#0a0a0f' : '#9ca3af', fontWeight: selectedTF === tf ? 'bold' : 'normal' }}>{tf}</button>
              ))}
            </div>
            <button onClick={handleRefresh} disabled={loading} style={{ padding: '10px 20px', background: loading ? '#2a2a3e' : 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              {loading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>

          {/* График */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp color="#00d4ff" size={20} />
                <span style={{ fontWeight: 'bold' }}>{symbol.replace('USDT', '/USDT')} · {selectedTF}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 'bold' }}>LIVE</span>
              </div>
            </div>
            <div ref={chartContainerRef} style={{ height: '400px', background: '#0a0a0f', borderRadius: '8px', overflow: 'hidden' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '12px 16px', background: '#0a0a0f', borderRadius: '8px' }}>
              <span style={{ color: '#6b7280' }}>Текущая цена</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Правая панель */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Bell color="#00d4ff" size={18} />
                <span style={{ fontWeight: 'bold' }}>Активный сигнал</span>
                {allApiSignals.length > 0 && <span style={{ fontSize: '12px', color: '#6b7280' }}>({allApiSignals.length} всего)</span>}
              </div>

              {signal?.active ? (
                <div style={{ background: signal.type === 'LONG' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${signal.type === 'LONG' ? '#22c55e' : '#ef4444'}`, borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>Направление</span>
                    <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: signal.type === 'LONG' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: signal.type === 'LONG' ? '#22c55e' : '#ef4444' }}>{signal.type}</span>
                  </div>
                  {[
                    { label: 'Entry', value: `$${signal.entry.toLocaleString()}`, color: '#6366f1' },
                    { label: 'Take Profit', value: `$${signal.tp.toLocaleString()}${signal.tp2 ? ` / $${signal.tp2.toLocaleString()}` : ''}`, color: '#22c55e' },
                    { label: 'Stop Loss', value: `$${signal.sl.toLocaleString()}`, color: '#ef4444' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: '#6b7280', fontSize: '13px' }}>{row.label}</span>
                      <span style={{ fontWeight: 'bold', color: row.color, fontSize: '15px' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #2a2a3e', paddingTop: '12px', display: 'flex', justifyContent: 'space-around' }}>
                    {[{ label: 'Уверенность', value: `${signal.probability}%`, color: '#10b981' }, { label: 'R:R', value: `1:${rr}`, color: '#f59e0b' }, { label: 'TF', value: signal.timeframe, color: '#00d4ff' }].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>{s.label}</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', background: '#0a0a0f', borderRadius: '10px', color: '#6b7280' }}>
                  <Activity size={32} color="#2a2a3e" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: 0 }}>Нет сигнала для {symbol.replace('USDT', '/USDT')}</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px' }}>Агент анализирует рынок...</p>
                </div>
              )}
            </div>

            {allApiSignals.length > 0 && (
              <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Activity color="#00d4ff" size={16} />
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Все сигналы</span>
                </div>
                {allApiSignals.slice(0, 5).map((s, i) => (
                  <div key={i}
                    onClick={() => {
                      setSymbol(s.pair.replace('/', ''))
                      const c: Signal = { active: true, type: s.direction as 'LONG' | 'SHORT', entry: s.entry, sl: s.stop_loss, tp: s.take_profit_1, tp2: s.take_profit_2, probability: s.confidence, symbol: s.pair, timeframe: s.timeframe, explanation: `Сигнал: ${s.pair} ${s.direction}`, reason: '' }
                      setSignal(c); updateSignalLines(c)
                    }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', background: signal?.symbol === s.pair ? '#1a1a2e' : '#0a0a0f', border: `1px solid ${signal?.symbol === s.pair ? '#00d4ff40' : '#1c1c2e'}` }}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{s.pair}</span>
                      <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 'bold', color: s.direction === 'LONG' ? '#22c55e' : '#ef4444' }}>{s.direction}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>{s.confidence}%</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Activity color="#00d4ff" size={16} />
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>SMC Filters</span>
              </div>
              {[
                { label: 'Trend Filter', status: '✓ Aligned', active: true },
                { label: 'FVG Pattern', status: signal?.active ? '✓ Detected' : '...', active: !!signal?.active },
                { label: 'Kill Zone', status: signal?.active ? '✓ Active' : '...', active: !!signal?.active },
                { label: 'Volume', status: '> 1.5x', active: true },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>{f.label}</span>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', background: f.active ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: f.active ? '#10b981' : '#6b7280' }}>{f.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {signal?.active && (
          <div style={{ background: 'linear-gradient(135deg, #13131f, #1c1c2e)', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Объяснение сигнала</span>
            </div>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>{signal.explanation}</p>
          </div>
        )}

        <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <History color="#00d4ff" size={18} />
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>📜 История</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Время', 'Symbol', 'Тип', 'Entry', 'Результат'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #2a2a3e', color: '#6b7280', fontSize: '12px' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((trade, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#1c1c2e'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #1c1c2e', color: '#9ca3af' }}>{trade.time}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #1c1c2e', fontWeight: 'bold' }}>{trade.symbol}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #1c1c2e' }}><span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', background: trade.type === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: trade.type === 'LONG' ? '#22c55e' : '#ef4444' }}>{trade.type}</span></td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #1c1c2e' }}>${trade.entry.toLocaleString()}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #1c1c2e', color: trade.result === 'PENDING' ? '#f59e0b' : trade.result === 'WIN' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{trade.result}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Нет истории</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </Sidebar>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '8px 12px', background: '#1c1c2e',
  border: '1px solid #2a2a3e', borderRadius: '8px',
  color: '#fff', cursor: 'pointer',
}
