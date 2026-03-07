'use client'

import Sidebar from '@/components/Sidebar'
import { BarChart3, TrendingUp, PieChart, Clock } from 'lucide-react'

const styles = {
  container: { padding: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  card: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  cardTitle: { fontWeight: 'bold', fontSize: '16px' },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  label: { color: '#6b7280' },
  value: (color?: string) => ({ fontWeight: 'bold', color: color || '#fff' }),
  centerBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' },
  bigNumber: { fontSize: '36px', fontWeight: 'bold', color: '#00d4ff' },
  bigLabel: { fontSize: '14px', color: '#6b7280', marginTop: '4px', textAlign: 'center' as const },
}

export default function AnalysisPage() {
  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.title}>Market Analysis</h1>
        <p style={styles.subtitle}>Technical analysis and market insights</p>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <BarChart3 color="#00d4ff" />
              <span style={styles.cardTitle}>Trend Analysis</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>BTC Trend</span>
              <span style={styles.value('#10b981')}>Bullish</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>ETH Trend</span>
              <span style={styles.value('#ef4444')}>Bearish</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>SOL Trend</span>
              <span style={styles.value('#10b981')}>Bullish</span>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <TrendingUp color="#00d4ff" />
              <span style={styles.cardTitle}>Volume Analysis</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>24h Volume</span>
              <span style={styles.value()}>$42.5B</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Buy Pressure</span>
              <span style={styles.value('#10b981')}>58%</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Sell Pressure</span>
              <span style={styles.value('#ef4444')}>42%</span>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <PieChart color="#00d4ff" />
              <span style={styles.cardTitle}>Market Sentiment</span>
            </div>
            <div style={styles.centerBox}>
              <div>
                <p style={styles.bigNumber}>72</p>
                <p style={styles.bigLabel}>Greed Index</p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Clock color="#00d4ff" />
              <span style={styles.cardTitle}>Session Performance</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>London</span>
              <span style={styles.value('#10b981')}>+2.4%</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>New York</span>
              <span style={styles.value('#10b981')}>+1.8%</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Asian</span>
              <span style={styles.value('#ef4444')}>-0.5%</span>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
