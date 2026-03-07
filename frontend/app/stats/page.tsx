'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { TrendingUp, TrendingDown, Activity, Target, BarChart3, Calendar } from 'lucide-react'

const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280' },
  periodButtons: { display: 'flex', gap: '4px', background: '#13131f', padding: '4px', borderRadius: '8px' },
  periodButton: (active: boolean) => ({ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', background: active ? '#00d4ff' : 'transparent', color: active ? '#000' : '#6b7280' }),
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', padding: '16px' },
  statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: { color: '#6b7280', fontSize: '14px', marginBottom: '4px' },
  statValue: (color: string) => ({ fontSize: '24px', fontWeight: 'bold', color }),
  statSub: { color: '#6b7280', fontSize: '12px', marginTop: '4px' },
  iconBox: (color: string) => ({ padding: '8px', borderRadius: '8px', background: color + '20' }),
  card: { background: '#13131f', borderRadius: '12px', border: '1px solid #2a2a3e', padding: '24px', marginBottom: '24px' },
  cardTitle: { fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  chart: { display: 'flex', alignItems: 'end', gap: '8px', height: '160px' },
  bar: (pnl: number) => ({ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }),
  barFill: (pnl: number) => ({ width: '100%', borderRadius: '4px 4px 0 0', background: pnl >= 0 ? '#10b98180' : '#ef444480', height: `${Math.min(Math.abs(pnl) * 8, 100)}%`, minHeight: '4px' }),
  barLabel: { fontSize: '12px', color: '#6b7280', marginTop: '8px' },
  pairRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#1c1c2e', borderRadius: '8px', marginBottom: '8px' },
  bestWorst: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
}

export default function StatsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const metrics = {
    totalTrades: 47, wins: 32, losses: 15, winRate: 68.1, totalPnL: 124.58,
    avgPnL: 2.65, profitFactor: 2.13, maxDrawdown: -3.2, sharpeRatio: 1.84,
    avgRR: 2.3, bestTrade: 18.45, worstTrade: -5.20,
    byPair: {
      'BTC/USDT': { trades: 18, winRate: 72.2, pnl: 58.30 },
      'ETH/USDT': { trades: 15, winRate: 66.7, pnl: 42.15 },
      'SOL/USDT': { trades: 14, winRate: 64.3, pnl: 24.13 }
    },
    dailyPnL: [
      { date: '2026-03-01', pnl: 5.2 }, { date: '2026-03-02', pnl: -2.1 },
      { date: '2026-03-03', pnl: 8.4 }, { date: '2026-03-04', pnl: 3.7 },
      { date: '2026-03-05', pnl: -1.5 }, { date: '2026-03-06', pnl: 6.8 },
      { date: '2026-03-07', pnl: 4.1 },
    ]
  }

  return (
    <Sidebar>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Trading Statistics</h1>
            <p style={styles.subtitle}>Performance metrics and analytics</p>
          </div>
          <div style={styles.periodButtons}>
            {(['7d', '30d', '90d', 'all'] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} style={styles.periodButton(period === p)}>
                {p === 'all' ? 'All' : p}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.grid4}>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>Total Trades</p>
                <p style={styles.statValue('#00d4ff')}>{metrics.totalTrades}</p>
                <p style={styles.statSub}>{metrics.wins} wins / {metrics.losses} losses</p>
              </div>
              <div style={styles.iconBox('#00d4ff')}><Activity size={20} color="#00d4ff" /></div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>Win Rate</p>
                <p style={styles.statValue(metrics.winRate >= 50 ? '#10b981' : '#ef4444')}>{metrics.winRate.toFixed(1)}%</p>
              </div>
              <div style={styles.iconBox(metrics.winRate >= 50 ? '#10b981' : '#ef4444')}><Target size={20} color={metrics.winRate >= 50 ? '#10b981' : '#ef4444'} /></div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>Total P&L</p>
                <p style={styles.statValue(metrics.totalPnL >= 0 ? '#10b981' : '#ef4444')}>{metrics.totalPnL >= 0 ? '+' : ''}{metrics.totalPnL.toFixed(2)}%</p>
              </div>
              <div style={styles.iconBox(metrics.totalPnL >= 0 ? '#10b981' : '#ef4444')}>{metrics.totalPnL >= 0 ? <TrendingUp size={20} color="#10b981" /> : <TrendingDown size={20} color="#ef4444" />}</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>Profit Factor</p>
                <p style={styles.statValue(metrics.profitFactor >= 1.5 ? '#10b981' : '#f59e0b')}>{metrics.profitFactor.toFixed(2)}</p>
              </div>
              <div style={styles.iconBox('#00d4ff')}><BarChart3 size={20} color="#00d4ff" /></div>
            </div>
          </div>
        </div>

        <div style={styles.grid2}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Sharpe Ratio</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: metrics.sharpeRatio >= 1.5 ? '#10b981' : '#f59e0b' }}>{metrics.sharpeRatio.toFixed(2)}</p>
            <p style={styles.statSub}>Risk/Return</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Max Drawdown</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{metrics.maxDrawdown}%</p>
            <p style={styles.statSub}>Max loss</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Avg R:R</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>1:{metrics.avgRR}</p>
            <p style={styles.statSub}>Average ratio</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Avg Trade</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: metrics.avgPnL >= 0 ? '#10b981' : '#ef4444' }}>{metrics.avgPnL >= 0 ? '+' : ''}{metrics.avgPnL.toFixed(2)}%</p>
            <p style={styles.statSub}>Per trade</p>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}><Calendar size={16} color="#00d4ff" /> P&L History</h3>
          <div style={styles.chart}>
            {metrics.dailyPnL.map((day, idx) => (
              <div key={idx} style={styles.bar(day.pnl)}>
                <div style={styles.barFill(day.pnl)} />
                <p style={styles.barLabel}>{day.date.slice(5)}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
            <span>Best: <span style={{ color: '#10b981' }}>+{Math.max(...metrics.dailyPnL.map(d => d.pnl)).toFixed(1)}%</span></span>
            <span>Worst: <span style={{ color: '#ef4444' }}>{Math.min(...metrics.dailyPnL.map(d => d.pnl)).toFixed(1)}%</span></span>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Statistics by Pair</h3>
          {Object.entries(metrics.byPair).map(([pair, stats]) => (
            <div key={pair} style={styles.pairRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{pair}</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{stats.trades} trades</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: stats.winRate >= 50 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{stats.winRate.toFixed(1)}%</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Win Rate</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: stats.pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{stats.pnl >= 0 ? '+' : ''}{stats.pnl.toFixed(2)}%</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>P&L</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.bestWorst}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Best Trade</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>+{metrics.bestTrade.toFixed(2)}%</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Worst Trade</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{metrics.worstTrade.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
