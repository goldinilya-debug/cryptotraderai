'use client'

import Sidebar from '@/components/Sidebar'
import { LineChart, Play, Settings, Download } from 'lucide-react'
import { useState } from 'react'

const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280' },
  buttonGroup: { display: 'flex', gap: '12px' },
  button: { padding: '8px 16px', background: '#13131f', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', color: '#fff', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' },
  statLabel: { fontSize: '14px', color: '#6b7280', marginBottom: '4px' },
  statValue: { fontSize: '24px', fontWeight: 'bold' },
  configCard: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' },
  configHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  configGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' },
  select: { width: '100%', padding: '8px 12px', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff' },
  runButton: { marginTop: '16px', padding: '12px 24px', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  tableCard: { background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { textAlign: 'left' as const, padding: '16px', fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #2a2a3e', background: '#0a0a0f' },
  td: { padding: '16px', borderBottom: '1px solid #2a2a3e' },
  badge: (isLong: boolean) => ({ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: isLong ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isLong ? '#10b981' : '#ef4444' }),
}

export default function BacktestPage() {
  const [running, setRunning] = useState(false)

  const trades = [
    { date: '2026-03-07', pair: 'BTC/USDT', dir: 'LONG', entry: 71235, exit: 72500, result: '+1.8%', win: true },
    { date: '2026-03-06', pair: 'ETH/USDT', dir: 'SHORT', entry: 2100, exit: 1989, result: '+5.3%', win: true },
    { date: '2026-03-05', pair: 'SOL/USDT', dir: 'LONG', entry: 145, exit: 138, result: '-4.8%', win: false },
  ]

  return (
    <Sidebar>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Strategy Backtest</h1>
            <p style={styles.subtitle}>Test your strategies on historical data</p>
          </div>
          <div style={styles.buttonGroup}>
            <button style={styles.button}>
              <Settings size={16} />
              Settings
            </button>
            <button style={styles.button}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Trades</p>
            <p style={styles.statValue}>156</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Win Rate</p>
            <p style={{ ...styles.statValue, color: '#10b981' }}>68.5%</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Profit Factor</p>
            <p style={{ ...styles.statValue, color: '#10b981' }}>2.4</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Net Profit</p>
            <p style={{ ...styles.statValue, color: '#10b981' }}>+24.8%</p>
          </div>
        </div>

        <div style={styles.configCard}>
          <div style={styles.configHeader}>
            <LineChart color="#00d4ff" />
            <span style={{ fontWeight: 'bold' }}>Backtest Configuration</span>
          </div>
          <div style={styles.configGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Strategy</label>
              <select style={styles.select}>
                <option>SMC + Kill Zones</option>
                <option>Wyckoff Accumulation</option>
                <option>Fibonacci Retracement</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Timeframe</label>
              <select style={styles.select}>
                <option>1H</option>
                <option>4H</option>
                <option>1D</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Period</label>
              <select style={styles.select}>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 6 months</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => setRunning(!running)}
            style={styles.runButton}
          >
            <Play size={18} />
            {running ? 'Running...' : 'Run Backtest'}
          </button>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Pair</th>
                <th style={styles.th}>Direction</th>
                <th style={styles.th}>Entry</th>
                <th style={styles.th}>Exit</th>
                <th style={styles.th}>Result</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr key={i}>
                  <td style={styles.td}>{trade.date}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold' }}>{trade.pair}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(trade.dir === 'LONG')}>{trade.dir}</span>
                  </td>
                  <td style={styles.td}>${trade.entry.toLocaleString()}</td>
                  <td style={styles.td}>${trade.exit.toLocaleString()}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: trade.win ? '#10b981' : '#ef4444' }}>
                    {trade.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Sidebar>
  )
}
