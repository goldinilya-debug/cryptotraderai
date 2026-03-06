import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Target, BarChart3, Calendar } from 'lucide-react'

interface Trade {
  id: string
  pair: string
  direction: 'LONG' | 'SHORT'
  entry: number
  exit: number
  pnl: number
  pnlPercent: number
  status: 'WIN' | 'LOSS'
  date: string
  timeframe: string
}

interface PerformanceMetrics {
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnL: number
  avgPnL: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  avgRR: number
  bestTrade: number
  worstTrade: number
  byPair: Record<string, { trades: number; winRate: number; pnl: number }>
  dailyPnL: { date: string; pnl: number }[]
}

export function TradingDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)

  // Демо-данные для примера (потом заменим на реальные с бэкенда)
  const demoData: PerformanceMetrics = {
    totalTrades: 47,
    wins: 32,
    losses: 15,
    winRate: 68.1,
    totalPnL: 124.58,
    avgPnL: 2.65,
    profitFactor: 2.13,
    maxDrawdown: -3.2,
    sharpeRatio: 1.84,
    avgRR: 2.3,
    bestTrade: 18.45,
    worstTrade: -5.20,
    byPair: {
      'BTC/USDT': { trades: 18, winRate: 72.2, pnl: 58.30 },
      'ETH/USDT': { trades: 15, winRate: 66.7, pnl: 42.15 },
      'SOL/USDT': { trades: 14, winRate: 64.3, pnl: 24.13 }
    },
    dailyPnL: [
      { date: '2026-03-01', pnl: 5.2 },
      { date: '2026-03-02', pnl: -2.1 },
      { date: '2026-03-03', pnl: 8.4 },
      { date: '2026-03-04', pnl: 3.7 },
      { date: '2026-03-05', pnl: -1.5 },
      { date: '2026-03-06', pnl: 6.8 },
      { date: '2026-03-07', pnl: 4.1 },
    ]
  }

  useEffect(() => {
    // TODO: Fetch real data from backend
    setTimeout(() => {
      setMetrics(demoData)
      setLoading(false)
    }, 500)
  }, [period])

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]"></div>
        <span className="ml-3 text-gray-400">Загрузка статистики...</span>
      </div>
    )
  }

  const StatCard = ({ 
    title, 
    value, 
    suffix = '', 
    icon: Icon, 
    color,
    subtext 
  }: { 
    title: string
    value: string | number
    suffix?: string
    icon: any
    color: string
    subtext?: string
  }) => (
    <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-4 hover:border-[#00d4ff]/30 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {value}{suffix}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('400', '500')}/10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#00d4ff]" />
            Торговая Статистика
          </h2>
          <p className="text-gray-400 text-sm">Анализ производительности</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#13131f] rounded-lg p-1">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                period === p
                  ? 'bg-[#00d4ff] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p === 'all' ? 'Всё' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Всего сделок"
          value={metrics.totalTrades}
          icon={Activity}
          color="text-[#00d4ff]"
          subtext={`${metrics.wins} побед / ${metrics.losses} убытков`}
        />
        
        <StatCard
          title="Win Rate"
          value={metrics.winRate.toFixed(1)}
          suffix="%"
          icon={Target}
          color={metrics.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}
        />
        
        <StatCard
          title="Total P&L"
          value={metrics.totalPnL >= 0 ? '+' : ''}
          suffix={`${metrics.totalPnL.toFixed(2)} USDT`}
          icon={metrics.totalPnL >= 0 ? TrendingUp : TrendingDown}
          color={metrics.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}
        />
        
        <StatCard
          title="Profit Factor"
          value={metrics.profitFactor.toFixed(2)}
          icon={BarChart3}
          color={metrics.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}
          subtext={metrics.profitFactor >= 2 ? 'Отлично' : 'Хорошо'}
        />
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-4">
          <p className="text-gray-400 text-xs mb-1">Sharpe Ratio</p>
          <p className={`text-lg font-bold ${metrics.sharpeRatio >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.sharpeRatio.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">Риск/доходность</p>
        </div>
        
        <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-4">
          <p className="text-gray-400 text-xs mb-1">Max Drawdown</p>
          <p className="text-lg font-bold text-rose-400">
            {metrics.maxDrawdown}%
          </p>
          <p className="text-xs text-gray-500">Макс просадка</p>
        </div>
        
        <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-4">
          <p className="text-gray-400 text-xs mb-1">Avg R:R</p>
          <p className="text-lg font-bold text-[#00d4ff]">
            1:{metrics.avgRR}
          </p>
          <p className="text-xs text-gray-500">Среднее соотношение</p>
        </div>
        
        <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-4">
          <p className="text-gray-400 text-xs mb-1">Avg Trade</p>
          <p className={`text-lg font-bold ${metrics.avgPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.avgPnL >= 0 ? '+' : ''}{metrics.avgPnL.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500">Средняя сделка</p>
        </div>
      </div>

      {/* PnL Chart */}
      <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#00d4ff]" />
          Динамика P&L
        </h3>
        
        {/* Simple bar chart */}
        <div className="flex items-end gap-2 h-40">
          {metrics.dailyPnL.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t transition-all hover:opacity-80 ${
                  day.pnl >= 0 ? 'bg-emerald-500/60' : 'bg-rose-500/60'
                }`}
                style={{ 
                  height: `${Math.min(Math.abs(day.pnl) * 8, 100)}%`,
                  minHeight: '4px'
                }}
              />
              <p className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                {day.date.slice(5)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-4 text-sm">
          <span className="text-gray-400">
            Лучший день: <span className="text-emerald-400">+{Math.max(...metrics.dailyPnL.map(d => d.pnl)).toFixed(1)}</span>
          </span>
          <span className="text-gray-400">
            Худший день: <span className="text-rose-400">{Math.min(...metrics.dailyPnL.map(d => d.pnl)).toFixed(1)}</span>
          </span>
        </div>
      </div>

      {/* Stats by Pair */}
      <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-6">
        <h3 className="font-semibold mb-4">Статистика по парам</h3>
        
        <div className="space-y-3">
          {Object.entries(metrics.byPair).map(([pair, stats]) => (
            <div key={pair} className="flex items-center justify-between p-3 bg-[#1c1c2e] rounded-lg">
              <div className="flex items-center gap-4">
                <span className="font-mono font-medium">{pair}</span>
                <span className="text-sm text-gray-400">{stats.trades} сделок</span>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`font-medium ${stats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stats.winRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Win Rate</p>
                </div>
                
                <div className="text-right">
                  <p className={`font-medium ${stats.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stats.pnl >= 0 ? '+' : ''}{stats.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">P&L</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best/Worst Trades */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-4">
          <p className="text-gray-400 text-sm mb-1">Лучшая сделка</p>
          <p className="text-2xl font-bold text-emerald-400">+{metrics.bestTrade.toFixed(2)}%</p>
        </div>
        
        <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-4">
          <p className="text-gray-400 text-sm mb-1">Худшая сделка</p>
          <p className="text-2xl font-bold text-rose-400">{metrics.worstTrade.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  )
}

export default TradingDashboard
