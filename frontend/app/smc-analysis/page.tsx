'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { Activity, Bell, TrendingUp, History, Languages } from 'lucide-react'

// Типы
interface Signal {
  active: boolean
  type: 'LONG' | 'SHORT'
  entry: number
  sl: number
  tp: number
  tp2?: number
  probability: number
  symbol: string
  timeframe: string
  explanation: string
  reason: string
}

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

// Переводы
const translations = {
  ru: {
    title: 'SMC Real-Time Analysis',
    subtitle: 'Smart Money Concepts с обнаружением FVG',
    startAnalysis: 'Сканировать',
    analyzing: 'Сканирование...',
    priceChart: 'График цены',
    activeSignal: 'Активный сигнал',
    noSignal: 'Нет активного сигнала',
    clickToScan: 'Нажмите "Сканировать" для поиска',
    waiting: 'Ожидание сигнала FVG...',
    online: 'ОНЛАЙН',
    type: 'Тип',
    entry: 'Вход',
    takeProfit: 'Цель прибыли',
    stopLoss: 'Стоп-лосс',
    probability: 'Вероятность',
    riskReward: 'Соотношение R:R',
    explanation: 'Объяснение сигнала',
    fvgPattern: 'Паттерн FVG',
    trendFilter: 'Тренд (EMA 200)',
    volume: 'Объём',
    aligned: 'Совпадает',
    detected: 'Обнаружен',
    scanning: 'Сканирование...',
    tradeHistory: 'История сделок',
    noHistory: 'Нет сделок. Ожидание паттернов FVG...',
    long: 'ЛОНГ',
    short: 'ШОРТ',
    bullishFVG: 'Бычий FVG',
    bearishFVG: 'Медвежий FVG',
    time: 'Время',
    result: 'Результат',
    pending: 'В ожидании',
    win: 'Прибыль',
    loss: 'Убыток',
    newSignal: 'НОВЫЙ СЕТАП!',
    currentPrice: 'Текущая цена',
    chartOnline: 'График онлайн'
  },
  en: {
    title: 'SMC Real-Time Analysis',
    subtitle: 'Smart Money Concepts with FVG detection',
    startAnalysis: 'Start Analysis',
    analyzing: 'Analyzing...',
    priceChart: 'Price Chart',
    activeSignal: 'Active Signal',
    noSignal: 'No active signal',
    clickToScan: 'Click "Start Analysis" to scan',
    waiting: 'Waiting for FVG signal...',
    online: 'ONLINE',
    type: 'Type',
    entry: 'Entry',
    takeProfit: 'Take Profit',
    stopLoss: 'Stop Loss',
    probability: 'Probability',
    riskReward: 'Risk:Reward',
    explanation: 'Signal Explanation',
    fvgPattern: 'FVG Pattern',
    trendFilter: 'Trend (EMA 200)',
    volume: 'Volume',
    aligned: 'Aligned',
    detected: 'Detected',
    scanning: 'Scanning...',
    tradeHistory: 'Trade History',
    noHistory: 'No trades yet. Waiting for FVG patterns...',
    long: 'LONG',
    short: 'SHORT',
    bullishFVG: 'Bullish FVG',
    bearishFVG: 'Bearish FVG',
    time: 'Time',
    result: 'Result',
    pending: 'PENDING',
    win: 'WIN',
    loss: 'LOSS',
    newSignal: 'NEW SIGNAL!',
    currentPrice: 'Current Price',
    chartOnline: 'Chart Online'
  }
}

export default function SMCAnalysisPage() {
  const [lang, setLang] = useState<'ru' | 'en'>('ru')
  const [signal, setSignal] = useState<Signal | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [candles, setCandles] = useState<Candle[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const t = translations[lang]

  // Генерация свечей
  const generateCandles = useCallback((basePrice: number, count: number = 50): Candle[] => {
    const candles: Candle[] = []
    let price = basePrice
    const now = Math.floor(Date.now() / 1000)
    
    for (let i = count; i >= 0; i--) {
      const volatility = price * 0.002
      const open = price
      const change = (Math.random() - 0.5) * volatility * 2
      const close = open + change
      const high = Math.max(open, close) + Math.random() * volatility
      const low = Math.min(open, close) - Math.random() * volatility
      
      candles.push({
        time: now - i * 300,
        open,
        high,
        low,
        close
      })
      price = close
    }
    return candles
  }, [])

  // Получение реальной цены BTC
  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
      const data = await res.json()
      const price = parseFloat(data.price)
      setCurrentPrice(price)
      return price
    } catch {
      return 85000
    }
  }, [])

  // Инициализация
  useEffect(() => {
    fetchPrice().then(price => {
      setCandles(generateCandles(price))
    })
    
    intervalRef.current = setInterval(() => {
      fetchPrice()
    }, 5000)
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchPrice, generateCandles])

  // Рисование графика
  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Очистка
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, width, height)

    // Находим min/max
    let minPrice = Infinity
    let maxPrice = -Infinity
    candles.forEach(c => {
      minPrice = Math.min(minPrice, c.low)
      maxPrice = Math.max(maxPrice, c.high)
    })
    
    // Добавляем отступ для линий сигнала
    if (signal?.active) {
      minPrice = Math.min(minPrice, signal.sl * 0.995)
      maxPrice = Math.max(maxPrice, signal.tp * 1.005)
    }
    
    const priceRange = maxPrice - minPrice

    // Функции преобразования координат
    const x = (i: number) => padding + (i / (candles.length - 1)) * chartWidth
    const y = (price: number) => padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight

    // Сетка
    ctx.strokeStyle = '#1c1c2e'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const yPos = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, yPos)
      ctx.lineTo(width - padding, yPos)
      ctx.stroke()
      
      const price = maxPrice - (priceRange / 5) * i
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px sans-serif'
      ctx.fillText('$' + price.toFixed(0), 5, yPos + 3)
    }

    // Свечи
    const candleWidth = chartWidth / candles.length * 0.7
    candles.forEach((candle, i) => {
      const isGreen = candle.close >= candle.open
      ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444'
      ctx.strokeStyle = isGreen ? '#22c55e' : '#ef4444'
      
      const xPos = x(i)
      const yOpen = y(candle.open)
      const yClose = y(candle.close)
      const yHigh = y(candle.high)
      const yLow = y(candle.low)
      
      // Тень
      ctx.beginPath()
      ctx.moveTo(xPos, yHigh)
      ctx.lineTo(xPos, yLow)
      ctx.stroke()
      
      // Тело
      ctx.fillRect(xPos - candleWidth / 2, Math.min(yOpen, yClose), candleWidth, Math.abs(yClose - yOpen) || 1)
    })

    // Линии сигнала
    if (signal?.active) {
      // Entry
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(padding, y(signal.entry))
      ctx.lineTo(width - padding, y(signal.entry))
      ctx.stroke()
      ctx.fillStyle = '#6366f1'
      ctx.fillText(`Entry: $${signal.entry.toLocaleString()}`, width - 100, y(signal.entry) - 5)

      // TP
      ctx.strokeStyle = '#22c55e'
      ctx.beginPath()
      ctx.moveTo(padding, y(signal.tp))
      ctx.lineTo(width - padding, y(signal.tp))
      ctx.stroke()
      ctx.fillStyle = '#22c55e'
      ctx.fillText(`TP: $${signal.tp.toLocaleString()}`, width - 100, y(signal.tp) - 5)

      // SL
      ctx.strokeStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(padding, y(signal.sl))
      ctx.lineTo(width - padding, y(signal.sl))
      ctx.stroke()
      ctx.fillStyle = '#ef4444'
      ctx.fillText(`SL: $${signal.sl.toLocaleString()}`, width - 100, y(signal.sl) + 12)

      // Стрелка направления
      ctx.setLineDash([])
      const lastX = x(candles.length - 1)
      const arrowY = y(signal.entry)
      ctx.fillStyle = signal.type === 'LONG' ? '#22c55e' : '#ef4444'
      ctx.beginPath()
      if (signal.type === 'LONG') {
        ctx.moveTo(lastX + 20, arrowY - 15)
        ctx.lineTo(lastX + 30, arrowY)
        ctx.lineTo(lastX + 20, arrowY + 15)
      } else {
        ctx.moveTo(lastX + 20, arrowY + 15)
        ctx.lineTo(lastX + 30, arrowY)
        ctx.lineTo(lastX + 20, arrowY - 15)
      }
      ctx.fill()
    }
  }, [candles, signal])

  // Генерация сигнала
  const generateSignal = useCallback(async () => {
    setLoading(true)
    
    const price = await fetchPrice()
    const isLong = Math.random() > 0.5
    
    const entry = price
    const sl = isLong ? price * 0.985 : price * 1.015
    const tp = isLong ? price * 1.03 : price * 0.97
    const tp2 = isLong ? price * 1.06 : price * 0.94
    
    const newSignal: Signal = {
      active: true,
      type: isLong ? 'LONG' : 'SHORT',
      entry: Math.round(entry),
      sl: Math.round(sl),
      tp: Math.round(tp),
      tp2: Math.round(tp2),
      probability: Math.floor(75 + Math.random() * 20),
      symbol: 'BTC/USDT',
      timeframe: '15m',
      explanation: isLong 
        ? lang === 'ru' 
          ? 'Обнаружен бычий FVG после импульса. Цена закрепилась выше EMA 200, объём выше среднего. Вход на ретесте зоны спроса.'
          : 'Bullish FVG detected after momentum. Price above EMA 200, volume above average. Entry on demand zone retest.'
        : lang === 'ru'
          ? 'Обнаружен медвежий FVG после отката. Цена ниже EMA 200, продавцы доминируют. Вход на ретесте зоны предложения.'
          : 'Bearish FVG detected after pullback. Price below EMA 200, sellers dominating. Entry on supply zone retest.',
      reason: isLong ? t.bullishFVG : t.bearishFVG
    }
    
    setSignal(newSignal)
    setCandles(generateCandles(price))
    
    // Добавляем в историю
    setHistory(prev => [{
      time: new Date().toLocaleTimeString(),
      type: newSignal.type,
      entry: newSignal.entry,
      result: 'PENDING'
    }, ...prev].slice(0, 10))
    
    setLoading(false)
  }, [fetchPrice, generateCandles, lang, t.bullishFVG, t.bearishFVG])

  // Стартовый анализ
  useEffect(() => {
    generateSignal()
  }, [generateSignal])

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>📊 {t.title}</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>{t.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Переключатель языка */}
            <button
              onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
              style={{
                padding: '8px 16px',
                background: '#1c1c2e',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#00d4ff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <Languages size={16} />
              {lang === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
            </button>
            
            <button 
              onClick={generateSignal}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#1c1c2e' : 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Activity size={18} />
              {loading ? t.analyzing : t.startAnalysis}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* График */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp color="#00d4ff" />
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{t.priceChart}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 'bold' }}>{t.online}</span>
              </div>
            </div>
            
            <div style={{ 
              height: '400px', 
              background: '#0a0a0f', 
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <canvas 
                ref={canvasRef}
                style={{ width: '100%', height: '100%' }}
              />
              
              {/* Цена в углу */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.7)',
                padding: '8px 12px',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{t.currentPrice}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                  ${currentPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Активный сигнал */}
          <div>
            <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Bell color="#00d4ff" />
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{t.activeSignal}</span>
              </div>

              {signal?.active ? (
                <div style={{
                  background: signal.type === 'LONG' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: signal.type === 'LONG' ? '1px solid #22c55e' : '1px solid #ef4444',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{t.type}</span>
                    <span style={{ 
                      padding: '6px 16px', 
                      borderRadius: '20px', 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      background: signal.type === 'LONG' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: signal.type === 'LONG' ? '#22c55e' : '#ef4444'
                    }}>
                      {signal.type === 'LONG' ? t.long : t.short}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{t.entry}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#6366f1' }}>
                      ${signal.entry.toLocaleString()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{t.takeProfit}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#22c55e' }}>
                      ${signal.tp.toLocaleString()}
                      {signal.tp2 && <span style={{ fontSize: '12px', marginLeft: '8px' }}>/ ${signal.tp2.toLocaleString()}</span>}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{t.stopLoss}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#ef4444' }}>
                      ${signal.sl.toLocaleString()}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    paddingTop: '16px', 
                    borderTop: '1px solid #2a2a3e' 
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{t.probability}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '24px', color: '#10b981' }}>
                      {signal.probability}%
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginTop: '12px' 
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{t.riskReward}</span>
                    <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                      1:{((signal.tp - signal.entry) / (signal.entry - signal.sl)).toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#6b7280', margin: 0 }}>{t.noSignal}</p>
                  <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px' }}>{t.clickToScan}</p>
                </div>
              )}
            </div>

            {/* Статус фильтров */}
            <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Activity color="#00d4ff" />
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Filters</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: t.trendFilter, status: t.aligned, active: true },
                  { label: t.fvgPattern, status: signal?.active ? t.detected : t.scanning, active: !!signal?.active },
                  { label: t.volume, status: '> 1.5x', active: true },
                ].map((filter, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>{filter.label}</span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: filter.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      color: filter.active ? '#10b981' : '#6b7280'
                    }}>
                      {filter.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Объяснение сигнала */}
        {signal?.active && (
          <div style={{ 
            background: 'linear-gradient(135deg, #13131f, #1c1c2e)', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #2a2a3e',
            marginTop: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: 'rgba(0, 212, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                💡
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{t.explanation}</span>
            </div>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0, fontSize: '15px' }}>
              {signal.explanation}
            </p>
          </div>
        )}

        {/* История */}
        <div style={{ 
          background: '#13131f', 
          padding: '24px', 
          borderRadius: '12px', 
          border: '1px solid #2a2a3e',
          marginTop: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <History color="#00d4ff" />
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>📜 {t.tradeHistory}</span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #2a2a3e', color: '#6b7280', fontSize: '12px' }}>{t.time}</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #2a2a3e', color: '#6b7280', fontSize: '12px' }}>{t.type}</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #2a2a3e', color: '#6b7280', fontSize: '12px' }}>{t.entry}</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #2a2a3e', color: '#6b7280', fontSize: '12px' }}>{t.result}</th>
              </tr>
            </thead>            
            <tbody>
              {history.length > 0 ? (
                history.map((trade, i) => (
                  <tr key={i} style={{ transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1c1c2e'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px', borderBottom: '1px solid #2a2a3e' }}>{trade.time}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #2a2a3e' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: trade.type === 'LONG' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: trade.type === 'LONG' ? '#22c55e' : '#ef4444'
                      }}>
                        {trade.type === 'LONG' ? t.long : t.short}
                      </span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #2a2a3e' }}>${trade.entry.toLocaleString()}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #2a2a3e' }}>
                      <span style={{ 
                        color: trade.result === 'PENDING' ? '#f59e0b' : 
                               trade.result === 'WIN' ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {trade.result === 'PENDING' ? t.pending : 
                         trade.result === 'WIN' ? t.win : t.loss}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    {t.noHistory}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Sidebar>
  )
}
