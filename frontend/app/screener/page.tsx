'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Search, Play, RefreshCw, Clock, Zap, Filter, ChevronDown } from 'lucide-react'

interface ScreenerResult {
  pair: string
  score: number
  price: number
  trend: 'bullish' | 'bearish' | 'neutral'
  smc: 'bullish' | 'bearish' | 'neutral'
  wyckoff: string
  signal: string
  confidence: number
  rr: string
}

const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'DOT/USDT']

export default function ScreenerPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeframe, setTimeframe] = useState('4H')
  const [minScore, setMinScore] = useState(50)
  const [results, setResults] = useState<ScreenerResult[]>([])
  const [lastRun, setLastRun] = useState<Date | null>(null)
  const [autoScreener, setAutoScreener] = useState(true)

  const runScreener = async () => {
    setIsRunning(true)
    
    // Simulate screening
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResults = PAIRS.map(pair => ({
      pair,
      score: Math.floor(Math.random() * 40) + 20,
      price: pair === 'BTC/USDT' ? 68726 : pair === 'ETH/USDT' ? 3450 : Math.random() * 200 + 50,
      trend: (Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral') as 'bullish' | 'bearish' | 'neutral',
      smc: (Math.random() > 0.5 ? 'bullish' : 'bearish') as 'bullish' | 'bearish',
      wyckoff: ['Accumulation', 'Markup', 'Distribution', 'Markdown'][Math.floor(Math.random() * 4)],
      signal: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'LONG' : 'SHORT') : '—',
      confidence: Math.floor(Math.random() * 30) + 60,
      rr: Math.random() > 0.5 ? '1:2.5' : '—'
    })).filter(r => r.score >= minScore)

    setResults(mockResults)
    setLastRun(new Date())
    setIsRunning(false)
  }

  const getTrendColor = (trend: string) => {
    switch(trend) {
      case 'bullish': return '#10b981'
      case 'bearish': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search size={32} color="#00d4ff" />
                Multi-Pair Screener
              </h1>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Automatically analyze watchlist pairs during Kill Zones</p>
            </div>
            
            <button
              onClick={runScreener}
              disabled={isRunning}
              style={{
                padding: '12px 24px',
                background: isRunning ? '#2a2a3e' : '#00d4ff',
                color: '#0a0a0f',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isRunning ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={18} />}
              {isRunning ? 'Screening...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Control Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {/* Kill Zone Status */}
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#6b7280' }}>
              <Clock size={18} />
              <span>Kill Zone Status</span>
            </div>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '20px',
              color: '#10b981',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              NEW YORK
            </div>
            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#6b7280' }}>13:00 EST — 16:00 EST</p>
            <span style={{ 
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 12px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#f59e0b'
            }}>
              Volatility: medium
            </span>
          </div>

          {/* Auto-Screener */}
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#6b7280' }}>
              <Zap size={18} />
              <span>Auto-Screener Scheduler</span>
            </div>
            
            <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>Kill Zone Trigger</p>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280' }}>Auto-screen when entering a Kill Zone</p>
            
            <button
              onClick={() => setAutoScreener(!autoScreener)}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                background: autoScreener ? '#10b981' : '#2a2a3e',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.3s'
              }}
            >
              <span style={{
                position: 'absolute',
                top: '3px',
                left: autoScreener ? '25px' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.3s'
              }} />
            </button>
            
            {autoScreener && (
              <div style={{ 
                marginTop: '12px',
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Zap size={12} />
                Active — checks every 5 min
              </div>
            )}
          </div>

          {/* Manual Screening */}
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#6b7280' }}>
              <Filter size={18} />
              <span>Manual Screening</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                style={{
                  padding: '10px 16px',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="1H">1H</option>
                <option value="4H">4H</option>
                <option value="1D">1D</option>
              </select>
              
              <button
                onClick={runScreener}
                disabled={isRunning}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  background: isRunning ? '#2a2a3e' : '#00d4ff',
                  color: '#0a0a0f',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Play size={16} />
                Run Screener ({PAIRS.length} pairs)
              </button>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Min Score:</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{minScore}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  background: '#2a2a3e',
                  borderRadius: '3px',
                  outline: 'none',
                  appearance: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            {/* Results Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Last Screening Session</h3>
                {lastRun && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                    Completed {lastRun.toLocaleTimeString()} · 5 pairs
                  </p>
                )}
              </div>
              
              <div style={{ 
                padding: '6px 16px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '20px',
                color: '#10b981',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                ✅ Completed
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Pairs Analyzed', value: `${PAIRS.length}/${PAIRS.length}` },
                { label: 'Signals Found', value: results.filter(r => r.signal !== '—').length.toString(), color: '#10b981' },
                { label: 'Best Setups', value: results.filter(r => r.score >= 60).length.toString(), color: '#10b981' },
                { label: 'Avg Score', value: Math.floor(results.reduce((s, r) => s + r.score, 0) / results.length).toString(), color: '#f59e0b' },
                { label: 'Errors', value: '0', color: '#10b981' }
              ].map((stat, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>{stat.label}</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: stat.color || '#fff' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Results Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['Pair', 'Score', 'Price', 'Trend', 'SMC', 'Wyckoff', 'Signal', 'Confidence', 'R:R'].map((h) => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1c1c2e' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{result.pair}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ color: getScoreColor(result.score), fontWeight: 'bold' }}>{result.score}</span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>${result.price.toFixed(2)}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          color: getTrendColor(result.trend),
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {result.trend === 'bullish' ? '📈' : result.trend === 'bearish' ? '📉' : '—'} {result.trend}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          padding: '4px 10px',
                          background: result.smc === 'bullish' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: result.smc === 'bullish' ? '#10b981' : '#ef4444',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {result.smc}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', color: '#9ca3af' }}>{result.wyckoff}</td>
                      <td style={{ padding: '16px 12px' }}>
                        {result.signal !== '—' ? (
                          <span style={{
                            padding: '4px 10px',
                            background: result.signal === 'LONG' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: result.signal === 'LONG' ? '#10b981' : '#ef4444',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {result.signal}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>{result.confidence}%</td>
                      <td style={{ padding: '16px 12px' }}>{result.rr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
