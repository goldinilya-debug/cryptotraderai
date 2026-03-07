'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Crosshair, Target, TrendingUp, Activity, Zap } from 'lucide-react'

const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  card: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  cardTitle: { fontWeight: 'bold', fontSize: '16px' },
  scanButton: { 
    width: '100%', 
    padding: '16px', 
    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', 
    borderRadius: '12px', 
    border: 'none', 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  metric: { textAlign: 'center' as const, padding: '16px', background: '#0a0a0f', borderRadius: '8px' },
  metricValue: { fontSize: '24px', fontWeight: 'bold', color: '#00d4ff' },
  metricLabel: { fontSize: '12px', color: '#6b7280', marginTop: '4px' },
  checkItem: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  checkIcon: (active: boolean) => ({ 
    width: '20px', 
    height: '20px', 
    borderRadius: '50%', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? '#10b981' : '#2a2a3e',
    color: active ? '#fff' : '#6b7280',
    fontSize: '12px'
  }),
  signalCard: { 
    background: '#0a0a0f', 
    padding: '20px', 
    borderRadius: '12px', 
    border: '1px solid #10b981' 
  },
  signalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  pair: { fontWeight: 'bold', fontSize: '20px' },
  badge: (isLong: boolean) => ({ 
    padding: '6px 12px', 
    borderRadius: '12px', 
    fontSize: '12px', 
    fontWeight: 'bold', 
    background: isLong ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
    color: isLong ? '#10b981' : '#ef4444' 
  }),
  levels: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' },
  level: { textAlign: 'center' as const },
  levelLabel: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
  levelValue: { fontWeight: 'bold' },
}

export default function SniperPage() {
  const [scanning, setScanning] = useState(false)
  const [setup, setSetup] = useState<any>(null)

  const scan = () => {
    setScanning(true)
    setTimeout(() => {
      setSetup({
        pair: 'BTC/USDT',
        direction: 'LONG',
        entry: 71235.50,
        sl: 69850.00,
        tp: 74400.00,
        confidence: 94,
        confluence: 5,
        timeframe: '4H',
        checks: {
          bos: true,
          ob: true,
          liquidity: true,
          fib: true,
          structure: true
        }
      })
      setScanning(false)
    }, 2000)
  }

  return (
    <Sidebar>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🎯 SMC Sniper</h1>
            <p style={styles.subtitle}>High-confluence Smart Money Concepts signals</p>
          </div>
        </div>

        <div style={styles.grid}>
          <div>
            <button onClick={scan} disabled={scanning} style={styles.scanButton}>
              <Crosshair size={20} />
              {scanning ? 'Scanning...' : 'Scan for Setups'}
            </button>

            {setup && (
              <div style={{ marginTop: '24px' }}>
                <div style={styles.signalCard}>
                  <div style={styles.signalHeader}>
                    <span style={styles.pair}>{setup.pair}</span>
                    <span style={styles.badge(setup.direction === 'LONG')}>{setup.direction}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Confidence</p>
                      <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#00d4ff' }}>{setup.confidence}%</p>
                    </div>
                    <div style={{ textAlign: 'center' as const }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Confluence</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{setup.confluence}/5</p>
                    </div>
                  </div>

                  <div style={styles.levels}>
                    <div style={styles.level}>
                      <p style={styles.levelLabel}>Entry</p>
                      <p style={styles.levelValue}>${setup.entry.toLocaleString()}</p>
                    </div>
                    <div style={styles.level}>
                      <p style={styles.levelLabel}>Stop Loss</p>
                      <p style={{ ...styles.levelValue, color: '#ef4444' }}>${setup.sl.toLocaleString()}</p>
                    </div>
                    <div style={styles.level}>
                      <p style={styles.levelLabel}>Take Profit</p>
                      <p style={{ ...styles.levelValue, color: '#10b981' }}>${setup.tp.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Target color="#00d4ff" />
              <span style={styles.cardTitle}>Confluence Checklist</span>
            </div>

            {[
              { key: 'bos', label: 'Break of Structure', icon: TrendingUp },
              { key: 'ob', label: 'Order Block', icon: Target },
              { key: 'liquidity', label: 'Liquidity Sweep', icon: Activity },
              { key: 'fib', label: 'Fibonacci Zone', icon: Zap },
              { key: 'structure', label: 'Clean Structure', icon: Crosshair },
            ].map((item) => {
              const Icon = item.icon
              const active = setup?.checks?.[item.key] || false
              return (
                <div key={item.key} style={styles.checkItem}>
                  <div style={styles.checkIcon(active)}>{active ? '✓' : ''}</div>
                  <Icon size={16} color={active ? '#10b981' : '#6b7280'} />
                  <span style={{ color: active ? '#fff' : '#6b7280' }}>{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
