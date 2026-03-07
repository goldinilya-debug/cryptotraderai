'use client'

import Sidebar from '@/components/Sidebar'
import { Layers, BarChart2, TrendingUp, Activity } from 'lucide-react'

const styles = {
  container: { padding: '24px' },
  header: { marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' },
  card: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  cardTitle: { fontWeight: 'bold', fontSize: '16px' },
  chartPlaceholder: { 
    height: '200px', 
    background: '#0a0a0f', 
    borderRadius: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: '#6b7280'
  },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' },
  metric: { background: '#0a0a0f', padding: '12px', borderRadius: '8px' },
  metricLabel: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
  metricValue: { fontSize: '18px', fontWeight: 'bold' },
}

export default function FootprintPage() {
  return (
    <Sidebar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Footprint Charts</h1>
          <p style={styles.subtitle}>Order flow analysis and volume profile</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Layers color="#00d4ff" />
              <span style={styles.cardTitle}>Volume Profile</span>
            </div>
            <div style={styles.chartPlaceholder}>
              Volume Profile Chart
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>POC</p>
                <p style={styles.metricValue}>$71,245</p>
              </div>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Value Area</p>
                <p style={styles.metricValue}>$70.8K - $71.7K</p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <BarChart2 color="#00d4ff" />
              <span style={styles.cardTitle}>Order Flow</span>
            </div>
            <div style={styles.chartPlaceholder}>
              Order Flow Delta
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Buy Volume</p>
                <p style={{ ...styles.metricValue, color: '#10b981' }}>+452 BTC</p>
              </div>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Sell Volume</p>
                <p style={{ ...styles.metricValue, color: '#ef4444' }}>-298 BTC</p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <TrendingUp color="#00d4ff" />
              <span style={styles.cardTitle}>Cumulative Delta</span>
            </div>
            <div style={styles.chartPlaceholder}>
              CVD Chart
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Session Delta</p>
                <p style={{ ...styles.metricValue, color: '#10b981' }}>+154 BTC</p>
              </div>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Delta %</p>
                <p style={styles.metricValue}>+12.4%</p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Activity color="#00d4ff" />
              <span style={styles.cardTitle}>Imbalance Zones</span>
            </div>
            <div style={styles.chartPlaceholder}>
              Imbalance Heatmap
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Active Imbalances</p>
                <p style={styles.metricValue}>3</p>
              </div>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Nearest Zone</p>
                <p style={styles.metricValue}>$70,850</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
