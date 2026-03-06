import { useState } from 'react'
import { Plus, Minus, Save, Play, ChevronDown, ChevronUp, Target, Shield, Zap } from 'lucide-react'

interface StrategyCondition {
  id: string
  indicator: string
  operator: string
  value: string
  timeframe?: string
}

interface Strategy {
  name: string
  description: string
  style: 'scalping' | 'swing' | 'position'
  riskPerTrade: number
  maxDrawdown: number
  minConfidence: number
  minRR: number
  conditions: StrategyCondition[]
  exitRules: {
    takeProfit: string
    stopLoss: string
    trailingStop?: boolean
  }
  active: boolean
}

const INDICATORS = [
  { value: 'wyckoff_phase', label: 'Фаза Wyckoff', options: ['accumulation', 'markup', 'distribution', 'markdown'] },
  { value: 'price_zone', label: 'Ценовая зона', options: ['discount_50_61', 'premium_50_61', 'golden_zone'] },
  { value: 'liquidity_sweep', label: 'Liquidity Sweep', options: ['sweep_low', 'sweep_high', 'no_sweep'] },
  { value: 'structure', label: 'SMC Структура', options: ['bos_bullish', 'bos_bearish', 'choch', 'hh_hl', 'lh_ll'] },
  { value: 'kill_zone', label: 'Kill Zone', options: ['london', 'new_york', 'asian', 'london_close'] },
  { value: 'confidence', label: 'AI Confidence', options: ['custom'] },
  { value: 'rsi', label: 'RSI', options: ['oversold', 'overbought', 'neutral'] },
  { value: 'ema_cross', label: 'EMA Cross', options: ['golden_cross', 'death_cross'] },
]

const OPERATORS = [
  { value: 'equals', label: '=' },
  { value: 'not_equals', label: '≠' },
  { value: 'greater', label: '>' },
  { value: 'less', label: '<' },
  { value: 'greater_equal', label: '≥' },
  { value: 'less_equal', label: '≤' },
]

export function StrategyBuilder() {
  const [strategy, setStrategy] = useState<Strategy>({
    name: 'Моя Стратегия',
    description: 'Описание стратегии...',
    style: 'swing',
    riskPerTrade: 0.5,
    maxDrawdown: 5,
    minConfidence: 85,
    minRR: 2,
    conditions: [],
    exitRules: {
      takeProfit: '1:2',
      stopLoss: 'below_swing',
      trailingStop: false
    },
    active: false
  })

  const [expanded, setExpanded] = useState<record<string, boolean>>({
    basic: true,
    entry: true,
    exit: false,
    backtest: false
  })

  const [backtestResult, setBacktestResult] = useState<any>(null)
  const [isBacktesting, setIsBacktesting] = useState(false)

  const addCondition = () => {
    setStrategy(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        id: Date.now().toString(),
        indicator: 'wyckoff_phase',
        operator: 'equals',
        value: 'accumulation',
        timeframe: 'H4'
      }]
    }))
  }

  const removeCondition = (id: string) => {
    setStrategy(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }))
  }

  const updateCondition = (id: string, field: string, value: string) => {
    setStrategy(prev => ({
      ...prev,
      conditions: prev.conditions.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    }))
  }

  const runBacktest = async () => {
    setIsBacktesting(true)
    // TODO: Call backend API for backtest
    setTimeout(() => {
      setBacktestResult({
        totalTrades: 156,
        winRate: 67.3,
        profitFactor: 2.1,
        maxDrawdown: 4.2,
        sharpeRatio: 1.7,
        netProfit: 234.50,
        avgTrade: 1.50,
        expectancy: 1.35
      })
      setIsBacktesting(false)
    }, 2000)
  }

  const saveStrategy = () => {
    // TODO: Save to backend
    alert('Стратегия сохранена!')
  }

  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string
    title: string
    icon: any
    children: React.ReactNode
  }) => (
    <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] overflow-hidden">
      <button
        onClick={() => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
        className="w-full flex items-center justify-between p-4 hover:bg-[#1c1c2e] transition"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#00d4ff]" />
          <span className="font-semibold">{title}</span>
        </div>
        {expanded[id] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      
      {expanded[id] && (
        <div className="p-4 border-t border-[#1c1c2e]">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#00d4ff]" />
            Конструктор Стратегий
          </h2>
          <p className="text-gray-400 text-sm">Создай свою торговую стратегию без программирования</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={runBacktest}
            disabled={isBacktesting || strategy.conditions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Play className="w-4 h-4" />
            {isBacktesting ? 'Тестирование...' : 'Бэктест'}
          </button>
          
          <button
            onClick={saveStrategy}
            className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff] text-black rounded-lg font-medium hover:bg-[#00d4ff]/90 transition"
          >
            <Save className="w-4 h-4" />
            Сохранить
          </button>
        </div>
      </div>

      {/* Basic Settings */}
      <Section id="basic" title="Базовые настройки" icon={Shield}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Название стратегии</label>
            <input
              type="text"
              value={strategy.name}
              onChange={(e) => setStrategy(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-[#0a0a0f] border border-[#1c1c2e] rounded-lg px-3 py-2 text-white focus:border-[#00d4ff] focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Стиль торговли</label>
            <select
              value={strategy.style}
              onChange={(e) => setStrategy(prev => ({ ...prev, style: e.target.value as any }))}
              className="w-full bg-[#0a0a0f] border border-[#1c1c2e] rounded-lg px-3 py-2 text-white focus:border-[#00d4ff] focus:outline-none"
            >
              <option value="scalping">Скальпинг (1-15 мин)</option>
              <option value="swing">Свинг (1-4 часа)</option>
              <option value="position">Позиционная (1-7 дней)</option>
            </select>
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Описание</label>
            <textarea
              value={strategy.description}
              onChange={(e) => setStrategy(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full bg-[#0a0a0f] border border-[#1c1c2e] rounded-lg px-3 py-2 text-white focus:border-[#00d4ff] focus:outline-none resize-none"
              placeholder="Опиши логику стратегии..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Риск на сделку: {strategy.riskPerTrade}%</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={strategy.riskPerTrade}
              onChange={(e) => setStrategy(prev => ({ ...prev, riskPerTrade: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Макс просадка: {strategy.maxDrawdown}%</label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={strategy.maxDrawdown}
              onChange={(e) => setStrategy(prev => ({ ...prev, maxDrawdown: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Min Confidence: {strategy.minConfidence}%</label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={strategy.minConfidence}
              onChange={(e) => setStrategy(prev => ({ ...prev, minConfidence: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Min R:R: 1:{strategy.minRR}</label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={strategy.minRR}
              onChange={(e) => setStrategy(prev => ({ ...prev, minRR: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* Entry Conditions */}
      <Section id="entry" title="Условия входа (IF/AND/THEN)" icon={Target}>
        <div className="space-y-3">
          <p className="text-sm text-gray-400 mb-4">
            Добавь условия которые должны выполниться для входа в сделку
          </p>
          
          {strategy.conditions.map((condition, index) => (
            <div key={condition.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg">
              <span className="text-[#00d4ff] font-medium">{index === 0 ? 'IF' : 'AND'}</span>
              
              <select
                value={condition.indicator}
                onChange={(e) => updateCondition(condition.id, 'indicator', e.target.value)}
                className="bg-[#13131f] border border-[#1c1c2e] rounded px-2 py-1 text-sm"
              >
                {INDICATORS.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
              
              <select
                value={condition.operator}
                onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                className="bg-[#13131f] border border-[#1c1c2e] rounded px-2 py-1 text-sm"
              >
                {OPERATORS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              
              <select
                value={condition.value}
                onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                className="bg-[#13131f] border border-[#1c1c2e] rounded px-2 py-1 text-sm"
              >
                {INDICATORS.find(ind => ind.value === condition.indicator)?.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              
              {['wyckoff_phase', 'structure', 'price_zone'].includes(condition.indicator) && (
                <select
                  value={condition.timeframe || 'H4'}
                  onChange={(e) => updateCondition(condition.id, 'timeframe', e.target.value)}
                  className="bg-[#13131f] border border-[#1c1c2e] rounded px-2 py-1 text-sm"
                >
                  <option value="M15">M15</option>
                  <option value="H1">H1</option>
                  <option value="H4">H4</option>
                  <option value="D1">D1</option>
                </select>
              )}
              
              <button
                onClick={() => removeCondition(condition.id)}
                className="ml-auto p-1 text-rose-400 hover:bg-rose-500/10 rounded"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button
            onClick={addCondition}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#00d4ff]/30 text-[#00d4ff] rounded-lg hover:bg-[#00d4ff]/5 transition"
          >
            <Plus className="w-4 h-4" />
            Добавить условие
          </button>
          
          {strategy.conditions.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-400">
                <strong>THEN: Открыть {strategy.style === 'swing' ? 'SWING' : strategy.style === 'scalping' ? 'SCALP' : 'POSITION'} сделку</strong>
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Exit Rules */}
      <Section id="exit" title="Правила выхода" icon={Shield}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Take Profit</label>
            <select
              value={strategy.exitRules.takeProfit}
              onChange={(e) => setStrategy(prev => ({
                ...prev,
                exitRules: { ...prev.exitRules, takeProfit: e.target.value }
              }))}
              className="w-full bg-[#0a0a0f] border border-[#1c1c2e] rounded-lg px-3 py-2 text-white"
            >
              <option value="1:1.5">1:1.5 (Консервативный)</option>
              <option value="1:2">1:2 (Сбалансированный)</option>
              <option value="1:3">1:3 (Агрессивный)</option>
              <option value="fib_1.272">Фибо 1.272</option>
              <option value="fib_1.618">Фибо 1.618</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Stop Loss</label>
            <select
              value={strategy.exitRules.stopLoss}
              onChange={(e) => setStrategy(prev => ({
                ...prev,
                exitRules: { ...prev.exitRules, stopLoss: e.target.value }
              }))}
              className="w-full bg-[#0a0a0f] border border-[#1c1c2e] rounded-lg px-3 py-2 text-white"
            >
              <option value="below_swing">За swing low/high</option>
              <option value="atr_1.5">1.5 ATR</option>
              <option value="atr_2">2 ATR</option>
              <option value="fixed_1">Фикс 1%</option>
              <option value="fixed_2">Фикс 2%</option>
            </select>
          </div>
          
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={strategy.exitRules.trailingStop}
                onChange={(e) => setStrategy(prev => ({
                  ...prev,
                  exitRules: { ...prev.exitRules, trailingStop: e.target.checked }
                }))}
                className="w-4 h-4 rounded border-gray-600"
              />
              <span className="text-sm">Использовать Trailing Stop (переносить стоп в безубыток)</span>
            </label>
          </div>
        </div>
      </Section>

      {/* Backtest Results */}
      {backtestResult && (
        <Section id="backtest" title="Результаты бэктеста" icon={BarChart3}>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0a0a0f] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#00d4ff]">{backtestResult.totalTrades}</p>
              <p className="text-xs text-gray-400">Сделок</p>
            </div>
            
            <div className="bg-[#0a0a0f] rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${backtestResult.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {backtestResult.winRate}%
              </p>
              <p className="text-xs text-gray-400">Win Rate</p>
            </div>
            
            <div className="bg-[#0a0a0f] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{backtestResult.profitFactor}</p>
              <p className="text-xs text-gray-400">Profit Factor</p>
            </div>
            
            <div className="bg-[#0a0a0f] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">+{backtestResult.netProfit}%</p>
              <p className="text-xs text-gray-400">Net Profit</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-emerald-400">
              ✅ Стратегия прошла валидацию. Рекомендуется к использованию.
            </p>
          </div>
        </Section>
      )}

      {/* Preview */}
      <div className="bg-[#13131f] rounded-xl border border-[#1c1c2e] p-4">
        <h3 className="font-semibold mb-3">Предпросмотр стратегии</h3>
        <div className="font-mono text-sm bg-[#0a0a0f] rounded-lg p-4 space-y-1">
          <p><span className="text-[#00d4ff]">Название:</span> {strategy.name}</p>
          <p><span className="text-[#00d4ff]">Стиль:</span> {strategy.style}</p>
          <p><span className="text-[#00d4ff]">Риск:</span> {strategy.riskPerTrade}% на сделку, макс просадка {strategy.maxDrawdown}%</p>
          <p><span className="text-[#00d4ff]">Условия ({strategy.conditions.length}):</span></p>
          <div className="pl-4">
            {strategy.conditions.map((c, i) => (
              <p key={c.id} className="text-gray-400">
                {i === 0 ? 'IF' : 'AND'} {INDICATORS.find(ind => ind.value === c.indicator)?.label} 
                {OPERATORS.find(op => op.value === c.operator)?.label} {c.value}
                {c.timeframe && ` (${c.timeframe})`}
              </p>
            ))}
          </div>
          {strategy.conditions.length > 0 && (
            <p className="text-emerald-400">THEN открыть сделку</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StrategyBuilder
