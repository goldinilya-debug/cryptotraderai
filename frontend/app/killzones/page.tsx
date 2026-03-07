'use client'

import Sidebar from '@/components/Sidebar'
import { Clock, Globe, TrendingUp, AlertCircle } from 'lucide-react'

export default function KillZonesPage() {
  const zones = [
    { name: 'Asian', time: '00:00 - 08:00 UTC', status: 'Closed', color: '#6b7280', volatility: 'Low' },
    { name: 'London', time: '08:00 - 16:00 UTC', status: 'Closed', color: '#3b82f6', volatility: 'Medium' },
    { name: 'New York', time: '13:00 - 21:00 UTC', status: 'Active', color: '#10b981', volatility: 'High' },
    { name: 'London Close', time: '14:00 - 16:00 UTC', status: 'Closed', color: '#a855f7', volatility: 'High' },
  ]

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Kill Zones</h1>
          <p className="text-gray-500 mt-1">High-probability trading sessions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {zones.map((zone) => (
            <div key={zone.name} className="bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${zone.color}20` }}>
                    <Clock style={{ color: zone.color }} />
                  </div>
                  <div>
                    <h2 className="font-bold">{zone.name}</h2>
                    <p className="text-sm text-gray-500">{zone.time}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  zone.status === 'Active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                }`}>
                  {zone.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={14} className="text-gray-500" />
                <span className="text-gray-500">Volatility:</span>
                <span className="font-bold" style={{ color: zone.color }}>{zone.volatility}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e]">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-[#00d4ff]" />
            <h2 className="font-bold">Kill Zone Strategy</h2>
          </div>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-[#00d4ff]">•</span>
              <span>Trade only during high volatility sessions (London, NY, London Close)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d4ff]">•</span>
              <span>Look for breakouts during session opens</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d4ff]">•</span>
              <span>Avoid trading during Asian session unless scalping</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d4ff]">•</span>
              <span>Best setups: London-NY overlap (13:00-16:00 UTC)</span>
            </li>
          </ul>
        </div>
      </div>
    </Sidebar>
  )
}
