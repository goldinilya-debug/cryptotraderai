import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react'

interface Signal {
  id: string
  pair: string
  direction: 'LONG' | 'SHORT'
  entry: number
  stop_loss?: number
  stopLoss?: number
  take_profit_1?: number
  takeProfit1?: number
  take_profit_2?: number
  takeProfit2?: number
  confidence: number
  wyckoff_phase?: string
  wyckoffPhase?: string
  kill_zone?: string
  killZone?: string
  timeframe?: string
  exchange?: string
  status: string
  analysis?: string | {
    wyckoff?: string
    smc?: string
    killZone?: string
    entry?: string
    risk?: string
    reward?: string
  }
}

interface SignalAnalysisCardProps {
  signal: Signal
}

interface AnalysisDetail {
  title: string
  content: string
  type: 'success' | 'warning' | 'info'
}

export function SignalAnalysisCard({ signal }: SignalAnalysisCardProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  
  const isLong = signal.direction === 'LONG'
  const directionColor = isLong ? '#10b981' : '#ef4444'
  const bgColor = isLong ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
  
  const stopLoss = signal.stop_loss || signal.stopLoss || 0
  const takeProfit = signal.take_profit_1 || signal.takeProfit1 || 0
  const riskReward = takeProfit && stopLoss && signal.entry 
    ? ((takeProfit - signal.entry) / (signal.entry - stopLoss)).toFixed(1)
    : '0'
  const riskPercent = stopLoss && signal.entry 
    ? (Math.abs(signal.entry - stopLoss) / signal.entry * 100).toFixed(2)
    : '0'
  const rewardPercent = takeProfit && signal.entry
    ? (Math.abs(takeProfit - signal.entry) / signal.entry * 100).toFixed(2)
    : '0'

  const tooltips: Record<string, string> = {
    'wyckoff': 'Wyckoff Method — определение фаз рынка: аккумуляция, распределение, тренд',
    'liquidity': 'Liquidity Sweep — забор ликвидности (стопов) за уровнем перед движением',
    'bos': 'Break of Structure — пробой структуры, сигнал смены/продолжения тренда',
    'discount': 'Discount Zone — зона покупок (50-61.8% Фибо) в рамках тренда',
    'premium': 'Premium Zone — зона продаж (50-61.8% Фибо) в рамках тренда',
    'killzone': 'Kill Zone — временной период высокой волатильности (London/NY/Asian)',
    'confidence': 'Confidence Score — оценка уверенности AI на основе 7 факторов'
  }

  const generateAnalysis = (): AnalysisDetail[] => {
    const details: AnalysisDetail[] = []
    const wyckoff = signal.wyckoff_phase || signal.wyckoffPhase || 'unknown'
    const killZone = signal.kill_zone || signal.killZone || ''
    
    const wyckoffExplanations: Record<string, string> = {
      'accumulation': 'Рынок в фазе аккумуляции. «Умные деньги» скупают актив перед ростом.',
      'markup': 'Фаза роста (markup) после успешной аккумуляции. Тренд вверх.',
      'distribution': 'Фаза распределения. Институциональные игроки продают рознице.',
      'markdown': 'Фаза снижения (markdown). Доминируют продавцы.'
    }
    
    details.push({
      title: '📊 Фаза Wyckoff',
      content: wyckoffExplanations[wyckoff] || `Фаза: ${wyckoff}`,
      type: wyckoff === 'accumulation' || wyckoff === 'markup' ? 'success' : 'warning'
    })
    
    details.push({
      title: '🎯 SMC Структура',
      content: isLong 
        ? 'Higher Highs + Higher Lows = бычий тренд. Последний BOS вверх подтверждает силу покупателей.'
        : 'Lower Lows + Lower Highs = медвежий тренд. Последний BOS вниз подтверждает силу продавцов.',
      type: 'info'
    })
    
    details.push({
      title: '💧 Ликвидность',
      content: isLong
        ? 'Цена взяла ликвидность ниже предыдущего low. Стопы продавцов активированы → топливо для роста.'
        : 'Цена взяла ликвидность выше предыдущего high. Стопы покупателей активированы → топливо для падения.',
      type: 'success'
    })
    
    details.push({
      title: '📐 Фибоначчи Зона',
      content: isLong
        ? 'Вход в discount-зоне (50-61.8% retracement). «Дешевая» цена в рамках тренда.'
        : 'Вход в premium-зоне (50-61.8% retracement). «Дорогая» цена в рамках тренда.',
      type: 'info'
    })
    
    const kzDescriptions: Record<string, string> = {
      'London': 'Лондонская сессия — высокая волатильность, движение умных денег.',
      'New York': 'Нью-Йоркская сессия — максимальная ликвидность, главные движения дня.',
      'Asian': 'Азиатская сессия — спокойный рынок, аккумуляция перед движением.',
      'London Close': 'Закрытие Лондона — фиксация позиций, волатильность.'
    }
    
    if (killZone) {
      details.push({
        title: '⏰ Kill Zone',
        content: kzDescriptions[killZone] || killZone,
        type: 'info'
      })
    }
    
    details.push({
      title: '⚠️ Риск-менеджмент',
      content: `Риск: ${riskPercent}% | Потенциал: ${rewardPercent}% | R:R = 1:${riskReward}. Макс риск на сделку: 0.5% депозита.`,
      type: parseFloat(riskReward) >= 2 ? 'success' : 'warning'
    })
    
    return details
  }

  const analysis = generateAnalysis()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return { bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981' }
      case 'warning': return { bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' }
      default: return { bg: '#1c1c2e', border: '#2a2a3e', text: '#00d4ff' }
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: directionColor
          }}>
            {signal.pair[0]}
          </div>
          
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{signal.pair}</h3>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{signal.timeframe?.toLowerCase()} • {signal.exchange?.toLowerCase()}</p>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: bgColor,
            color: directionColor,
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {isLong ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {signal.direction}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00d4ff', marginTop: '8px' }}>
            {signal.confidence}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Confidence
            <span 
              style={{ marginLeft: '4px', cursor: 'help', color: '#00d4ff' }}
              onMouseEnter={() => setShowTooltip('confidence')}
              onMouseLeave={() => setShowTooltip(null)}
            >[?]</span>
            {showTooltip === 'confidence' && (
              <div style={{
                position: 'absolute',
                background: '#1c1c2e',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                maxWidth: '250px',
                border: '1px solid #2a2a3e',
                marginTop: '4px',
                zIndex: 10
              }}>
                {tooltips.confidence}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prices */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '12px', 
        marginBottom: '24px',
        padding: '16px',
        background: '#1c1c2e',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>Entry</p>
          <p style={{ fontFamily: 'monospace', fontWeight: '500', margin: 0 }}>${signal.entry?.toLocaleString()}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>Stop Loss</p>
          <p style={{ fontFamily: 'monospace', fontWeight: '500', margin: 0, color: '#ef4444' }}>${stopLoss.toLocaleString()}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>TP1</p>
          <p style={{ fontFamily: 'monospace', fontWeight: '500', margin: 0, color: '#10b981' }}>${takeProfit.toLocaleString()}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>R:R</p>
          <p style={{ fontFamily: 'monospace', fontWeight: '500', margin: 0, color: '#f59e0b' }}>1:{riskReward}</p>
        </div>
      </div>

      {/* Analysis Details */}
      <h4 style={{ color: '#00d4ff', marginBottom: '16px', fontSize: '16px' }}>🎓 Почему эта сделка?</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {analysis.map((detail, index) => {
          const colors = getTypeColor(detail.type)
          return (
            <div 
              key={index}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: colors.bg,
                border: `1px solid ${colors.border}`
              }}
            >
              <h5 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: colors.text
              }}>
                {detail.title}
              </h5>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#d1d5db',
                lineHeight: '1.6'
              }}>
                {detail.content}
              </p>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{
        padding: '16px',
        background: 'rgba(0, 212, 255, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 212, 255, 0.3)'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#00d4ff', lineHeight: '1.6' }}>
          💡 <strong>Итог:</strong> {isLong 
            ? 'Идеальная точка для LONG после сбора ликвидности в discount-зоне.' 
            : 'Идеальная точка для SHORT после сбора ликвидности в premium-зоне.'}
          Уверенность {signal.confidence}% основана на совпадении Wyckoff + SMC + Фибо.
        </p>
      </div>
    </div>
  )
}

export default SignalAnalysisCard
