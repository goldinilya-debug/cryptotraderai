'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Activity, 
  Search, 
  BarChart3, 
  Clock, 
  Target, 
  LineChart, 
  Brain,
  Layers, 
  MessageCircle,
  User,
  Zap
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/signals', label: 'Signals', icon: Activity },
  { href: '/screener', label: 'Screener', icon: Search },
  { href: '/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/killzones', label: 'Kill Zones', icon: Clock },
  { href: '/fibzones', label: 'Fib Zones', icon: Target },
  { href: '/backtest', label: 'Backtest', icon: LineChart },
  { href: '/ml', label: 'ML Model', icon: Brain },
  { href: '/tradingview', label: 'TradingView', icon: Layers },
  { href: '/telegram', label: 'Telegram', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="w-60 bg-[#13131f] border-r border-[#1c1c2e] flex flex-col fixed h-screen overflow-y-auto z-50">
        {/* Logo */}
        <div className="p-5 border-b border-[#1c1c2e]">
          <Link href="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">CryptoTraderAI</span>
          </Link>
        </div>

        {/* Kill Zone */}
        <div className="p-4 border-b border-[#1c1c2e]">
          <p className="text-xs text-gray-500 mb-2">Active Kill Zone</p>
          <div className="px-3 py-2 bg-[#10b98120] rounded-lg border border-[#10b981] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-[#10b981] font-bold text-sm">NEW YORK</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">High volatility expected</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-all duration-200 no-underline ${
                  isActive 
                    ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00d4ff]"></span>}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#1c1c2e]">
          <Link href="/profile" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">User</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
