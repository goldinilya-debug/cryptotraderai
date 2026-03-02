import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Signal } from '@/types'

interface SignalCardProps {
  signal: Signal
}

export function SignalCard({ signal }: SignalCardProps) {
  const isLong = signal.direction === 'LONG'
  const directionColor = isLong ? 'text-success' : 'text-danger'
  const DirectionIcon = isLong ? ArrowUpRight : ArrowDownRight
  
  const riskReward = ((signal.takeProfit1 - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(1)

  return (
    <div className="bg-surface rounded-xl border border-surface-light p-4 hover:border-primary/30 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={`https://cryptoicons.org/api/icon/${signal.pair.split('/')[0].toLowerCase()}/200`}
            alt={signal.pair}
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#1c1c2e"/><text x="50" y="55" text-anchor="middle" fill="#fff" font-size="30">₿</text></svg>'
            }}
          />
          <div>
            <h3 className="font-semibold">{signal.pair}</h3>
            <p className="text-sm text-muted">
              {signal.timeframe} • {signal.exchange.toLowerCase()} • {format(new Date(signal.createdAt), 'MMM d, HH:mm')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            isLong ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            <DirectionIcon className="w-4 h-4" />
            <span className="font-medium">{signal.direction}</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{signal.confidence}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted mb-1">Entry</p>
          <p className="font-mono font-medium">${signal.entry.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Stop Loss</p>
          <p className="font-mono font-medium text-danger">${signal.stopLoss.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">TP1</p>
          <p className="font-mono font-medium text-success">${signal.takeProfit1.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">TP2</p>
          <p className="font-mono font-medium text-success">${signal.takeProfit2?.toLocaleString() || '-'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-surface-light">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted">
            Wyckoff: <span className="text-white">{signal.wyckoffPhase}</span>
          </span>
          <span className="text-muted">
            KZ: <span className="text-white">{signal.killZone.toLowerCase()}</span>
          </span>
          <span className="text-muted">
            R:R <span className="text-white">1:{riskReward}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            signal.status === 'ACTIVE' 
              ? 'bg-primary/10 text-primary' 
              : signal.status === 'HIT_TP'
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}>
            {signal.status}
          </span>
          <button className="flex items-center gap-1 text-sm text-primary hover:underline">
            Analysis <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
