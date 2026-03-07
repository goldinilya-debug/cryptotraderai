'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Brain, TrendingUp, History, Play, Pause, RotateCcw, Save, BarChart3 } from 'lucide-react'

interface MLModel {
  id: string
  name: string
  accuracy: number
  totalTrades: number
  winRate: number
  status: 'training' | 'ready' | 'paused'
  lastTrained: string
}

interface BacktestResult {
  strategy: string
  period: string
  totalReturn: number
  winRate: number
  maxDrawdown: number
  sharpeRatio: number
  trades: number
}

export default function MLPage() {
  const [activeTab, setActiveTab] = useState<'ml' | 'backtest'>('ml')
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [signals, setSignals] = useState(3)
  const [models, setModels] = useState<MLModel[]>([
    {
      id: '1',
      name: 'Wyckoff + SMC Ensemble',
      accuracy: 76.5,
      totalTrades: 127,
      winRate: 72.4,
      status: 'ready',
      lastTrained: '2026-03-07T14:30:00Z'
    },
    {
      id: '2', 
      name: 'Kill Zone Predictor',
      accuracy: 81.2,
      totalTrades: 89,
      winRate: 78.6,
      status: 'ready',
      lastTrained: '2026-03-06T10:15:00Z'
    }
  ])

  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([
    {
      strategy: 'SMA Crossover + Volume',
      period: 'Jan 2026 - Mar 2026',
      totalReturn: 34.5,
      winRate: 68.2,
      maxDrawdown: -12.3,
      sharpeRatio: 1.45,
      trades: 47
    },
    {
      strategy: 'Wyckoff Accumulation',
      period: 'Jan 2026 - Mar 2026', 
      totalReturn: 52.1,
      winRate: 74.8,
      maxDrawdown: -8.7,
      sharpeRatio: 2.12,
      trades: 31
    },
    {
      strategy: 'SMC Order Blocks',
      period: 'Feb 2026 - Mar 2026',
      totalReturn: 28.9,
      winRate: 71.3,
      maxDrawdown: -15.2,
      sharpeRatio: 1.23,
      trades: 24
    }
  ])

  // Simulate training
  useEffect(() => {
    if (isTraining && trainingProgress < 100) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false)
            setSignals(s => s + Math.floor(Math.random() * 5) + 1)
            return 100
          }
          return prev + Math.random() * 3
        })
      }, 500)
      return () => clearInterval(interval)
    }
  }, [isTraining, trainingProgress])

  const startTraining = () => {
    setIsTraining(true)
    setTrainingProgress(0)
  }

  const pauseTraining = () => {
    setIsTraining(false)
  }

  const resetTraining = () => {
    setIsTraining(false)
    setTrainingProgress(0)
  }

  const runBacktest = (strategy: string) => {
    // Simulate backtest
    const newResult: BacktestResult = {
      strategy: strategy,
      period: 'Last 30 days',
      totalReturn: Number((Math.random() * 40 + 10).toFixed(1)),
      winRate: Number((Math.random() * 20 + 60).toFixed(1)),
      maxDrawdown: Number((-(Math.random() * 15 + 5)).toFixed(1)),
      sharpeRatio: Number((Math.random() * 1.5 + 0.8).toFixed(2)),
      trades: Math.floor(Math.random() * 30) + 10
    }
    setBacktestResults(prev => [newResult, ...prev])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: '#00d4ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ArrowLeft size={20} /> Назад
        </Link>
        <h1 style={{ margin: '0', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Brain size={32} color="#00d4ff" />
          ML & Backtest
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Обучение моделей и тестирование стратегий</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #2a2a3e', paddingBottom: '1px' }}>
        <button
          onClick={() => setActiveTab('ml')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'ml' ? '#00d4ff' : 'transparent',
            color: activeTab === 'ml' ? '#0a0a0f' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Brain size={18} /> ML Модели
        </button>
        <button
          onClick={() => setActiveTab('backtest')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'backtest' ? '#00d4ff' : 'transparent',
            color: activeTab === 'backtest' ? '#0a0a0f' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <History size={18} /> Бэктест
        </button>
      </div>

      {activeTab === 'ml' ? (
        <>
          {/* ML Training Status */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={20} color="#00d4ff" />
              Обучение модели
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '12px' }}>Сигналов собрано</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#00d4ff' }}>{signals}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '12px' }}>Прогресс обучения</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: isTraining ? '#f59e0b' : trainingProgress >= 100 ? '#10b981' : '#6b7280' }}>{Math.floor(trainingProgress)}%</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '12px' }}>Статус</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: isTraining ? '#f59e0b' : '#10b981' }}>{isTraining ? '🔴 Обучение...' : trainingProgress >= 100 ? '✅ Готово' : '⏸️ Пауза'}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background: '#0a0a0f', height: '8px', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${trainingProgress}%`, 
                height: '100%', 
                background: isTraining ? '#f59e0b' : '#00d4ff',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isTraining ? (
                <button
                  onClick={startTraining}
                  disabled={trainingProgress >= 100}
                  style={{
                    padding: '12px 24px',
                    background: trainingProgress >= 100 ? '#2a2a3e' : '#f59e0b',
                    color: '#0a0a0f',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: trainingProgress >= 100 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Play size={18} /> {trainingProgress >= 100 ? 'Обучено' : 'Собрать данные'}
                </button>
              ) : (
                <button
                  onClick={pauseTraining}
                  style={{
                    padding: '12px 24px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Pause size={18} /> Пауза
                </button>
              )}
              
              <button
                onClick={resetTraining}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #6b7280',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RotateCcw size={18} /> Сброс
              </button>
            </div>
          </div>

          {/* Trained Models */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={20} color="#00d4ff" />
              Обученные модели
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {models.map(model => (
                <div key={model.id} style={{ padding: '16px', background: '#0a0a0f', borderRadius: '8px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <p style={{ margin: '0', fontWeight: 'bold' }}>{model.name}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{new Date(model.lastTrained).toLocaleDateString('ru-RU')}</p>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Точность</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: model.accuracy >= 75 ? '#10b981' : '#f59e0b' }}>{model.accuracy}%</p>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Win Rate</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: model.winRate >= 70 ? '#10b981' : '#f59e0b' }}>{model.winRate}%</p>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Сделок</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>{model.totalTrades}</p>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      background: model.status === 'ready' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: model.status === 'ready' ? '#10b981' : '#f59e0b',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {model.status === 'ready' ? '✅ Активна' : '⏳ Обучается'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Backtest Section */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#00d4ff" />
              Запустить бэктест
            </h3>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['SMA Crossover', 'Wyckoff Phases', 'SMC Order Blocks', 'Kill Zone Breakout', 'RSI Divergence'].map(strategy => (
                <button
                  key={strategy}
                  onClick={() => runBacktest(strategy)}
                  style={{
                    padding: '12px 20px',
                    background: '#0a0a0f',
                    color: '#fff',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {strategy}
                </button>
              ))}
            </div>
          </div>

          {/* Backtest Results */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#00d4ff" />
              Результаты бэктестов
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {backtestResults.map((result, idx) => (
                <div key={idx} style={{ padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0', fontWeight: 'bold' }}>{result.strategy}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{result.period}</p>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Доходность</p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: result.totalReturn > 0 ? '#10b981' : '#ef4444' }}>{result.totalReturn > 0 ? '+' : ''}{result.totalReturn}%</p>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Win Rate</p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>{result.winRate}%</p>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Макс. просадка</p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: '#ef4444' }}>{result.maxDrawdown}%</p>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Sharpe Ratio</p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: result.sharpeRatio >= 1.5 ? '#10b981' : '#f59e0b' }}>{result.sharpeRatio}</p>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Сделок</p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>{result.trades}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
