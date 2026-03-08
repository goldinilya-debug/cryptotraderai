'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { Activity, Bell, TrendingUp, History, Volume2 } from 'lucide-react'

// Types
interface Signal {
  active: boolean
  type: string
  entry: number
  sl: number
  tp: number
  probability: string
  symbol?: string
  timestamp?: string
}

interface TradeHistory {
  time: string
  type: string
  entry: number
  result: string
  symbol?: string
}

// Styles
const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' },
  card: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  cardTitle: { fontWeight: 'bold', fontSize: '16px' },
  chartContainer: { 
    height: '400px', 
    background: '#0a0a0f', 
    borderRadius: '8px',
    position: 'relative' as const
  },
  signalCard: (active: boolean) => ({
    background: active ? 'rgba(16, 185, 129, 0.1)' : '#0a0a0f',
    border: active ? '1px solid #10b981' : '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  }),
  signalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  label: { color: '#6b7280', fontSize: '14px' },
  value: (color?: string) => ({ fontWeight: 'bold', fontSize: '18px', color: color || '#fff' }),
  badge: (type: string) => ({
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    background: type.includes('BULLISH') ? 'rgba(16, 185, 129, 0.2)' : type.includes('BEARISH') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 212, 255, 0.2)',
    color: type.includes('BULLISH') ? '#10b981' : type.includes('BEARISH') ? '#ef4444' : '#00d4ff'
  }),
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
    borderRadius: '8px',
    border: 'none',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { textAlign: 'left' as const, padding: '12px', borderBottom: '1px solid #2a2a3e', color: '#6b7280', fontSize: '12px' },
  td: { padding: '12px', borderBottom: '1px solid #2a2a3e', cursor: 'pointer' },
  notification: {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    background: '#13131f',
    border: '1px solid #10b981',
    borderRadius: '12px',
    padding: '16px',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
  }
}

export default function SMCAnalysisPage() {
  const [signal, setSignal] = useState<Signal | null>(null)
  const [history, setHistory] = useState<TradeHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<Signal | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
    
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  // Fetch signal data
  const startAnalysis = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://cryptotraderai-api.onrender.com/analyze?symbol=BTC/USDT')
      const data = await res.json()
      
      if (data.setup?.active) {
        setSignal(data.setup)
        
        // Play sound
        if (audioRef.current) {
          audioRef.current.play().catch(() => {})
        }
        
        // Show notification
        setNotification(data.setup)
        setTimeout(() => setNotification(null), 5000)
        
        // Browser push notification
        if (Notification.permission === 'granted') {
          new Notification('🚀 НОВЫЙ СЕТАП: BTC/USDT', {
            body: `Вход: ${data.setup.entry} | Вероятность: ${data.setup.probability}`,
            icon: '/favicon.ico'
          })
        }
        
        // Draw levels on chart (simulated)
        drawLevels(data.setup)
      }
      
      // Fetch history
      const historyRes = await fetch('https://cryptotraderai-api.onrender.com/history')
      const historyData = await historyRes.json()
      setHistory(historyData.history || [])
      
    } catch (e) {
      console.error('Error fetching data:', e)
    }
    setLoading(false)
  }

  // Draw price levels (placeholder for lightweight-charts integration)
  const drawLevels = (setup: Signal) => {
    // This would integrate with lightweight-charts
    console.log('Drawing levels:', setup)
  }

  // Poll for new signals every 30 seconds
  useEffect(() => {
    const interval = setInterval(startAnalysis, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Sidebar>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📊 SMC Real-Time Analysis</h1>
            <p style={styles.subtitle}>Smart Money Concepts with FVG detection</p>
          </div>
          <button 
            style={styles.button} 
            onClick={startAnalysis}
            disabled={loading}
          >
            <Activity size={18} />
            {loading ? 'Analyzing...' : 'Start Analysis'}
          </button>
        </div>

        <div style={styles.grid}>
          {/* Chart Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <TrendingUp color="#00d4ff" />
              <span style={styles.cardTitle}>Price Chart</span>
            </div>
            <div style={styles.chartContainer} ref={chartContainerRef}>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {signal?.active ? (
                  <div>
                    <p>Current Price: ${signal.entry}</p>
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ 
                        padding: '8px 16px', 
                        background: '#6366f1', 
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}>Entry: ${signal.entry}</div>
                      <div style={{ 
                        padding: '8px 16px', 
                        background: '#22c55e', 
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}>TP: ${signal.tp}</div>
                      <div style={{ 
                        padding: '8px 16px', 
                        background: '#ef4444', 
                        borderRadius: '4px'
                      }}>SL: ${signal.sl}</div>
                    </div>
                  </div>
                ) : (
                  <p>Waiting for FVG signal...</p>
                )}
              </div>
            </div>
          </div>

          {/* Active Signal */}
          <div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Bell color="#00d4ff" />
                <span style={styles.cardTitle}>Active Signal</span>
              </div>

              {signal?.active ? (
                <div style={styles.signalCard(true)}>
                  <div style={{ ...styles.signalRow, alignItems: 'center' }}>
                    <span style={styles.label}>Type</span>
                    <span style={styles.badge(signal.type)}>{signal.type}</span>
                  </div>
                  
                  <div style={styles.signalRow}>
                    <span style={styles.label}>Entry</span>
                    <span style={styles.value('#6366f1')}>${signal.entry}</span>
                  </div>
                  
                  <div style={styles.signalRow}>
                    <span style={styles.label}>Take Profit</span>
                    <span style={styles.value('#22c55e')}>${signal.tp}</span>
                  </div>
                  
                  <div style={styles.signalRow}>
                    <span style={styles.label}>Stop Loss</span>
                    <span style={styles.value('#ef4444')}>${signal.sl}</span>
                  </div>
                  
                  <div style={{ ...styles.signalRow, marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a2a3e' }}>
                    <span style={styles.label}>Probability</span>
                    <span style={{ ...styles.value('#10b981'), fontSize: '24px' }}>{signal.probability}</span>
                  </div>
                </div>
              ) : (
                <div style={styles.signalCard(false)}>
                  <p style={{ textAlign: 'center', color: '#6b7280' }}>No active signal<br />Click "Start Analysis" to scan</p>
                </div>
              )}
            </div>

            {/* Filters Status */}
            <div style={{ ...styles.card, marginTop: '16px' }}>
              <div style={styles.cardHeader}>
                <Volume2 color="#00d4ff" />
                <span style={styles.cardTitle}>Filter Status</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Relative Volume', status: '> 1.5', active: true },
                  { label: 'Trend Filter (EMA 200)', status: 'Aligned', active: true },
                  { label: 'FVG Pattern', status: signal?.type?.includes('FVG') ? 'Detected' : 'Scanning...', active: signal?.type?.includes('FVG') || false },
                ].map((filter, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>{filter.label}</span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: filter.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      color: filter.active ? '#10b981' : '#6b7280'
                    }}>
                      {filter.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div style={{ ...styles.card, marginTop: '24px' }}>
          <div style={styles.cardHeader}>
            <History color="#00d4ff" />
            <span style={styles.cardTitle}>📜 Trade History (Last 10 Signals)</span>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Entry</th>
                <th style={styles.th}>Result</th>
              </tr>
            </thead>            
            <tbody>
              {history.length > 0 ? (
                history.map((trade, i) => (
                  <tr key={i} style={{ transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1c1c2e'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}>{trade.time}</td>
                    <td style={styles.td}>
                      <span style={styles.badge(trade.type)}>{trade.type}</span>
                    </td>
                    <td style={styles.td}>${trade.entry}</td>
                    <td style={styles.td}>
                      <span style={{ 
                        color: trade.result === 'PENDING' ? '#f59e0b' : 
                               trade.result === 'WIN' ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {trade.result}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ ...styles.td, textAlign: 'center', color: '#6b7280' }}>
                    No signals yet. Waiting for FVG patterns...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Notification Popup */}
        {notification && (
          <div style={styles.notification}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🚀
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>НОВЫЙ СЕТАП!</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>{notification.type} @ ${notification.entry}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
