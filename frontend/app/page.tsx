'use client'

import { useState, useEffect } from 'react'

// Demo данные
const DEMO_STATS = {
  totalSignals: 42,
  activeSignals: 4,
  winRate: 36,
  hitTP: 13,
  hitSL: 23,
}

const SIGNALS = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    confidence: 82,
    entry: 63500,
    stopLoss: 62800,
    takeProfit1: 64500,
    takeProfit2: 65500,
    wyckoffPhase: 'accumulation',
    killZone: 'London',
    timeframe: '4H',
    exchange: 'Binance',
    status: 'ACTIVE'
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT',
    confidence: 75,
    entry: 2031.69,
    stopLoss: 2054.05,
    takeProfit1: 1961.62,
    takeProfit2: 1928.54,
    wyckoffPhase: 'markup',
    killZone: 'New York',
    timeframe: '4H',
    exchange: 'BingX',
    status: 'ACTIVE'
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    direction: 'LONG',
    confidence: 68,
    entry: 142.50,
    stopLoss: 138.00,
    takeProfit1: 150.00,
    takeProfit2: 158.00,
    wyckoffPhase: 'accumulation',
    killZone: 'Asian',
    timeframe: '4H',
    exchange: 'Binance',
    status: 'ACTIVE'
  },
  {
    id: '4',
    pair: 'AVAX/USDT',
    direction: 'SHORT',
    confidence: 71,
    entry: 38.20,
    stopLoss: 39.50,
    takeProfit1: 35.80,
    takeProfit2: 33.50,
    wyckoffPhase: 'distribution',
    killZone: 'London Close',
    timeframe: '4H',
    exchange: 'KuCoin',
    status: 'ACTIVE'
  }
]

// Kill Zone данные
const KILL_ZONES = [
  { name: 'Asian Kill Zone', time: '20:00 - 22:00 EST', volatility: 'Medium', active: false },
  { name: 'London Kill Zone', time: '02:00 - 05:00 EST', volatility: 'High', active: false },
  { name: 'New York Kill Zone', time: '07:00 - 10:00 EST', volatility: 'High', active: true },
  { name: 'London Close', time: '10:00 - 12:00 EST', volatility: 'Medium', active: false },
]

const API_URL = 'https://cryptotraderai-api.onrender.com'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [signals, setSignals] = useState(SIGNALS)
  const [generating, setGenerating] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const generateSignal = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`${API_URL}/api/signals/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: 'BTC/USDT', timeframe: '4H', exchange: 'binance' })
      })
      if (res.ok) {
        const newSignal = await res.json()
        setSignals([newSignal, ...signals])
      } else {
        // Fallback: добавляем демо-сигнал
        const demoSignal = {
          id: Date.now().toString(),
          pair: 'BTC/USDT',
          direction: Math.random() > 0.5 ? 'LONG' : 'SHORT',
          confidence: Math.floor(Math.random() * 20) + 70,
          entry: 63500 + Math.random() * 1000,
          stopLoss: 62000,
          takeProfit1: 65000,
          takeProfit2: 66000,
          wyckoffPhase: 'accumulation',
          killZone: 'New York',
          timeframe: '4H',
          exchange: 'Binance',
          status: 'ACTIVE'
        }
        setSignals([demoSignal, ...signals])
      }
    } catch (e) {
      // Fallback при ошибке
      const demoSignal = {
        id: Date.now().toString(),
        pair: 'BTC/USDT',
        direction: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        confidence: Math.floor(Math.random() * 20) + 70,
        entry: 63500,
        stopLoss: 62800,
        takeProfit1: 64500,
        takeProfit2: 65500,
        wyckoffPhase: 'accumulation',
        killZone: 'New York',
        timeframe: '4H',
        exchange: 'Binance',
        status: 'ACTIVE'
      }
      setSignals([demoSignal, ...signals])
    }
    setGenerating(false)
  }

  const getDirectionColor = (dir: string) => dir === 'LONG' ? '#00c853' : '#ff5252'
  const getDirectionBg = (dir: string) => dir === 'LONG' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 82, 82, 0.1)'
  const getPairIcon = (pair: string) => pair.includes('BTC') ? '₿' : pair.includes('ETH') ? 'Ξ' : pair.includes('SOL') ? '◎' : '◈'
  const calcRR = (entry: number, sl: number, tp: number) => ((tp - entry) / (entry - sl)).toFixed(1)

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1c1c2e', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', height: '40px', 
              background: 'linear-gradient(135deg, #00d4ff, #00a8cc)', 
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px'
            }}>
              📈
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px' }}>CryptoTraderAI</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>AI-powered trading signals</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
            <div style={{ width: '8px', height: '8px', background: '#00c853', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            <span>Live</span>
            <span>•</span>
            <span>{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>Total Signals</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{DEMO_STATS.totalSignals}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>All time generated</p>
          </div>
          <div style={{ background: 'rgba(0, 212, 255, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>Active Signals</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00d4ff' }}>{signals.length}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>Currently open</p>
          </div>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>Win Rate</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#ffb300' }}>{DEMO_STATS.winRate}%</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{DEMO_STATS.hitTP} wins / {DEMO_STATS.hitSL} losses</p>
          </div>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>Hit TP</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00c853' }}>{DEMO_STATS.hitTP}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>Take profit reached</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* Signals */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Active Signals</h2>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>{signals.length} signals</span>
            </div>
            
            {signals.map((signal) => (
              <div key={signal.id} style={{ background: '#13131f', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #1c1c2e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', background: '#1c1c2e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                    }}>
                      {getPairIcon(signal.pair)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px' }}>{signal.pair}</h3>
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{signal.timeframe.toLowerCase()} • {signal.exchange.toLowerCase()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      background: getDirectionBg(signal.direction), 
                      color: getDirectionColor(signal.direction), 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {signal.direction}
                    </span>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0' }}>{signal.confidence}%</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>Entry</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${signal.entry.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>Stop Loss</p>
                    <p style={{ color: '#ff5252', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${signal.stopLoss.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP1</p>
                    <p style={{ color: '#00c853', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${signal.takeProfit1.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP2</p>
                    <p style={{ color: '#00c853', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${signal.takeProfit2.toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', paddingTop: '12px', borderTop: '1px solid #1c1c2e' }}>
                  <span>Wyckoff: <strong style={{ color: '#fff' }}>{signal.wyckoffPhase}</strong> | KZ: <strong style={{ color: '#fff' }}>{signal.killZone.toLowerCase()}</strong> | R:R <strong style={{ color: '#fff' }}>1:{calcRR(signal.entry, signal.stopLoss, signal.takeProfit1)}</strong></span>
                  <span style={{ color: '#00d4ff' }}>{signal.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div>
            {/* Kill Zones */}
            <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #1c1c2e' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⏰ Kill Zone Status
              </h3>
              
              {KILL_ZONES.map((zone, idx) => (
                <div key={idx} style={{ 
                  padding: '12px', 
                  marginBottom: '8px', 
                  borderRadius: '8px',
                  background: zone.active ? 'rgba(0, 212, 255, 0.1)' : '#1c1c2e',
                  border: zone.active ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: zone.active ? 'bold' : 'normal', color: zone.active ? '#00d4ff' : '#fff' }}>
                      {zone.name}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      background: zone.volatility === 'High' ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 179, 0, 0.2)',
                      color: zone.volatility === 'High' ? '#ff5252' : '#ffb300'
                    }}>
                      {zone.volatility}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{zone.time}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px', border: '1px solid #1c1c2e' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={generateSignal}
                  disabled={generating}
                  style={{ 
                    padding: '12px', 
                    background: generating ? '#1c1c2e' : '#00d4ff', 
                    color: generating ? '#6b7280' : '#0a0a0f', 
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {generating ? '⏳ Generating...' : '⚡ Generate Signal'}
                </button>
                <button style={{ 
                  padding: '12px', 
                  background: '#1c1c2e', 
                  color: '#fff', 
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  📊 View Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
