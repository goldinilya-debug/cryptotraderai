'use client'

import { useState, useEffect } from 'react'
import { Clock, Sunrise, Sun, Sunset, Moon } from 'lucide-react'

interface KillZone {
  name: string
  startHour: number
  endHour: number
  icon: typeof Clock
  volatility: 'low' | 'medium' | 'high'
  description: string
  details: string
}

const KILL_ZONES: KillZone[] = [
  {
    name: 'Asian Kill Zone',
    startHour: 20,
    endHour: 22,
    icon: Moon,
    volatility: 'medium',
    description: 'Range-bound activity expected',
    details: 'Liquidity builds during Asian session. Look for range formation and liquidity pools at session highs/lows.'
  },
  {
    name: 'London Kill Zone',
    startHour: 2,
    endHour: 5,
    icon: Sunrise,
    volatility: 'high',
    description: 'High probability setups',
    details: 'London open typically sweeps Asian session liquidity. Watch for BOS/CHoCH and order block reactions.'
  },
  {
    name: 'New York Kill Zone',
    startHour: 7,
    endHour: 10,
    icon: Sun,
    volatility: 'high',
    description: 'High probability setups',
    details: 'NY session brings highest volume. Ideal for trend continuation or reversal setups with SMC confirmation.'
  },
  {
    name: 'London Close',
    startHour: 10,
    endHour: 12,
    icon: Sunset,
    volatility: 'medium',
    description: 'Range-bound activity expected',
    details: 'London close can trigger reversals. Watch for profit-taking and position squaring by institutional traders.'
  }
]

export function KillZoneStatus() {
  const [currentHour, setCurrentHour] = useState(0)
  
  useEffect(() => {
    // Get current hour in EST
    const getESTHour = () => {
      const now = new Date()
      return now.getUTCHours() - 5 // EST is UTC-5
    }
    setCurrentHour(getESTHour())
    
    const timer = setInterval(() => setCurrentHour(getESTHour()), 60000)
    return () => clearInterval(timer)
  }, [])

  const activeZone = KILL_ZONES.find(z => 
    currentHour >= z.startHour && currentHour < z.endHour
  )

  const formatTime = (hour: number) => {
    const h = hour % 12 || 12
    const ampm = hour < 12 ? 'AM' : 'PM'
    return `${h}:00 ${ampm}`
  }

  return (
    <div className="bg-surface rounded-xl border border-surface-light p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Kill Zone Status</h3>
      </div>

      {activeZone ? (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4 animate-pulse-glow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <activeZone.icon className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">{activeZone.name.toUpperCase()} ACTIVE</span>
            </div>
            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">LIVE</span>
          </div>
          <p className="text-sm text-muted">
            {formatTime(activeZone.startHour)} — {formatTime(activeZone.endHour)} EST • Volatility: {activeZone.volatility}
          </p>
        </div>
      ) : (
        <div className="bg-surface-light rounded-lg p-4 mb-4 text-center">
          <p className="text-muted">No active Kill Zone</p>
          <p className="text-xs text-muted mt-1">Current time (EST): {formatTime(currentHour)}</p>
        </div>
      )}

      <div className="space-y-3">
        {KILL_ZONES.map((zone) => {
          const isActive = activeZone?.name === zone.name
          const Icon = zone.icon
          
          return (
            <div 
              key={zone.name}
              className={`p-3 rounded-lg border transition ${
                isActive 
                  ? 'bg-primary/5 border-primary/30' 
                  : 'bg-surface-light border-surface-light/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted" />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-muted'}`}>
                    {zone.name}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  zone.volatility === 'high' 
                    ? 'bg-danger/20 text-danger' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {zone.volatility}
                </span>
              </div>
              <p className="text-xs text-muted">
                {formatTime(zone.startHour)} — {formatTime(zone.endHour)} EST
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
