'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  Target, 
  Clock, 
  LineChart, 
  Search,
  Settings,
  User,
  Zap,
  Brain,
  Layers,
  MessageCircle
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
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getActiveKillZone = () => {
    const hour = currentTime.getUTCHours()
    if (hour >= 0 && hour < 8) return { name: 'Asian', color: '#f59e0b', active: true }
    if (hour >= 8 && hour < 16) return { name: 'London', color: '#3b82f6', active: true }
    if (hour >= 13 && hour < 21) return { name: 'New York', color: '#10b981', active: true }
    if (hour >= 14 && hour < 16) return { name: 'London Close', color: '#a855f7', active: true }
    return { name: 'None', color: '#6b7280', active: false }
  }

  const kz = getActiveKillZone()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '240px', 
        background: '#13131f', 
        borderRight: '1px solid #1c1c2e',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1c1c2e' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>CryptoTraderAI</span>
          </Link>
        </div>

        {/* Kill Zone Status */}
        <div style={{ padding: '16px', borderBottom: '1px solid #1c1c2e' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>Active Kill Zone</p>
          <div style={{ 
            padding: '10px 12px', 
            background: kz.active ? `${kz.color}20` : '#1c1c2e',
            borderRadius: '8px',
            border: `1px solid ${kz.active ? kz.color : '#2a2a3e'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {kz.active && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: kz.color, animation: 'pulse 2s infinite' }} />}
            <span style={{ color: kz.active ? kz.color : '#6b7280', fontWeight: 'bold', fontSize: '14px' }}>
              {kz.active ? kz.name.toUpperCase() : 'NO ACTIVE ZONE'}
            </span>
          </div>
          {kz.active && (
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
              High volatility expected
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#00d4ff' : '#9ca3af',
                  background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: '#00d4ff' 
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div style={{ padding: '16px', borderTop: '1px solid #1c1c2e' }}>
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                U
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>User</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Connected</p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: '240px',
        minHeight: '100vh'
      }}>
        {children}
      </main>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
