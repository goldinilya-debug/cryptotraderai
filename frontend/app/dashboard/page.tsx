'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Zap, Activity, TrendingUp, Target, Clock, RefreshCw, BookOpen, ExternalLink } from 'lucide-react'

interface Signal {
  pair: string
  direction: string
  entry: number
  stop_loss: number
  take_profit_1: number
  confidence: number
  status: string
  timeframe: string
  exchange: string
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Fetch real signals from API
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res = await fetch('https://cryptotraderai.onrender.com/api/signals')
        const data = await res.json()
        setSignals(data.signals || [])
        setLastUpdate(new Date().toLocaleTimeString())
      } catch (e) {
        console.error('Error fetching signals:', e)
      }
      setLoading(false)
    }

    fetchSignals()
    const interval = setInterval(fetchSignals, 30000) // Update every 30 sec
    return () => clearInterval(interval)
  }, [])

  const getKillZone = () => {
    // Время Израиля (GMT+3)
    const now = new Date()
    const israelTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)) // GMT+3
    const hour = israelTime.getUTCHours()
    
    // Asian: 00:00-08:00, London: 08:00-16:00, New York: 13:00-21:00, London Close: 14:00-16:00
    if (hour >= 20 || hour < 8) return { name: 'Asian', color: '#f59e0b', active: true }
    if (hour >= 8 && hour < 16) return { name: 'London', color: '#3b82f6', active: true }
    if (hour >= 13 && hour < 21) return { name: 'New York', color: '#10b981', active: true }
    if (hour >= 14 && hour < 16) return { name: 'London Close', color: '#a855f7', active: true }
    return { name: 'None', active: false }
  }

  const kz = getKillZone()
  
  // Calculate real stats
  const activeSignals = signals.filter(s => s.status === 'ACTIVE').length
  const totalSignals = signals.length

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px' }}>Dashboard</h1>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>AI-powered crypto trading signals</p>
            </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {lastUpdate && (
                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                  Updated: {lastUpdate}
                </span>
              )}
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
        </div>

        {/* Stats - только реальные данные */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Signals</span>
              <Zap size={18} color="#6b7280" />
            </div>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold' }}>
              {loading ? '...' : totalSignals}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>From API</p>
          </div>

          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Active Signals</span>
              <Activity size={18} color="#6b7280" />
            </div>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: activeSignals > 0 ? '#10b981' : '#6b7280' }}>
              {loading ? '...' : activeSignals}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Currently open</p>
          </div>

          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Kill Zone</span>
              <Clock size={18} color="#6b7280" />
            </div>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: kz.active ? kz.color : '#6b7280' }}>
              {kz.active ? kz.name.toUpperCase() : 'None'}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: kz.active ? kz.color : '#6b7280' }}>
              {kz.active ? 'Active now' : 'Waiting...'}
            </p>
          </div>

          <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Refresh</span>
              <RefreshCw size={18} color="#6b7280" />
            </div>
            <p style={{ margin: '0', fontSize: '14px', color: '#00d4ff' }}>Every 30 sec</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Auto-update</p>
          </div>
        </div>

        {/* Active Signals */}
        <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Active Signals</h3>
            {loading && <span style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</span>}
          </div>
          
          {signals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>No active signals</p>
              <p style={{ fontSize: '14px' }}>Signals will appear here when generated</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
                        fontWeight: 'bold'
                      }}>
                        {signal.direction}
                      </span>
                    </div>
                    
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>{signal.confidence}%</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Entry</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>${signal.entry?.toLocaleString() || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>SL</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#ef4444' }}>${signal.stop_loss?.toLocaleString() || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>TP</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>${signal.take_profit_1?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{signal.timeframe} · {signal.exchange}</p>
                    
                    <span style={{ 
                      padding: '4px 12px',
                      background: signal.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : '#1c1c2e',
                      color: signal.status === 'ACTIVE' ? '#10b981' : '#6b7280',
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
          )}
        </div>
      </div>
    </Sidebar>
  )
}
