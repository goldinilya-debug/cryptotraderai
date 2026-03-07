'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Zap, Activity, Target, TrendingUp, Clock, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const [signals, setSignals] = useState([
    { pair: 'ETH/USDT', direction: 'SHORT', entry: 1989.63, sl: 2036.74, tp1: 1836.00, confidence: 88, status: 'ACTIVE', timeframe: '4h', exchange: 'bingx' },
    { pair: 'BTC/USDT', direction: 'LONG', entry: 71235.70, sl: 69651.91, tp1: 74403.28, confidence: 88, status: 'HIT SL', timeframe: '4h', exchange: 'bingx' },
    { pair: 'ETH/USDT', direction: 'LONG', entry: 2118.80, sl: 2085.87, tp1: 2185.73, confidence: 92, status: 'HIT SL', timeframe: '4h', exchange: 'bingx' },
  ])

  const stats = {
    totalSignals: 50,
    activeSignals: 1,
    winRate: 28,
    wins: 13,
    losses: 34,
    hitTP: 13
  }

  const getKillZone = () => {
    const hour = new Date().getUTCHours()
    if (hour >= 0 && hour < 8) return { name: 'Asian', color: '#f59e0b', active: true }
    if (hour >= 8 && hour < 16) return { name: 'London', color: '#3b82f6', active: true }
    if (hour >= 13 && hour < 21) return { name: 'New York', color: '#10b981', active: true }
    if (hour >= 14 && hour < 16) return { name: 'London Close', color: '#a855f7', active: true }
    return { name: 'None', active: false }
  }

  const kz = getKillZone()

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px' }}>Dashboard</h1>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>AI-powered crypto trading signals overview</p>
            </div>
            
            <div style={{ 
              padding: '8px 16px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '20px',
              color: '#10b981',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              Live
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Signals</span>
              <Zap size={18} color="#6b7280" />
            </div>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold' }}>{stats.totalSignals}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>All time generated</p>
          </div>

          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Active Signals</span>
              <Activity size={18} color="#6b7280" />
            </div>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold' }}>{stats.activeSignals}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Currently open</p>
          </div>

          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Win Rate</span>
              <TrendingUp size={18} color="#6b7280" />
            </div>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: stats.winRate >= 50 ? '#10b981' : '#ef4444' }}>{stats.winRate}%</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: stats.winRate >= 50 ? '#10b981' : '#ef4444' }}>{stats.wins} wins / {stats.losses} losses</p>
          </div>

          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Hit TP</span>
              <Target size={18} color="#6b7280" />
            </div>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.hitTP}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#10b981' }}>Take profit reached</p>
          </div>
        </div>

        {/* Second Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Kill Zone Status */}
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={18} color="#6b7280" />
              <span style={{ color: '#6b7280' }}>Kill Zone Status</span>
            </div>
            
            {kz.active ? (
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: `${kz.color}20`,
                border: `1px solid ${kz.color}`,
                borderRadius: '20px',
                color: kz.color,
                fontWeight: 'bold'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: kz.color, animation: 'pulse 2s infinite' }} />
                {kz.name.toUpperCase()} ACTIVE
              </div>
            ) : (
              <div style={{ color: '#6b7280' }}>No active kill zone</div>
            )}
            
            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Volatility: medium · High probability setups expected</p>
          </div>

          {/* Active Positions */}
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={18} color="#6b7280" />
              <span style={{ color: '#6b7280' }}>Active Positions</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  padding: '6px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ▼ SHORT
                </span>
                <span style={{ fontWeight: 'bold' }}>ETH/USDT</span>
              </div>
              
              <span style={{ fontFamily: 'monospace', color: '#ef4444' }}>$1,989.63</span>
            </div>
          </div>
        </div>

        {/* Recent Signals */}
        <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Recent Signals</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {signals.map((signal, idx) => (
              <div key={idx} style={{ background: '#0a0a0f', padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{signal.pair}</span>
                    <span style={{ 
                      padding: '4px 12px',
                      background: signal.direction === 'LONG' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: signal.direction === 'LONG' ? '#10b981' : '#ef4444',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {signal.direction === 'LONG' ? '▲' : '▼'} {signal.direction}
                    </span>
                  </div>
                  
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{signal.confidence}%</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Entry</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>${signal.entry.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>SL</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#ef4444' }}>${signal.sl.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>TP1</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>${signal.tp1.toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{signal.timeframe} · {signal.exchange}</p>
                  
                  <span style={{ 
                    padding: '4px 12px',
                    background: signal.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: signal.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {signal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
