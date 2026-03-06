'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Target, BarChart3, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PerformanceMetrics {
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnL: number
  avgPnL: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  avgRR: number
  bestTrade: number
  worstTrade: number
  byPair: Record<string, { trades: number; winRate: number; pnl: number }>
  dailyPnL: { date: string; pnl: number }[]
}

export default function StatsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Demo data - will be replaced with real data from backend
  const metrics: PerformanceMetrics = {
    totalTrades: 47,
    wins: 32,
    losses: 15,
    winRate: 68.1,
    totalPnL: 124.58,
    avgPnL: 2.65,
    profitFactor: 2.13,
    maxDrawdown: -3.2,
    sharpeRatio: 1.84,
    avgRR: 2.3,
    bestTrade: 18.45,
    worstTrade: -5.20,
    byPair: {
      'BTC/USDT': { trades: 18, winRate: 72.2, pnl: 58.30 },
      'ETH/USDT': { trades: 15, winRate: 66.7, pnl: 42.15 },
      'SOL/USDT': { trades: 14, winRate: 64.3, pnl: 24.13 }
    },
    dailyPnL: [
      { date: '2026-03-01', pnl: 5.2 },
      { date: '2026-03-02', pnl: -2.1 },
      { date: '2026-03-03', pnl: 8.4 },
      { date: '2026-03-04', pnl: 3.7 },
      { date: '2026-03-05', pnl: -1.5 },
      { date: '2026-03-06', pnl: 6.8 },
      { date: '2026-03-07', pnl: 4.1 },
    ]
  }

  const StatCard = ({ 
    title, 
    value, 
    suffix = '', 
    icon: Icon, 
    color,
    subtext 
  }: { 
    title: string
    value: string | number
    suffix?: string
    icon: any
    color: string
    subtext?: string
  }) => (
    <div style={{ 
      background: '#13131f', 
      borderRadius: '12px', 
      border: '1px solid #1c1c2e',
      padding: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>{title}</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>
            {value}{suffix}
          </p>
          {subtext && (
            <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{subtext}</p>
          )}
        </div>
        <div style={{ 
          padding: '8px', 
          borderRadius: '8px', 
          background: color + '20'
        }}>
          <Icon style={{ width: '20px', height: '20px', color: color }} />
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid #1c1c2e', 
        padding: '16px 24px',
        background: '#13131f'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ 
              color: '#6b7280', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Назад
            </Link>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BarChart3 style={{ color: '#00d4ff' }} />
              Торговая Статистика
            </h1>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            background: '#1c1c2e',
            padding: '4px',
            borderRadius: '8px'
          }}>
            {(['7d', '30d', '90d', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: period === p ? '#00d4ff' : 'transparent',
                  color: period === p ? '#000' : '#6b7280'
                }}
              >
                {p === 'all' ? 'Всё' : p}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Main Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <StatCard
            title="Всего сделок"
            value={metrics.totalTrades}
            icon={Activity}
            color="#00d4ff"
            subtext={`${metrics.wins} побед / ${metrics.losses} убытков`}
          />
          <StatCard
            title="Win Rate"
            value={metrics.winRate.toFixed(1)}
            suffix="%"
            icon={Target}
            color={metrics.winRate >= 50 ? '#10b981' : '#ef4444'}
          />
          <StatCard
            title="Total P&L"
            value={metrics.totalPnL >= 0 ? '+' : ''}
            suffix={`${metrics.totalPnL.toFixed(2)} USDT`}
            icon={metrics.totalPnL >= 0 ? TrendingUp : TrendingDown}
            color={metrics.totalPnL >= 0 ? '#10b981' : '#ef4444'}
          />
          <StatCard
            title="Profit Factor"
            value={metrics.profitFactor.toFixed(2)}
            icon={BarChart3}
            color={metrics.profitFactor >= 1.5 ? '#10b981' : '#f59e0b'}
            subtext={metrics.profitFactor >= 2 ? 'Отлично' : 'Хорошо'}
          />
        </div>

        {/* Advanced Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Sharpe Ratio</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: metrics.sharpeRatio >= 1.5 ? '#10b981' : '#f59e0b' }}>
              {metrics.sharpeRatio.toFixed(2)}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Риск/доходность</p>
          </div>
          <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Max Drawdown</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
              {metrics.maxDrawdown}%
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Макс просадка</p>
          </div>
          <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Avg R:R</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>
              1:{metrics.avgRR}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Среднее соотношение</p>
          </div>
          <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Avg Trade</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: metrics.avgPnL >= 0 ? '#10b981' : '#ef4444' }}>
              {metrics.avgPnL >= 0 ? '+' : ''}{metrics.avgPnL.toFixed(2)}%
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Средняя сделка</p>
          </div>
        </div>

        {/* PnL Chart */}
        <div style={{ 
          background: '#13131f', 
          borderRadius: '12px', 
          border: '1px solid #1c1c2e', 
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar style={{ width: '16px', height: '16px', color: '#00d4ff' }} />
            Динамика P&L
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '160px' }}>
            {metrics.dailyPnL.map((day, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    borderRadius: '4px 4px 0 0',
                    background: day.pnl >= 0 ? '#10b98180' : '#ef444480',
                    height: `${Math.min(Math.abs(day.pnl) * 8, 100)}%`,
                    minHeight: '4px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  {day.date.slice(5)}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>
              Лучший день: <span style={{ color: '#10b981' }}>+{Math.max(...metrics.dailyPnL.map(d => d.pnl)).toFixed(1)}</span>
            </span>
            <span style={{ color: '#6b7280' }}>
              Худший день: <span style={{ color: '#ef4444' }}>{Math.min(...metrics.dailyPnL.map(d => d.pnl)).toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Stats by Pair */}
        <div style={{ 
          background: '#13131f', 
          borderRadius: '12px', 
          border: '1px solid #1c1c2e', 
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Статистика по парам</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(metrics.byPair).map(([pair, stats]) => (
              <div 
                key={pair} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  background: '#1c1c2e',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>{pair}</span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{stats.trades} сделок</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: stats.winRate >= 50 ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                      {stats.winRate.toFixed(1)}%
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Win Rate</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: stats.pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                      {stats.pnl >= 0 ? '+' : ''}{stats.pnl.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>P&L</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best/Worst Trades */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Лучшая сделка</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>+{metrics.bestTrade.toFixed(2)}%</p>
          </div>
          <div style={{ background: '#13131f', borderRadius: '12px', border: '1px solid #1c1c2e', padding: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Худшая сделка</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{metrics.worstTrade.toFixed(2)}%</p>
          </div>
        </div>
      </main>
    </div>
  )
}
