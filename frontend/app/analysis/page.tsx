'use client'

import Sidebar from '@/components/Sidebar'
import { BarChart3, TrendingUp, PieChart, Clock } from 'lucide-react'

export default function AnalysisPage() {
  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Market Analysis</h1>
          <p className="text-gray-500 mt-1">Technical analysis and market insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e]">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="text-[#00d4ff]" />
              <h2 className="font-bold">Trend Analysis</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">BTC Trend</span>
                <span className="text-green-500 font-bold">Bullish</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ETH Trend</span>
                <span className="text-red-500 font-bold">Bearish</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SOL Trend</span>
                <span className="text-green-500 font-bold">Bullish</span>
              </div>
            </div>
          </div>

          <div className="bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e]">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-[#00d4ff]" />
              <h2 className="font-bold">Volume Analysis</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">24h Volume</span>
                <span className="font-bold">$42.5B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Buy Pressure</span>
                <span className="text-green-500 font-bold">58%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sell Pressure</span>
                <span className="text-red-500 font-bold">42%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e]">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="text-[#00d4ff]" />
              <h2 className="font-bold">Market Sentiment</h2>
            </div>
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#00d4ff]">72</p>
                <p className="text-sm text-gray-500 mt-1">Greed Index</p>
              </div>
            </div>
          </div>

          <div className="bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e]">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-[#00d4ff]" />
              <h2 className="font-bold">Session Performance</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">London</span>
                <span className="text-green-500 font-bold">+2.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">New York</span>
                <span className="text-green-500 font-bold">+1.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Asian</span>
                <span className="text-red-500 font-bold">-0.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
