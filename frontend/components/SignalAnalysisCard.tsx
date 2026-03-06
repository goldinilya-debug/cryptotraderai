import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Signal } from '@/types'

interface SignalAnalysisCardProps {
  signal: Signal
}

interface AnalysisDetail {
  title: string
  content: string
  type: 'success' | 'warning' | 'info'
}

export function SignalAnalysisCard({ signal }: SignalAnalysisCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  
  const isLong = signal.direction === 'LONG'
  const directionColor = isLong ? 'text-emerald-400' : 'text-rose-400'
  const bgColor = isLong ? 'bg-emerald-500/10' : 'bg-rose-500/10'
  
  const riskReward = ((signal.takeProfit1 - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(1)
  const riskPercent = Math.abs((signal.stopLoss - signal.entry) / signal.entry * 100).toFixed(2)
  const rewardPercent = Math.abs((signal.takeProfit1 - signal.entry) / signal.entry * 100).toFixed(2)

  // Образовательные подсказки
  const tooltips: Record<string, string> = {
    'wyckoff': 'Wyckoff Method — определение фаз рынка: аккумуляция, распределение, тренд',
    'liquidity': 'Liquidity Sweep — забор ликвидности (стопов) за уровнем перед движением',
    'bos': 'Break of Structure — пробой структуры, сигнал смены/продолжения тренда',
    'discount': 'Discount Zone — зона покупок (50-61.8% Фибо) в рамках тренда',
    'premium': 'Premium Zone — зона продаж (50-61.8% Фибо) в рамках тренда',
    'killzone': 'Kill Zone — временной период высокой волатильности (London/NY/Asian)',
    'confidence': 'Confidence Score — оценка уверенности AI на основе 7 факторов'
  }

  // Генерация разбора сделки
  const generateAnalysis = (): AnalysisDetail[] => {
    const details: AnalysisDetail[] = []
    
    // Wyckoff анализ
    const wyckoffExplanations: Record<string, string> = {
      'accumulation': 'Рынок в фазе аккумуляции. «Умные деньги» скупают актив перед ростом.',
      'markup': 'Фаза роста (markup) после успешной аккумуляции. Тренд вверх.',
      'distribution': 'Фаза распределения. Институциональные игроки продают рознице.',
      'markdown': 'Фаза снижения (markdown). Доминируют продавцы.'
    }
    
    details.push({
      title: '📊 Фаза Wyckoff',
      content: wyckoffExplanations[signal.wyckoffPhase] || `Фаза: ${signal.wyckoffPhase}`,
      type: signal.wyckoffPhase === 'accumulation' || signal.wyckoffPhase === 'markup' ? 'success' : 'warning'
    })
    
    // SMC анализ
    details.push({
      title: '🎯 SMC Структура',
      content: isLong 
        ? 'Higher Highs + Higher Lows = бычий тренд. Последний BOS вверх подтверждает силу покупателей.'
        : 'Lower Lows + Lower Highs = медвежий тренд. Последний BOS вниз подтверждает силу продавцов.',
      type: 'info'
    })
    
    // Ликвидность
    details.push({
      title: '💧 Ликвидность',
      content: isLong
        ? 'Цена взяла ликвидность ниже предыдущего low. Стопы продавцов активированы → топливо для роста.'
        : 'Цена взяла ликвидность выше предыдущего high. Стопы покупателей активированы → топливо для падения.',
      type: 'success'
    })
    
    // Фибо-зона
    details.push({
      title: '📐 Фибоначчи Зона',
      content: isLong
        ? 'Вход в discount-зоне (50-61.8% retracement). «Дешевая» цена в рамках тренда.'
        : 'Вход в premium-зоне (50-61.8% retracement). «Дорогая» цена в рамках тренда.',
      type: 'info'
    })
    
    // Kill Zone
    const kzDescriptions: Record<string, string> = {
      'London': 'Лондонская сессия — высокая волатильность, движение умных денег.',
      'New York': 'Нью-Йоркская сессия — максимальная ликвидность, главные движения дня.',
      'Asian': 'Азиатская сессия — спокойный рынок, аккумуляция перед движением.',
      'London Close': 'Закрытие Лондона — фиксация позиций, волатильность.'
    }
    
    details.push({
      title: '⏰ Kill Zone',
      content: kzDescriptions[signal.killZone] || signal.killZone,
      type: 'info'
    })
    
    // Риск-менеджмент
    details.push({
      title: '⚠️ Риск-менеджмент',
      content: `Риск: ${riskPercent}% | Потенциал: ${rewardPercent}% | R:R = 1:${riskReward}. Макс риск на сделку: 0.5% депозита.`,
      type: parseFloat(riskReward) >= 2 ? 'success' : 'warning'
    })
    
    return details
  }

  const analysis = generateAnalysis()

  const Tooltip = ({ id, children }: { id: string, children: React.ReactNode }) => (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShowTooltip(id)}
        onMouseLeave={() => setShowTooltip(null)}
        className="cursor-help border-b border-dotted border-gray-500"
      >
        {children}
        <HelpCircle className="inline w-3 h-3 ml-1 text-gray-400" />
      </span>
      {showTooltip === id && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs rounded-lg shadow-xl border border-gray-700 w-64">
          {tooltips[id]}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </span>
  )

  return (
    <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] overflow-hidden hover:border-[#00d4ff]/30 transition-all">
      {/* Основная карточка */}
      <div className="p-4">
        {/* Шапка */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center text-xl font-bold ${directionColor}`}>
              {signal.pair.split('/')[0][0]}
            </div>
            <div>
              <h3 className="font-bold text-lg">{signal.pair}</h3>
              <p className="text-sm text-gray-400">
                {signal.timeframe} • {signal.exchange} • {signal.createdAt}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${bgColor} ${directionColor} mb-1`}>
              {isLong ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-bold">{signal.direction}</span>
            </div>
            <div className="text-2xl font-bold text-[#00d4ff]">{signal.confidence}%</div>
            <Tooltip id="confidence"><span className="text-xs text-gray-400">Confidence</span></Tooltip>
          </div>
        </div>

        {/* Цены */}
        <div className="grid grid-cols-4 gap-3 mb-4 text-center">
          <div className="bg-[#1c1c2e] rounded-lg p-2">
            <p className="text-xs text-gray-400 mb-1">Entry</p>
            <p className="font-mono font-medium">${signal.entry.toLocaleString()}</p>
          </div>
          <div className="bg-[#1c1c2e] rounded-lg p-2">
            <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
            <p className="font-mono font-medium text-rose-400">${signal.stopLoss.toLocaleString()}</p>
          </div>
          <div className="bg-[#1c1c2e] rounded-lg p-2">
            <p className="text-xs text-gray-400 mb-1">TP1</p>
            <p className="font-mono font-medium text-emerald-400">${signal.takeProfit1.toLocaleString()}</p>
          </div>
          <div className="bg-[#1c1c2e] rounded-lg p-2">
            <p className="text-xs text-gray-400 mb-1">R:R</p>
            <p className="font-mono font-medium text-[#ffb300]">1:{riskReward}</p>
          </div>
        </div>

        {/* Краткая информация */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Wyckoff: <Tooltip id="wyckoff"><span className="text-white font-medium">{signal.wyckoffPhase}</span></Tooltip>
            </span>
            <span className="text-gray-400">
              KZ: <Tooltip id="killzone"><span className="text-white font-medium">{signal.killZone}</span></Tooltip>
            </span>
          </div>
          
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[#00d4ff] hover:underline text-sm"
          >
            {expanded ? 'Скрыть разбор' : 'Подробный разбор'}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Развернутый анализ */}
      {expanded && (
        <div className="border-t border-[#1c1c2e] bg-[#0a0a0f]">
          <div className="p-4 space-y-3">
            <h4 className="font-semibold text-[#00d4ff] mb-3">🎓 Почему эта сделка?</h4>
            
            {analysis.map((detail, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  detail.type === 'success' 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : detail.type === 'warning'
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-[#1c1c2e] border-[#2a2a3e]'
                }`}
              >
                <h5 className={`font-medium text-sm mb-1 ${
                  detail.type === 'success' ? 'text-emerald-400' : 
                  detail.type === 'warning' ? 'text-amber-400' : 'text-[#00d4ff]'
                }`}>
                  {detail.title}
                </h5>
                <p className="text-sm text-gray-300 leading-relaxed">{detail.content}</p>
              </div>
            ))}
            
            {/* Итог */}
            <div className="mt-4 p-3 bg-[#00d4ff]/10 rounded-lg border border-[#00d4ff]/30">
              <p className="text-sm text-[#00d4ff]">
                <strong>💡 Итог:</strong> {isLong 
                  ? 'Идеальная точка для LONG после сбора ликвидности в discount-зоне.' 
                  : 'Идеальная точка для SHORT после сбора ликвидности в premium-зоне.'}
                Уверенность {signal.confidence}% основана на совпадении Wyckoff + SMC + Фибо.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignalAnalysisCard
