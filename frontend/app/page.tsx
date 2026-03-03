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

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span>📈</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px' }}>CryptoTraderAI</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>AI-powered trading signals</p>
            </div>
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            <span style={{ marginRight: '8px' }}>●</span> Live • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>Total Signals</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{DEMO_STATS.totalSignals}</p>
          </div>
          <div style={{ background: 'rgba(0, 212, 255, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>Active Signals</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00d4ff' }}>{DEMO_STATS.activeSignals}</p>
          </div>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>Win Rate</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#ffb300' }}>{DEMO_STATS.winRate}%</p>
          </div>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>Hit TP</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00c853' }}>{DEMO_STATS.hitTP}</p>
          </div>
        </div>

        {/* Signals */}
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Active Signals</h2>
        
        {/* BTC Signal */}
        <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>BTC/USDT</h3>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>4h • binance</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: 'rgba(0, 200, 83, 0.1)', color: '#00c853', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>LONG</span>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0' }}>82%</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>Entry</p><p style={{ fontFamily: 'monospace', margin: '4px 0 0' }}>$63,500</p></div>
            <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>SL</p><p style={{ color: '#ff5252', fontFamily: 'monospace', margin: '4px 0 0' }}>$62,800</p></div>
            <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP1</p><p style={{ color: '#00c853', fontFamily: 'monospace', margin: '4px 0 0' }}>$64,500</p></div>
            <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP2</p><p style={{ color: '#00c853', fontFamily: 'monospace', margin: '4px 0 0' }}>$65,500</p></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', paddingTop: '12px', borderTop: '1px solid #1c1c2e' }}>
            <span>Wyckoff: accumulation | KZ: london | R:R 1:1.4</span>
            <span style={{ color: '#00d4ff' }}>ACTIVE</span>
          </div>
        </div>

        {/* ETH Signal */}
        <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>ETH/USDT</h3>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>4h • bingx</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: 'rgba(255, 82, 82, 0.1)', color: '#ff5252', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>SHORT</span>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0' }}>75%</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>Entry</p><p style={{ fontFamily: 'monospace', margin: '4px 0 0' }}>$2,031.69</p></div>
            <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>SL</p><p style={{ color: '#ff5252', fontFamily: 'monospace', margin: '4px 0 0' }}>$2,054.05</p></div>
            <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP1</p><p style={{ color: '#00c853', fontFamily: 'monospace', margin: '4px 0 0' }}>$1,961.62</p></div>
            <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP2</p><p style={{ color: '#00c853', fontFamily: 'monospace', margin: '4px 0 0' }}>$1,928.54</p></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', paddingTop: '12px', borderTop: '1px solid #1c1c2e' }}>
            <span>Wyckoff: markup | KZ: new york | R:R 1:3.1</span>
            <span style={{ color: '#00d4ff' }}>ACTIVE</span>
          </div>
        </div>
      </main>
    </div>
  )
}
