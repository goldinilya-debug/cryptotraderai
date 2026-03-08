'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Layers, BarChart2, TrendingUp, Activity, Info, Search, Plus, Trash2 } from 'lucide-react'

interface FootprintData {
  pair: string
  currentPrice: number
  priceChange24h: number
  volume24h: number
  high24h: number
  low24h: number
  buyVolume: number
  sellVolume: number
  delta: number
  deltaPercent: number
  poc: number
  valueAreaHigh: number
  valueAreaLow: number
}

// Список доступных пар
const AVAILABLE_PAIRS = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'ADA/USDT', 'DOGE/USDT', 'TRX/USDT', 'LINK/USDT',
  'MATIC/USDT', 'DOT/USDT', 'LTC/USDT', 'BCH/USDT',
  '1000PEPE/USDT', '1000SHIB/USDT'
]

const formatPrice = (price: number): string => {
  if (price === 0) return '0'
  if (price < 0.000001) return price.toExponential(4)
  if (price < 0.01) return price.toFixed(8).replace(/\.?0+$/, '')
  if (price < 1) return price.toFixed(4).replace(/\.?0+$/, '')
  if (price < 1000) return price.toFixed(2)
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatVolume = (vol: number): string => {
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toFixed(2)
}

export default function FootprintPage() {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [data, setData] = useState<FootprintData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customPairs, setCustomPairs] = useState<string[]>([])
  const [showAddPair, setShowAddPair] = useState(false)
  const [newPairInput, setNewPairInput] = useState('')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Загрузка кастомных пар
  useEffect(() => {
    const saved = localStorage.getItem('footprintCustomPairs')
    if (saved) {
      setCustomPairs(JSON.parse(saved))
    }
  }, [])

  const saveCustomPairs = (pairs: string[]) => {
    setCustomPairs(pairs)
    localStorage.setItem('footprintCustomPairs', JSON.stringify(pairs))
  }

  const addCustomPair = () => {
    const pair = newPairInput.toUpperCase().trim()
    if (pair && !allPairs.includes(pair)) {
      if (pair.includes('/USDT') || pair.includes('USDT')) {
        const formattedPair = pair.includes('/') ? pair : pair.replace('USDT', '/USDT')
        saveCustomPairs([...customPairs, formattedPair])
        setNewPairInput('')
        setShowAddPair(false)
      } else {
        alert('Пара должна заканчиваться на USDT')
      }
    }
  }

  const removeCustomPair = (pairToRemove: string) => {
    saveCustomPairs(customPairs.filter(p => p !== pairToRemove))
    if (selectedPair === pairToRemove) {
      setSelectedPair('BTC/USDT')
    }
  }

  const allPairs = [...AVAILABLE_PAIRS, ...customPairs]
  const filteredPairs = allPairs.filter(pair => 
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Загрузка данных
  const loadData = async (pair: string = selectedPair) => {
    setLoading(true)
    try {
      let symbol = pair.replace('/', '')
      if (symbol === '1000PEPEUSDT') symbol = 'PEPEUSDT'
      if (symbol === '1000SHIBUSDT') symbol = 'SHIBUSDT'

      // Получаем 24h статистику
      const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      const ticker = await tickerRes.json()

      // Получаем последние сделки для дельты
      const tradesRes = await fetch(`https://api.binance.com/api/v3/aggTrades?symbol=${symbol}&limit=100`)
      const trades = await tradesRes.json()

      // Рассчитываем дельту (упрощенно)
      let buyVol = 0
      let sellVol = 0
      trades.forEach((trade: any) => {
        const qty = parseFloat(trade.q)
        if (!trade.m) { // m = true - продажа (мейкер), false - покупка
          buyVol += qty
        } else {
          sellVol += qty
        }
      })

      const delta = buyVol - sellVol
      const totalVol = buyVol + sellVol
      const deltaPercent = totalVol > 0 ? (delta / totalVol) * 100 : 0

      // Рассчитываем POC и Value Area (упрощенно)
      const currentPrice = parseFloat(ticker.lastPrice)
      const high24h = parseFloat(ticker.highPrice)
      const low24h = parseFloat(ticker.lowPrice)
      const range = high24h - low24h

      setData({
        pair,
        currentPrice,
        priceChange24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.volume) * currentPrice,
        high24h,
        low24h,
        buyVolume: buyVol,
        sellVolume: sellVol,
        delta,
        deltaPercent,
        poc: (high24h + low24h) / 2, // Упрощенно - середина диапазона
        valueAreaHigh: high24h - range * 0.15,
        valueAreaLow: low24h + range * 0.15
      })
      
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (e) {
      console.error('Error loading data:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(), 30000) // Обновление каждые 30 сек
    return () => clearInterval(interval)
  }, [selectedPair])

  if (!data) {
    return (
      <Sidebar>
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
          Загрузка данных...
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={32} color="#00d4ff" />
              Footprint Charts
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Реальные данные с Binance • Последнее обновление: {lastUpdate}</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Поиск пары */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                style={{
                  padding: '10px 16px',
                  background: '#13131f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#fff',
                  width: '120px'
                }}
              />
              {searchQuery && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#1c1c2e',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 100
                }}>
                  {filteredPairs.map(pair => (
                    <div
                      key={pair}
                      onClick={() => {
                        setSelectedPair(pair)
                        setSearchQuery('')
                      }}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #2a2a3e',
                        background: selectedPair === pair ? '#2a2a3e' : 'transparent'
                      }}
                    >
                      {pair}
                      {customPairs.includes(pair) && (
                        <span 
                          style={{ float: 'right', color: '#ef4444', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCustomPair(pair)
                          }}
                        >
                          <Trash2 size={14} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Текущая пара */}
            <div style={{
              padding: '10px 16px',
              background: '#1c1c2e',
              border: '1px solid #00d4ff',
              borderRadius: '8px',
              color: '#00d4ff',
              fontWeight: 'bold'
            }}>
              {selectedPair}
            </div>

            {/* Добавить пару */}
            <button
              onClick={() => setShowAddPair(!showAddPair)}
              style={{
                padding: '10px 16px',
                background: '#13131f',
                border: '1px solid #10b981',
                borderRadius: '8px',
                color: '#10b981',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
            </button>

            {showAddPair && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newPairInput}
                  onChange={(e) => setNewPairInput(e.target.value)}
                  placeholder="ACE/USDT"
                  style={{
                    padding: '10px',
                    background: '#13131f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    color: '#fff',
                    width: '100px'
                  }}
                />
                <button
                  onClick={addCustomPair}
                  style={{
                    padding: '10px',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  OK
                </button>
              </div>
            )}

            <button
              onClick={() => loadData()}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#1c1c2e' : 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳' : '🔄'}
            </button>
          </div>
        </div>

        {/* Цена и изменение */}
        <div style={{ 
          background: '#13131f', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #2a2a3e',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>Current Price</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '36px', fontWeight: 'bold' }}>${formatPrice(data.currentPrice)}</span>
                <span style={{ 
                  padding: '4px 12px', 
                  background: data.priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  color: data.priceChange24h >= 0 ? '#10b981' : '#ef4444',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {data.priceChange24h >= 0 ? '+' : ''}{data.priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>24h Volume</p>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#00d4ff' }}>
                ${formatVolume(data.volume24h)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* Volume Profile */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Layers color="#00d4ff" />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Volume Profile (24h)</span>
            </div>
            
            {/* Визуализация */}
            <div style={{ 
              height: '150px', 
              background: '#0a0a0f', 
              borderRadius: '8px',
              position: 'relative',
              padding: '16px'
            }}>
              {/* POC линия */}
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: '2px',
                background: '#f59e0b'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '10px',
                  top: '-20px',
                  background: '#f59e0b',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  POC ${formatPrice(data.poc)}
                </span>
              </div>
              
              {/* Value Area */}
              <div style={{
                position: 'absolute',
                left: '20%',
                right: '20%',
                top: '30%',
                bottom: '30%',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px dashed #3b82f6',
                borderRadius: '4px'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-18px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: '#3b82f6'
                }}>
                  Value Area
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
              <div style={{ background: '#0a0a0f', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>POC</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>${formatPrice(data.poc)}</p>
              </div>
              <div style={{ background: '#0a0a0f', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Value Area</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>${formatPrice(data.valueAreaLow)} - ${formatPrice(data.valueAreaHigh)}</p>
              </div>
            </div>
          </div>

          {/* Order Flow Delta */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <BarChart2 color="#00d4ff" />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Order Flow Delta</span>
            </div>
            
            {/* Delta Bar */}
            <div style={{ 
              height: '60px', 
              background: '#0a0a0f', 
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                width: `${50 + (data.deltaPercent / 2)}%`,
                top: 0,
                bottom: 0,
                background: data.delta >= 0 ? '#10b981' : '#ef4444',
                opacity: 0.3
              }} />
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '2px',
                background: '#fff'
              }} />
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '18px',
                fontWeight: 'bold',
                color: data.delta >= 0 ? '#10b981' : '#ef4444'
              }}>
                {data.delta >= 0 ? '+' : ''}{data.deltaPercent.toFixed(2)}%
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Buy Volume</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>+{formatVolume(data.buyVolume)}</p>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Sell Volume</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>-{formatVolume(data.sellVolume)}</p>
              </div>
            </div>
          </div>

          {/* 24h Range */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <TrendingUp color="#00d4ff" />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>24h Range</span>
            </div>
            
            <div style={{ 
              height: '80px', 
              background: '#0a0a0f', 
              borderRadius: '8px',
              position: 'relative',
              padding: '20px'
            }}>
              <div style={{
                position: 'absolute',
                left: '10%',
                right: '10%',
                top: '50%',
                height: '4px',
                background: '#2a2a3e',
                borderRadius: '2px'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)',
                  borderRadius: '2px'
                }} />
              </div>
              
              <span style={{ position: 'absolute', left: '10%', top: '20px', fontSize: '12px', color: '#6b7280' }}>
                Low: ${formatPrice(data.low24h)}
              </span>
              <span style={{ position: 'absolute', right: '10%', top: '20px', fontSize: '12px', color: '#6b7280' }}>
                High: ${formatPrice(data.high24h)}
              </span>
              
              <span style={{ 
                position: 'absolute', 
                left: `${10 + ((data.currentPrice - data.low24h) / (data.high24h - data.low24h)) * 80}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#00d4ff',
                color: '#000',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                Now
              </span>
            </div>
          </div>

          {/* Объяснение */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Info color="#00d4ff" />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Как читать Footprint</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#f59e0b', fontSize: '14px' }}>POC</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                  Цена с максимальным объемом. Уровень согласия покупателей и продавцов.
                </p>
              </div>
              <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981', fontSize: '14px' }}>Delta &gt; 0</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                  Больше покупок чем продаж. Быки доминируют.
                </p>
              </div>
              <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#ef4444', fontSize: '14px' }}>Delta &lt; 0</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                  Больше продаж чем покупок. Медведи доминируют.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
