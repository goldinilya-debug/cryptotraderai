'use client'

import Sidebar from '@/components/Sidebar'
import { LineChart, Play, Settings, Download } from 'lucide-react'
import { useState } from 'react'

export default function BacktestPage() {
  const [running, setRunning] = useState(false)

  return (
    <Sidebar>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Strategy Backtest</h1>
            <p className="text-gray-500 mt-1">Test your strategies on historical data</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#13131f] rounded-lg flex items-center gap-2 hover:bg-[#1c1c2e]">
              <Settings size={16} />
              Settings
            </button>
            <button className="px-4 py-2 bg-[#13131f] rounded-lg flex items-center gap-2 hover:bg-[#1c1c2e]">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#13131f] p-5 rounded-xl border border-[#2a2a3e]">
            <p className="text-sm text-gray-500 mb-1">Total Trades</p>
            <p className="text-2xl font-bold">156</p>
          </div>
          <div className="bg-[#13131f] p-5 rounded-xl border border-[#2a2a3e]">
            <p className="text-sm text-gray-500 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-green-500">68.5%</p>
          </div>
          <div className="bg-[#13131f] p-5 rounded-xl border border-[#2a2a3e]">
            <p className="text-sm text-gray-500 mb-1">Profit Factor</p>
            <p className="text-2xl font-bold text-green-500">2.4</p>
          </div>
          <div className="bg-[#13131f] p-5 rounded-xl border border-[#2a2a3e]">
            <p className="text-sm text-gray-500 mb-1">Net Profit</p>
            <p className="text-2xl font-bold text-green-500">+24.8%</p>
          </div>
        </div>

        <div className="bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e] mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <LineChart className="text-[#00d4ff]" />
              Backtest Configuration
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">Strategy</label>
              <select className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white">
                <option>SMC + Kill Zones</option>
                <option>Wyckoff Accumulation</option>
                <option>Fibonacci Retracement</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">Timeframe</label>
              <select className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white">
                <option>1H</option>
                <option>4H</option>
                <option>1D</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">Period</label>
              <select className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 6 months</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => setRunning(!running)}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] rounded-lg font-bold flex items-center gap-2 hover:opacity-90"
          >
            <Play size={18} />
            {running ? 'Running...' : 'Run Backtest'}
          </button>
        </div>

        <div className="bg-[#13131f] rounded-xl border border-[#2a2a3e] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0a0a0f]">
              <tr>
                <th className="text-left p-4 text-sm text-gray-500">Date</th>
                <th className="text-left p-4 text-sm text-gray-500">Pair</th>
                <th className="text-left p-4 text-sm text-gray-500">Direction</th>
                <th className="text-left p-4 text-sm text-gray-500">Entry</th>
                <th className="text-left p-4 text-sm text-gray-500">Exit</th>
                <th className="text-left p-4 text-sm text-gray-500">Result</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2026-03-07', pair: 'BTC/USDT', dir: 'LONG', entry: 71235, exit: 72500, result: '+1.8%', win: true },
                { date: '2026-03-06', pair: 'ETH/USDT', dir: 'SHORT', entry: 2100, exit: 1989, result: '+5.3%', win: true },
                { date: '2026-03-05', pair: 'SOL/USDT', dir: 'LONG', entry: 145, exit: 138, result: '-4.8%', win: false },
              ].map((trade, i) => (
                <tr key={i} className="border-t border-[#2a2a3e]">
                  <td className="p-4">{trade.date}</td>
                  <td className="p-4 font-bold">{trade.pair}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.dir === 'LONG' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {trade.dir}
                    </span>
                  </td>
                  <td className="p-4">${trade.entry.toLocaleString()}</td>
                  <td className="p-4">${trade.exit.toLocaleString()}</td>
                  <td className={`p-4 font-bold ${trade.win ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Sidebar>
  )
}
