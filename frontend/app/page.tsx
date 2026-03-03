'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Zap,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { SignalCard } from '@/components/SignalCard'
import { MetricCard } from '@/components/MetricCard'
import { KillZoneStatus } from '@/components/KillZoneStatus'
import { Signal } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cryptotraderai-api.onrender.com'

export default function Dashboard() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [stats, setStats] = useState({
    totalSignals: 42,
    activeSignals: 4,
    winRate: 36,
    hitTP: 13,
    hitSL: 23,
  })
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const fetchSignals = async () => {
    if (typeof window === 'undefined') return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/signals`)
      if (res.ok) {
        const data = await res.json()
        if (data.signals && data.signals.length > 0) {
          setSignals(data.signals)
        }
      }
    } catch (e) {
      console.log('API not available, using demo data')
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    if (typeof window === 'undefined') return
    try {
      const res = await fetch(`${API_URL}/api/performance/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.log('Stats API not available')
    }
  }

  const generateSignal = async () => {
    if (typeof window === 'undefined') return
    setGenerating(true)
    try {
      const res = await fetch(`${API_URL}/api/signals/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: 'BTC/USDT', timeframe: '4H', exchange: 'binance' })
      })
      if (res.ok) {
        await fetchSignals()
      }
    } catch (e) {
      alert('Error generating signal - API not ready')
    }
    setGenerating(false)
  }

  if (!mounted) {
    return <div style={{ background: '#0a0a0f', minHeight: '100vh' }} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-surface-light">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CryptoTraderAI</h1>
              <p className="text-sm text-muted">AI-powered trading signals</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted">Live</span>
            <span className="text-muted">•</span>
            <span className="text-muted">{format(currentTime, 'HH:mm')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Signals"
            value={stats.totalSignals}
            subtitle="All time generated"
            icon={Activity}
          />
          <MetricCard
            title="Active Signals"
            value={stats.activeSignals}
            subtitle="Currently open"
            icon={Zap}
            highlight
          />
          <MetricCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            subtitle={`${stats.hitTP} wins / ${stats.hitSL} losses`}
            icon={Target}
            valueColor={stats.winRate > 50 ? 'text-success' : 'text-warning'}
          />
          <MetricCard
            title="Hit TP"
            value={stats.hitTP}
            subtitle="Take profit reached"
            icon={TrendingUp}
            valueColor="text-success"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Signals */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Signals</h2>
              <button 
                onClick={fetchSignals}
                className="text-sm text-primary hover:underline"
              >
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted mt-2">Loading signals...</p>
              </div>
            ) : signals.length > 0 ? (
              signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))
            ) : (
              <div className="bg-surface rounded-xl p-8 text-center border border-surface-light">
                <p className="text-muted">No active signals from API</p>
                <p className="text-sm text-muted mt-1">Click Generate to create a signal</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <KillZoneStatus />
            
            {/* Quick Actions */}
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={generateSignal}
                  disabled={generating}
                  className="w-full py-2 px-4 bg-primary text-background rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {generating ? 'Generating...' : 'Generate Signal'}
                </button>
                <button className="w-full py-2 px-4 bg-surface-light rounded-lg font-medium hover:bg-surface-light/80 transition">
                  View Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
