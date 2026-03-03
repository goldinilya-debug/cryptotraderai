'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Zap
} from 'lucide-react'
import { MetricCard } from '@/components/MetricCard'
import { KillZoneStatus } from '@/components/KillZoneStatus'

// Demo данные для начального отображения
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
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0f',
        color: '#fff',
        padding: '20px'
      }}>
        <header style={{ borderBottom: '1px solid #1c1c2e', padding: '20px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '24px' }}>📈</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px' }}>CryptoTraderAI</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>AI-powered trading signals</p>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 20px' }}>
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
      <header style={{ borderBottom: '1px solid #1c1c2e', padding: '16px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #00d4ff, #00a8cc)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>📈</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>CryptoTraderAI</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>AI-powered trading signals</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
            <div style={{ width: '8px', height: '8px', background: '#00c853', borderRadius: '50%' }}></div>
            <span>Live</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <!-- Stats Grid -->
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>Total Signals</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{DEMO_STATS.totalSignals}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>All time generated</p>
          </div>

          <div style={{ background: 'rgba(0, 212, 255, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>Active Signals</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00d4ff' }}>{DEMO_STATS.activeSignals}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>Currently open</p>
          </div>

          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>Win Rate</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#ffb300' }}>{DEMO_STATS.winRate}%</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>{DEMO_STATS.hitTP} wins / {DEMO_STATS.hitSL} losses</p>
          </div>

          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>Hit TP</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00c853' }}>{DEMO_STATS.hitTP}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>Take profit reached</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <!-- Active Signals -->
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Active Signals</h2>
            </div>

            <!-- Signal Card -->
            <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1c1c2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>₿</span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>BTC/USDT</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>4h • binance</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    background: 'rgba(0, 200, 83, 0.1)', 
                    color: '#00c853', 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    LONG
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>82%</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0' }}>Entry</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: 0 }}>$63,500</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0' }}>Stop Loss</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: 0, color: '#ff5252' }}>$62,800</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0' }}>TP1</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: 0, color: '#00c853' }}>$64,500</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0' }}>TP2</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: 0, color: '#00c853' }}>$65,500</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #1c1c2e' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                  <span>Wyckoff: <strong style={{ color: '#fff' }}>accumulation</strong></span>
                  <span>KZ: <strong style={{ color: '#fff' }}>london</strong></span>
                  <span>R:R <strong style={{ color: '#fff' }}>1:1.4</strong></span>
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '4px 8px', 
                  background: 'rgba(0, 212, 255, 0.1)', 
                  color: '#00d4ff',
                  borderRadius: '4px'
                }}>
                  ACTIVE
                </span>
              </div>
            </div>

            <!-- ETH Signal -->
            <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1c1c2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Ξ</span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>ETH/USDT</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>4h • bingx</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    background: 'rgba(255, 82, 82, 0.1)', 
                    color: '#ff5252', 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    SHORT
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>75%</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0' }}>Entry</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: 0 }}>$2,031.69</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0' }}>Stop Loss</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: 0, color: '#ff5252' }}>$2,054.05</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0' }}>TP1</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: 0, color: '#00c853' }}>$1,961.62</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0' }}>TP2</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: 0, color: '#00c853' }}>$1,928.54</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #1c1c2e' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                  <span>Wyckoff: <strong style={{ color: '#fff' }}>markup</strong></span>
                  <span>KZ: <strong style={{ color: '#fff' }}>new york</strong></span>
                  <span>R:R <strong style={{ color: '#fff' }}>1:3.1</strong></span>
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '4px 8px', 
                  background: 'rgba(0, 212, 255, 0.1)', 
                  color: '#00d4ff',
                  borderRadius: '4px'
                }}>
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div>
            <KillZoneStatus />

            <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{ 
                  padding: '12px', 
                  background: '#00d4ff', 
                  color: '#0a0a0f', 
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                  Generate Signal
                </button>
                <button style={{ 
                  padding: '12px', 
                  background: '#1c1c2e', 
                  color: '#fff', 
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  View Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}