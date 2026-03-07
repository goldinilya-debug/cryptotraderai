'use client'

import Sidebar from '@/components/Sidebar'
import { Activity, Filter, Bell } from 'lucide-react'

const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280' },
  buttonGroup: { display: 'flex', gap: '12px' },
  button: { padding: '8px 16px', background: '#13131f', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', color: '#fff', cursor: 'pointer' },
  signalCard: { background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  signalLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  signalIcon: (isLong: boolean) => ({ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isLong ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }),
  signalTitle: { display: 'flex', alignItems: 'center', gap: '8px' },
  pair: { fontWeight: 'bold', fontSize: '18px' },
  badge: (isLong: boolean) => ({ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: isLong ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isLong ? '#10b981' : '#ef4444' }),
  signalInfo: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  signalRight: { textAlign: 'right' as const },
  confidence: { fontSize: '24px', fontWeight: 'bold' },
  time: { fontSize: '14px', color: '#6b7280' },
}

export default function SignalsPage() {
  const signals = [
    { pair: 'BTC/USDT', direction: 'LONG', entry: 71235, tp: 74403, sl: 69651, confidence: 88, time: '2h ago' },
    { pair: 'ETH/USDT', direction: 'SHORT', entry: 1989, tp: 1836, sl: 2036, confidence: 92, time: '4h ago' },
    { pair: 'SOL/USDT', direction: 'LONG', entry: 145.2, tp: 158.5, sl: 138.9, confidence: 85, time: '6h ago' },
  ]

  return (
    <Sidebar>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Trading Signals</h1>
            <p style={styles.subtitle}>AI-generated buy/sell signals</p>
          </div>
          <div style={styles.buttonGroup}>
            <button style={styles.button}>
              <Filter size={16} />
              Filter
            </button>
            <button style={styles.button}>
              <Bell size={16} />
              Alerts
            </button>
          </div>
        </div>

        <div>
          {signals.map((signal, i) => {
            const isLong = signal.direction === 'LONG'
            return (
              <div key={i} style={styles.signalCard}>
                <div style={styles.signalLeft}>
                  <div style={styles.signalIcon(isLong)}>
                    <Activity color={isLong ? '#10b981' : '#ef4444'} />
                  </div>
                  <div>
                    <div style={styles.signalTitle}>
                      <span style={styles.pair}>{signal.pair}</span>
                      <span style={styles.badge(isLong)}>{signal.direction}</span>
                    </div>
                    <p style={styles.signalInfo}>Entry: ${signal.entry.toLocaleString()} · TP: ${signal.tp.toLocaleString()} · SL: ${signal.sl.toLocaleString()}</p>
                  </div>
                </div>
                <div style={styles.signalRight}>
                  <p style={styles.confidence}>{signal.confidence}%</p>
                  <p style={styles.time}>{signal.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Sidebar>
  )
}
