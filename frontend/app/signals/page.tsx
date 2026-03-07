'use client'

import Sidebar from '@/components/Sidebar'
import { Activity, Filter, Bell, Search } from 'lucide-react'

export default function SignalsPage() {
  return (
    <Sidebar>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Trading Signals</h1>
            <p className="text-gray-500 mt-1">AI-generated buy/sell signals</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#13131f] rounded-lg flex items-center gap-2 hover:bg-[#1c1c2e]">
              <Filter size={16} />
              Filter
            </button>
            <button className="px-4 py-2 bg-[#13131f] rounded-lg flex items-center gap-2 hover:bg-[#1c1c2e]">
              <Bell size={16} />
              Alerts
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { pair: 'BTC/USDT', direction: 'LONG', entry: 71235, tp: 74403, sl: 69651, confidence: 88, time: '2h ago' },
            { pair: 'ETH/USDT', direction: 'SHORT', entry: 1989, tp: 1836, sl: 2036, confidence: 92, time: '4h ago' },
            { pair: 'SOL/USDT', direction: 'LONG', entry: 145.2, tp: 158.5, sl: 138.9, confidence: 85, time: '6h ago' },
          ].map((signal, i) => (
            <div key={i} className="bg-[#13131f] p-5 rounded-xl border border-[#2a2a3e] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  signal.direction === 'LONG' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <Activity className={signal.direction === 'LONG' ? 'text-green-500' : 'text-red-500'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{signal.pair}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      signal.direction === 'LONG' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {signal.direction}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Entry: ${signal.entry.toLocaleString()} · TP: ${signal.tp.toLocaleString()} · SL: ${signal.sl.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{signal.confidence}%</p>
                <p className="text-sm text-gray-500">{signal.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  )
}
