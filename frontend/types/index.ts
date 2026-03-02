export interface Signal {
  id: string
  pair: string
  direction: 'LONG' | 'SHORT'
  entry: number
  stopLoss: number
  takeProfit1: number
  takeProfit2?: number
  confidence: number
  timeframe: string
  exchange: string
  status: 'ACTIVE' | 'HIT_TP' | 'HIT_SL' | 'CANCELLED'
  wyckoffPhase: string
  killZone: string
  createdAt: string
  analysis?: string
}

export interface KillZone {
  name: string
  startHour: number
  endHour: number
  volatility: 'low' | 'medium' | 'high'
  description: string
}

export interface Performance {
  totalSignals: number
  winRate: number
  totalPnL: number
  avgPnL: number
  hitTP: number
  hitSL: number
  byPair: Record<string, {
    trades: number
    winRate: number
    pnl: number
  }>
}
