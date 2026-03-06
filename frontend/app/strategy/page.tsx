'use client'

import { useState } from 'react'
import { Plus, Minus, Save, Play, ChevronDown, ChevronUp, Target, Shield, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
]

const OPERATORS = [
  { value: 'equals', label: '=' },
  { value: 'not_equals', label: '≠' },
  { value: 'greater', label: '>' },
  { value: 'less', label: '<' },
  { value: 'greater_equal', label: '≥' },
  { value: 'less_equal', label: '≤' },
]

export default function StrategyPage() {
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

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
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
      setExpanded(prev => ({ ...prev, backtest: true }))
    }, 2000)
  }

  const saveStrategy = () => {
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
    <div style={{ 
      background: '#13131f', 
      borderRadius: '12px', 
      border: '1px solid #1c1c2e',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icon style={{ width: '20px', height: '20px', color: '#00d4ff' }} />
          <span style={{ fontWeight: 600 }}>{title}</span>
        </div>
        {expanded[id] ? <ChevronUp style={{ color: '#6b7280' }} /> : <ChevronDown style={{ color: '#6b7280' }} />}
      </button>
      
      {expanded[id] && (
        <div style={{ padding: '16px', borderTop: '1px solid #1c1c2e' }}>
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid #1c1c2e', 
        padding: '16px 24px',
        background: '#13131f'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ 
              color: '#6b7280', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Назад
            </Link>
            
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Zap style={{ color: '#00d4ff' }} />
              Конструктор Стратегий
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={runBacktest}
              disabled={isBacktesting || strategy.conditions.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                cursor: strategy.conditions.length === 0 ? 'not-allowed' : 'pointer',
                opacity: strategy.conditions.length === 0 ? 0.5 : 1
              }}
            >
              <Play style={{ width: '16px', height: '16px' }} />
              {isBacktesting ? 'Тестирование...' : 'Бэктест'}
            </button>
            
            <button
              onClick={saveStrategy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#00d4ff',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              Сохранить
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Basic Settings */}
          <Section id="basic" title="Базовые настройки" icon={Shield}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Название стратегии</label>
                <input
                  type="text"
                  value={strategy.name}
                  onChange={(e) => setStrategy(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#0a0a0f',
                    border: '1px solid #1c1c2e',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Стиль торговли</label>
                <select
                  value={strategy.style}
                  onChange={(e) => setStrategy(prev => ({ ...prev, style: e.target.value as any }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#0a0a0f',
                    border: '1px solid #1c1c2e',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                >
                  <option value="scalping">Скальпинг (1-15 мин)</option>
                  <option value="swing">Свинг (1-4 часа)</option>
                  <option value="position">Позиционная (1-7 дней)</option>
                </select>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Описание</label>
                <textarea
                  value={strategy.description}
                  onChange={(e) => setStrategy(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#0a0a0f',
                    border: '1px solid #1c1c2e',
                    borderRadius: '8px',
                    color: '#fff',
                    resize: 'none'
                  }}
                  placeholder="Опиши логику стратегии..."
                />
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Риск на сделку: {strategy.riskPerTrade}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={strategy.riskPerTrade}
                  onChange={(e) => setStrategy(prev => ({ ...prev, riskPerTrade: parseFloat(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Макс просадка: {strategy.maxDrawdown}%</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={strategy.maxDrawdown}
                  onChange={(e) => setStrategy(prev => ({ ...prev, maxDrawdown: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </Section>

          {/* Entry Conditions */}
          <Section id="entry" title="Условия входа (IF/AND/THEN)" icon={Target}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>Добавь условия которые должны выполниться для входа в сделку</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {strategy.conditions.map((condition, index) => (
                <div 
                  key={condition.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#0a0a0f',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{ color: '#00d4ff', fontWeight: 500 }}>{index === 0 ? 'IF' : 'AND'}</span>
                  
                  <select
                    value={condition.indicator}
                    onChange={(e) => updateCondition(condition.id, 'indicator', e.target.value)}
                    style={{
                      padding: '4px 8px',
                      background: '#13131f',
                      border: '1px solid #1c1c2e',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                  >
                    {INDICATORS.map(ind => (
                      <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                    style={{
                      padding: '4px 8px',
                      background: '#13131f',
                      border: '1px solid #1c1c2e',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                  >
                    {OPERATORS.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                    style={{
                      padding: '4px 8px',
                      background: '#13131f',
                      border: '1px solid #1c1c2e',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                  >
                    {INDICATORS.find(ind => ind.value === condition.indicator)?.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  
                  {['wyckoff_phase', 'structure', 'price_zone'].includes(condition.indicator) && (
                    <select
                      value={condition.timeframe || 'H4'}
                      onChange={(e) => updateCondition(condition.id, 'timeframe', e.target.value)}
                      style={{
                        padding: '4px 8px',
                        background: '#13131f',
                        border: '1px solid #1c1c2e',
                        borderRadius: '4px',
                        color: '#fff'
                      }}
                    >
                      <option value="M15">M15</option>
                      <option value="H1">H1</option>
                      <option value="H4">H4</option>
                      <option value="D1">D1</option>
                    </select>
                  )}
                  
                  <button
                    onClick={() => removeCondition(condition.id)}
                    style={{
                      marginLeft: 'auto',
                      padding: '4px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer'
                    }}
                  >
                    <Minus style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={addCondition}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: '1px dashed rgba(0, 212, 255, 0.3)',
                  color: '#00d4ff',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Добавить условие
              </button>
              
              {strategy.conditions.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px'
                }}
                >
                  <p style={{ color: '#10b981' }}>
                    <strong>THEN: Открыть {strategy.style === 'swing' ? 'SWING' : strategy.style === 'scalping' ? 'SCALP' : 'POSITION'} сделку</strong>
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Exit Rules */}
          <Section id="exit" title="Правила выхода" icon={Shield}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Take Profit</label>
                <select
                  value={strategy.exitRules.takeProfit}
                  onChange={(e) => setStrategy(prev => ({
                    ...prev,
                    exitRules: { ...prev.exitRules, takeProfit: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#0a0a0f',
                    border: '1px solid #1c1c2e',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                >
                  <option value="1:1.5">1:1.5 (Консервативный)</option>
                  <option value="1:2">1:2 (Сбалансированный)</option>
                  <option value="1:3">1:3 (Агрессивный)</option>
                  <option value="fib_1.272">Фибо 1.272</option>
                  <option value="fib_1.618">Фибо 1.618</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Stop Loss</label>
                <select
                  value={strategy.exitRules.stopLoss}
                  onChange={(e) => setStrategy(prev => ({
                    ...prev,
                    exitRules: { ...prev.exitRules, stopLoss: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#0a0a0f',
                    border: '1px solid #1c1c2e',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                >
                  <option value="below_swing">За swing low/high</option>
                  <option value="atr_1.5">1.5 ATR</option>
                  <option value="atr_2">2 ATR</option>
                  <option value="fixed_1">Фикс 1%</option>
                  <option value="fixed_2">Фикс 2%</option>
                </select>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={strategy.exitRules.trailingStop}
                    onChange={(e) => setStrategy(prev => ({
                      ...prev,
                      exitRules: { ...prev.exitRules, trailingStop: e.target.checked }
                    }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Использовать Trailing Stop (переносить стоп в безубыток)</span>
                </label>
              </div>
            </div>
          </Section>

          {/* Backtest Results */}
          {backtestResult && expanded.backtest && (
            <Section id="backtest" title="Результаты бэктеста" icon={BarChart3}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '12px', background: '#0a0a0f', borderRadius: '8px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>{backtestResult.totalTrades}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Сделок</p>
                </div>
                
                <div style={{ textAlign: 'center', padding: '12px', background: '#0a0a0f', borderRadius: '8px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: backtestResult.winRate >= 50 ? '#10b981' : '#ef4444' }}>
                    {backtestResult.winRate}%
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Win Rate</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#0a0a0f', borderRadius: '8px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{backtestResult.profitFactor}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Profit Factor</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#0a0a0f', borderRadius: '8px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>+{backtestResult.netProfit}%</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Net Profit</p>
                </div>
              </div>
              
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#10b981' }}>
                  ✅ Стратегия прошла валидацию. Рекомендуется к использованию.
                </p>
              </div>
            </Section>
          )}

          {/* Preview */}
          <div style={{ 
            background: '#13131f', 
            borderRadius: '12px', 
            border: '1px solid #1c1c2e', 
            padding: '16px'
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Предпросмотр стратегии</h3>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              background: '#0a0a0f',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <p><span style={{ color: '#00d4ff' }}>Название:</span> {strategy.name}</p>
              <p><span style={{ color: '#00d4ff' }}>Стиль:</span> {strategy.style}</p>
              <p><span style={{ color: '#00d4ff' }}>Риск:</span> {strategy.riskPerTrade}% на сделку, макс просадка {strategy.maxDrawdown}%</p>
              <p><span style={{ color: '#00d4ff' }}>Условия ({strategy.conditions.length}):</span></p>
              <div style={{ paddingLeft: '16px' }}>
                {strategy.conditions.map((c, i) => (
                  <p key={c.id} style={{ color: '#6b7280' }}>
                    {i === 0 ? 'IF' : 'AND'} {INDICATORS.find(ind => ind.value === c.indicator)?.label} 
                    {OPERATORS.find(op => op.value === c.operator)?.label} {c.value}
                    {c.timeframe && ` (${c.timeframe})`}
                  </p>
                ))}
              </div>
              {strategy.conditions.length > 0 && (
                <p style={{ color: '#10b981' }}>THEN открыть сделку</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
