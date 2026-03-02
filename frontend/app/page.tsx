'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { SignalCard } from '@/components/SignalCard'
import { MetricCard } from '@/components/MetricCard'
import { KillZoneStatus } from '@/components/KillZoneStatus'
import { Signal } from '@/types'

const MOCK_SIGNALS: Signal[] = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    entry: 63500,
    stopLoss: 62800,
    takeProfit1: 64500,
    takeProfit2: 65500,
    confidence: 82,
    timeframe: '4H',
    exchange: 'Binance',
    status: 'ACTIVE',
    wyckoffPhase: 'accumulation',
    killZone: 'London',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT',
    entry: 2031.69,
    stopLoss: 2054.05,
    takeProfit1: 1961.62,
    takeProfit2: 1928.54,
    confidence: 75,
    timeframe: '4H',
    exchange: 'BingX',
    status: 'ACTIVE',
    wyckoffPhase: 'markup',
    killZone: 'New York',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

const STATS = {
  totalSignals: 42,
  activeSignals: 4,
  winRate: 36,
  hitTP: 13,
  hitSL: 23,
}

export default function Dashboard() {
  const [signals, setSignals] = useState<Signal[]>(MOCK_SIGNALS)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

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
            <span className="text-muted">{format(currentTime, 'HH:mm')} UTC</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Signals"
            value={STATS.totalSignals}
            subtitle="All time generated"
            icon={Activity}
          />
          <MetricCard
            title="Active Signals"
            value={STATS.activeSignals}
            subtitle="Currently open"
            icon={Zap}
            highlight
          />
          <MetricCard
            title="Win Rate"
            value={`${STATS.winRate}%`}
            subtitle={`${STATS.hitTP} wins / ${STATS.hitSL} losses`}
            icon={Target}
            valueColor={STATS.winRate > 50 ? 'text-success' : 'text-warning'}
          />
          <MetricCard
            title="Hit TP"
            value={STATS.hitTP}
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
              <button className="text-sm text-primary hover:underline">
                View All
              </button>
            </div>
            
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <KillZoneStatus />
            
            {/* Quick Actions */}
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-primary text-background rounded-lg font-medium hover:bg-primary-dark transition">
                  Generate Signal
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
