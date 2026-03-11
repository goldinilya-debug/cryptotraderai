'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard,
  BookOpen,
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
  Zap,
  PieChart,
  Settings,
  Crosshair,
  ZapIcon,
  BookOpen
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diary', label: 'Trading Journal', icon: BookOpen },
  { href: '/smc-analysis', label: 'SMC Real-Time', icon: ZapIcon },
  { href: '/signals', label: 'Signals', icon: Activity },
  { href: '/screener', label: 'Screener', icon: Search },
  { href: '/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/killzones', label: 'Kill Zones', icon: Clock },
  { href: '/fibzones', label: 'Fib Zones', icon: Target },
  { href: '/backtest', label: 'Backtest', icon: LineChart },
  { href: '/stats', label: 'Statistics', icon: PieChart },
  { href: '/strategy', label: 'Strategy', icon: Settings },
  { href: '/sniper', label: 'Sniper', icon: Crosshair },
  { href: '/footprint', label: 'Footprint', icon: Layers },
  { href: '/ml', label: 'ML Model', icon: Brain },
  { href: '/tradingview', label: 'TradingView', icon: Layers },
  { href: '/telegram', label: 'Telegram', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
]

// Функция определения Kill Zone (время Израиля GMT+3)
const getKillZone = () => {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const israelHour = (utcHour + 3) % 24 // GMT+3 для Израиля
  
  if (israelHour >= 20 || israelHour < 8) return { name: 'Asian', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' }
  if (israelHour >= 8 && israelHour < 16) return { name: 'London', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' }
  if (israelHour >= 13 && israelHour < 21) return { name: 'New York', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' }
  return { name: 'Asian', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' }
}

// Inline styles for static export
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0a0f',
  },
  sidebar: {
    width: '240px',
    background: '#13131f',
    borderRight: '1px solid #1c1c2e',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    height: '100vh',
    overflowY: 'auto' as const,
    zIndex: 50,
  },
  logo: {
    padding: '20px',
    borderBottom: '1px solid #1c1c2e',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#fff',
  },
  killzone: {
    padding: '16px',
    borderBottom: '1px solid #1c1c2e',
  },
  killzoneLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  killzoneBadge: (color: string, bgColor: string) => ({
    padding: '10px 12px',
    background: bgColor,
    borderRadius: '8px',
    border: `1px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  killzoneDot: (color: string) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
  }),
  killzoneText: (color: string) => ({
    color: color,
    fontWeight: 'bold',
    fontSize: '14px',
  }),
  killzoneSub: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '8px',
  },
  nav: {
    flex: 1,
    padding: '12px',
  },
  navItem: (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    marginBottom: '4px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? '#00d4ff' : '#9ca3af',
    background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
    transition: 'all 0.2s',
  }),
  activeIndicator: {
    marginLeft: 'auto',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00d4ff',
  },
  user: {
    padding: '16px',
    borderTop: '1px solid #1c1c2e',
  },
  userLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#fff',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
  },
  userStatus: {
    fontSize: '12px',
    color: '#6b7280',
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    minHeight: '100vh',
  },
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [killZone, setKillZone] = useState(getKillZone())
  
  // Обновляем Kill Zone каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      setKillZone(getKillZone())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <Link href="/dashboard" style={styles.logoLink}>
            <div style={styles.logoIcon}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={styles.logoText}>CryptoTraderAI</span>
          </Link>
        </div>

        {/* Kill Zone */}
        <div style={styles.killzone}>
          <p style={styles.killzoneLabel}>Active Kill Zone</p>
          <div style={styles.killzoneBadge(killZone.color, killZone.bgColor)}>
            <span style={styles.killzoneDot(killZone.color)} />
            <span style={styles.killzoneText(killZone.color)}>{killZone.name.toUpperCase()}</span>
          </div>
          <p style={styles.killzoneSub}>High volatility expected</p>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                style={styles.navItem(isActive)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <span style={styles.activeIndicator} />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={styles.user}>
          <Link href="/profile" style={styles.userLink}>
            <div style={styles.userAvatar}>U</div>
            <div>
              <p style={styles.userName}>User</p>
              <p style={styles.userStatus}>Connected</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  )
}
