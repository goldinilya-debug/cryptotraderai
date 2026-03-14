'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Target, TrendingUp, TrendingDown, Layers, Activity, ChevronDown, ChevronUp } from 'lucide-react'

interface FibZone {
  level: number
  price: number
  type: 'support' | 'resistance' | 'discount' | 'premium'
  label: string
  strength: 'weak' | 'medium' | 'strong'
}

interface PricePoint {
  timestamp: number
  price: number
  volume: number
}

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

// Список доступных пар
const AVAILABLE_PAIRS = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'ADA/USDT', 'DOGE/USDT', 'TRX/USDT', 'TON/USDT', 'LINK/USDT',
  'POL/USDT', 'DOT/USDT', 'LTC/USDT', 'BCH/USDT', 'UNI/USDT',
  '1000PEPE/USDT', '1000SHIB/USDT', 'FLOKI/USDT', 'BONK/USDT',
  'WIF/USDT', 'WLD/USDT', 'ARKM/USDT', 'PYTH/USDT', 'JUP/USDT',
  'SEI/USDT', 'SUI/USDT', 'APT/USDT', 'INJ/USDT', 'RENDER/USDT',
  'TIA/USDT', 'STRK/USDT', 'DYM/USDT', 'SAGA/USDT', 'ZRO/USDT'
]

// Форматирование цены
const formatPrice = (price: number): string => {
  if (price === 0) return '0'
  if (price < 0.000001) return price.toExponential(4)
  if (price < 0.01) return price.toFixed(8).replace(/\.?0+$/, '')
  if (price < 1) return price.toFixed(4).replace(/\.?0+$/, '')
  if (price < 1000) return price.toFixed(2)
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function FibZonesPage() {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [timeframe, setTimeframe] = useState('4H')
  const [swingHigh, setSwingHigh] = useState(70000)
  const [swingLow, setSwingLow] = useState(65000)
  const [fibZones, setFibZones] = useState<FibZone[]>([])
  const [currentPrice, setCurrentPrice] = useState(68726)
  const [showRetracements, setShowRetracements] = useState(true)
  const [showExtensions, setShowExtensions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [priceChange, setPriceChange] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [customPairs, setCustomPairs] = useState<string[]>([])
  const [showAddPair, setShowAddPair] = useState(false)
  const [newPairInput, setNewPairInput] = useState('')

  // Объединяем стандартные и кастомные пары
  const allPairs = [...AVAILABLE_PAIRS, ...customPairs]
  
  // Фильтруем пары по поиску
  const filteredPairs = allPairs.filter(pair => 
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Загрузка кастомных пар из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fibCustomPairs')
    if (saved) {
      setCustomPairs(JSON.parse(saved))
    }
  }, [])

  // Сохранение кастомных пар
  const saveCustomPairs = (pairs: string[]) => {
    setCustomPairs(pairs)
    localStorage.setItem('fibCustomPairs', JSON.stringify(pairs))
  }

  // Добавление новой пары
  const addCustomPair = () => {
    const pair = newPairInput.toUpperCase().trim()
    if (pair && !allPairs.includes(pair)) {
      if (pair.includes('/USDT') || pair.includes('USDT')) {
        const formattedPair = pair.includes('/') ? pair : pair.replace('USDT', '/USDT')
        saveCustomPairs([...customPairs, formattedPair])
        setNewPairInput('')
        setShowAddPair(false)
      } else {
        alert('Пара должна заканчиваться на USDT (например: ACE/USDT)')
      }
    }
  }

  // Удаление кастомной пары
  const removeCustomPair = (pairToRemove: string) => {
    saveCustomPairs(customPairs.filter(p => p !== pairToRemove))
  }

  // Загрузка данных при изменении пары или таймфрейма
  const loadPairData = async (pairToLoad?: string) => {
    const pair = pairToLoad || selectedPair
    setLoading(true)
    setFetchError("")
    try {
      // Формируем символ для BingX API
      let symbol = pair.replace('/', '')
const symbolMap: {[k:string]:string} = {'1000PEPEUSDT':'PEPE-USDT','1000SHIBUSDT':'SHIB-USDT','MATICUSDT':'POL-USDT','1000BONKUSDT':'BONK-USDT'}
      let bingxOverride = ''
      const rawBingx = symbol.replace('USDT', '-USDT')
      if (symbolMap[symbol]) bingxOverride = symbolMap[symbol]
      
      console.log('=== Loading data ===')
      console.log('Pair:', pair)
      console.log('Symbol for API:', symbol)
      console.log('Timeframe:', timeframe)
      
      // Получаем текущую цену
      console.log('Fetching price...')
      const bingxSymbol = bingxOverride || rawBingx
      const priceRes = await fetch(`https://cryptotraderai-api.onrender.com/proxy/ticker/${bingxSymbol}`)
      console.log('Price response status:', priceRes.status)
      
      if (!priceRes.ok) {
        const errorText = await priceRes.text()
        console.error('Price API error response:', errorText)
        throw new Error(`Price API error: ${priceRes.status}`)
      }
      
      const priceData = await priceRes.json()
      console.log('Price data received:', priceData)
      
      const price = parseFloat(priceData.data.lastPrice)
      const change = parseFloat(priceData.data.priceChangePercent)
      console.log('Parsed price:', price, 'Change:', change)
      
      if (isNaN(price)) {
        throw new Error('Invalid price received')
      }
      
      setCurrentPrice(price)
      setPriceChange(change)

      // Получаем свечи для определения swing high/low
      const intervalMap: {[key: string]: string} = {
        '15m': '15m',
        '1H': '1h', 
        '4H': '4h',
        '1D': '1d'
      }
      const interval = intervalMap[timeframe] || '4h'
      
      console.log('Fetching klines with interval:', interval)
      const bingxSymbol2 = bingxOverride || rawBingx
      const klinesRes = await fetch(`https://cryptotraderai-api.onrender.com/proxy/klines/${bingxSymbol2}?interval=${interval}&limit=100`)
      console.log('Klines response status:', klinesRes.status)
      
      if (!klinesRes.ok) {
        const errorText = await klinesRes.text()
        console.error('Klines API error response:', errorText)
        throw new Error(`Klines API error: ${klinesRes.status}`)
      }
      
      const klinesData = await klinesRes.json()
      const klines = klinesData.data || []
      console.log('Klines received:', klines.length)
      if (klines.length > 0) {
        const highs = klines.map((k: any) => parseFloat(k.high))
        const lows = klines.map((k: any) => parseFloat(k.low))
        const maxHigh = Math.max(...highs)
        const minLow = Math.min(...lows)
        console.log('Swing High:', maxHigh, 'Swing Low:', minLow)
        setSwingHigh(maxHigh)
        setSwingLow(minLow)
      } else {
        console.warn('No klines data received')
        // Fallback для PEPE если нет данных
        if (pair.includes('PEPE')) {
          setSwingHigh(price * 1.1)
          setSwingLow(price * 0.9)
        }
      }
      
      console.log('=== Data loading complete ===')
    } catch (e) {
      console.error('Error loading data:', e)
      setFetchError((e as Error).message)
    }
    setLoading(false)
  }

  useEffect(() => {
    calculateFibZones()
  }, [swingHigh, swingLow, currentPrice])

  // Загружаем данные при первом рендере
  useEffect(() => {
    loadPairData('BTC/USDT')
  }, []) // Пустой массив - только при первом рендере

  // Загружаем данные при смене пары или таймфрейма
  useEffect(() => {
    console.log('Pair changed to:', selectedPair)
    loadPairData(selectedPair)
  }, [selectedPair, timeframe])

  const calculateFibZones = () => {
    const range = swingHigh - swingLow
    const zones: FibZone[] = FIB_LEVELS.map(level => {
      const price = swingHigh - range * level
      let type: 'support' | 'resistance' | 'discount' | 'premium' = 'support'
      let label = ''
      let strength: 'weak' | 'medium' | 'strong' = 'medium'

      if (level === 0) {
        type = 'resistance'
        label = 'Swing High'
        strength = 'strong'
      } else if (level === 1) {
        type = 'support'
        label = 'Swing Low'
        strength = 'strong'
      } else if (level === 0.5) {
        type = currentPrice > price ? 'discount' : 'premium'
        label = 'Equilibrium (50%)'
        strength = 'strong'
      } else if (level === 0.618 || level === 0.382) {
        type = currentPrice > price ? 'discount' : 'premium'
        label = `Golden Zone (${(level * 100).toFixed(1)}%)`
        strength = 'strong'
      } else {
        type = currentPrice > price ? 'discount' : 'premium'
        label = `${(level * 100).toFixed(1)}%`
        strength = 'medium'
      }

      return { level, price, type, label, strength }
    })

    setFibZones(zones)
  }

  const getZoneColor = (zone: FibZone) => {
    switch(zone.type) {
      case 'support': return '#10b981'
      case 'resistance': return '#ef4444'
      case 'discount': return '#3b82f6'
      case 'premium': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getActiveZone = () => {
    for (let i = 0; i < fibZones.length - 1; i++) {
      if (currentPrice <= fibZones[i].price && currentPrice >= fibZones[i + 1].price) {
        return fibZones[i]
      }
    }
    return null
  }

  const activeZone = getActiveZone()

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>
        {fetchError && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '16px', color: '#ef4444', fontSize: '13px' }}>
            ⚠️ Ошибка загрузки данных: {fetchError}
          </div>
        )}
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Target size={32} color="#00d4ff" />
              Fibonacci Zones
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Key levels for optimal entry and exit points</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Поиск и выбор пары */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск пары..."
                style={{
                  padding: '10px 16px',
                  background: '#13131f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#fff',
                  width: '150px'
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
                      onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a3e'}
                      onMouseLeave={(e) => e.currentTarget.style.background = selectedPair === pair ? '#2a2a3e' : 'transparent'}
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
                          ×
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
            
            {/* Кнопка добавить пару */}
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
              + Добавить
            </button>
            
            {showAddPair && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newPairInput}
                  onChange={(e) => setNewPairInput(e.target.value)}
                  placeholder="ACE/USDT"
                  style={{
                    padding: '10px 16px',
                    background: '#13131f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    color: '#fff',
                    width: '120px'
                  }}
                />
                <button
                  onClick={addCustomPair}
                  style={{
                    padding: '10px 16px',
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
            
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                padding: '10px 16px',
                background: '#13131f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#fff'
              }}
            >
              <option value="15m">15m</option>
              <option value="1H">1H</option>
              <option value="4H">4H</option>
              <option value="1D">1D</option>
            </select>
            
            <button
              onClick={() => loadPairData(selectedPair)}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#1c1c2e' : 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? '⏳' : '🔄'} {loading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>
        </div>

        {/* Описание таймфреймов */}
        <div style={{
          background: '#13131f',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #2a2a3e',
          marginBottom: '24px'
        }}>
          <p style={{ margin: '0 0 12px 0', color: '#00d4ff', fontWeight: 'bold', fontSize: '14px' }}>
            📊 Рекомендуемые таймфреймы для торговли:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#f59e0b', fontSize: '13px' }}>15m - Скальпинг</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Быстрые сетапы, много шума, подходит для активного трейдинга</p>
            </div>
            <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #22c55e' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#22c55e', fontSize: '13px' }}>1H - Дей-трейдинг ⭐</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Оптимальный баланс. Меньше шума, чёткие уровни</p>
            </div>
            <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#3b82f6', fontSize: '13px' }}>4H - Свинг-трейдинг ⭐⭐</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Самые сильные уровни. Рекомендуется для SMC</p>
            </div>
            <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#a855f7', fontSize: '13px' }}>1D - Позиционная торговля</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Долгосрочные позиции, крупные движения</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          {/* Main Chart Area */}
          <div>
            {/* Price Info */}
            <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>Current Price • {selectedPair}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 'bold' }}>${formatPrice(currentPrice)}</span>
                    <span style={{
                      padding: '4px 12px',
                      background: priceChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: priceChange >= 0 ? '#10b981' : '#ef4444',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  </div>
                  {/* Swing High/Low */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      Swing High: <strong style={{ color: '#10b981' }}>${formatPrice(swingHigh)}</strong>
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      Swing Low: <strong style={{ color: '#ef4444' }}>${formatPrice(swingLow)}</strong>
                    </span>
                  </div>
                </div>

                {activeZone && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>Current Zone</p>
                    <div style={{
                      padding: '8px 16px',
                      background: `${getZoneColor(activeZone)}20`,
                      border: `1px solid ${getZoneColor(activeZone)}`,
                      borderRadius: '8px',
                      color: getZoneColor(activeZone),
                      fontWeight: 'bold'
                    }}>
                      {activeZone.label}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fib Chart Visualization */}
            <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', height: '500px', position: 'relative' }}>
              <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#00d4ff" />
                Fibonacci Retracements
              </h3>

              {/* Chart Container */}
              <div style={{ position: 'relative', height: '400px', background: '#0a0a0f', borderRadius: '8px', padding: '20px' }}>
                {fibZones.map((zone, idx) => {
                  const top = (zone.level * 100)
                  const isActive = currentPrice <= zone.price && (idx === fibZones.length - 1 || currentPrice >= fibZones[idx + 1].price)

                  return (
                    <div
                      key={zone.level}
                      style={{
                        position: 'absolute',
                        top: `${top}%`,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: getZoneColor(zone),
                        opacity: isActive ? 1 : 0.5
                      }}
                    >
                      {/* Label */}
                      <div style={{
                        position: 'absolute',
                        left: '10px',
                        top: '-10px',
                        background: '#13131f',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: getZoneColor(zone),
                        fontWeight: 'bold',
                        border: `1px solid ${getZoneColor(zone)}`
                      }}>
                        {zone.label} - ${formatPrice(zone.price)}
                      </div>

                      {/* Zone Fill */}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: 0,
                          right: 0,
                          height: idx < fibZones.length - 1 ? `${((fibZones[idx + 1]?.level || 1) - zone.level) * 100}%` : '50px',
                          background: `${getZoneColor(zone)}10`,
                          zIndex: -1
                        }} />
                      )}
                    </div>
                  )
                })}

                {/* Current Price Indicator */}
                <div style={{
                  position: 'absolute',
                  top: `${((swingHigh - currentPrice) / (swingHigh - swingLow)) * 100}%`,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#00d4ff',
                  zIndex: 10
                }}>
                  <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '-12px',
                    background: '#00d4ff',
                    color: '#0a0a0f',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    Current ${formatPrice(currentPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Swing Settings */}
            <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e', marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0' }}>Swing Points</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Swing High</label>
                  <input
                    type="number"
                    value={swingHigh}
                    onChange={(e) => setSwingHigh(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Swing Low</label>
                  <input
                    type="number"
                    value={swingLow}
                    onChange={(e) => setSwingLow(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Zone Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Trading Zones Info */}
            <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#00d4ff' }}>🎯 Trading Zones</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>DISCOUNT ZONE</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>0.618 - 0.5 Fib</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Buy opportunities</p>
                </div>

                <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>PREMIUM ZONE</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>0.5 - 0.382 Fib</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Sell opportunities</p>
                </div>

                <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>GOLDEN ZONE</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>0.618 - 0.65 Fib</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Highest probability</p>
                </div>
              </div>
            </div>

            {/* Key Levels */}
            <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <h4 style={{ margin: '0 0 16px 0' }}>Key Levels</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fibZones.filter(z => z.level === 0 || z.level === 0.5 || z.level === 0.618 || z.level === 1).map((zone) => (
                  <div
                    key={zone.level}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#0a0a0f',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${getZoneColor(zone)}`
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{zone.label}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{zone.type.toUpperCase()}</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: getZoneColor(zone) }}>${formatPrice(zone.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <h4 style={{ margin: '0 0 16px 0' }}>Display Options</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showRetracements}
                    onChange={(e) => setShowRetracements(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Show Retracements</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showExtensions}
                    onChange={(e) => setShowExtensions(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Show Extensions (1.272, 1.618)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
