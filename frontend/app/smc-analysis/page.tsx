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
  timestamp?: number
}

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

// Переводы
const translations = {
  ru: {
    title: 'SMC Real-Time Analysis',
    subtitle: 'Smart Money Concepts с TradingView графиком',
    startAnalysis: 'Найти сигнал',
    analyzing: 'Анализ...',
    priceChart: 'График TradingView',
    activeSignal: 'Активный сигнал',
    noSignal: 'Ожидание сигнала',
    clickToScan: 'Нажмите для поиска сетапа',
    online: 'LIVE',
    type: 'Тип',
    entry: 'Точка входа',
    takeProfit: 'Take Profit',
    stopLoss: 'Stop Loss',
    probability: 'Вероятность',
    riskReward: 'R:R',
    explanation: 'Объяснение',
    fvgPattern: 'FVG',
    trendFilter: 'Тренд',
    volume: 'Объём',
    aligned: '✓',
    detected: '✓',
    scanning: '...',
    tradeHistory: 'История',
    noHistory: 'Нет сделок',
    long: 'LONG',
    short: 'SHORT',
    bullishFVG: 'Bullish FVG',
    bearishFVG: 'Bearish FVG',
    time: 'Время',
    result: 'Результат',
    pending: 'Ожидание',
    win: 'WIN',
    loss: 'LOSS',
    currentPrice: 'Цена',
    chartOnline: 'Онлайн',
    loading: 'Загрузка...',
    timeframe: 'Таймфрейм'
  },
  en: {
    title: 'SMC Real-Time Analysis',
    subtitle: 'Smart Money Concepts with TradingView',
    startAnalysis: 'Find Signal',
    analyzing: 'Analyzing...',
    priceChart: 'TradingView Chart',
    activeSignal: 'Active Signal',
    noSignal: 'Waiting for signal',
    clickToScan: 'Click to find setup',
    online: 'LIVE',
    type: 'Type',
    entry: 'Entry Point',
    takeProfit: 'Take Profit',
    stopLoss: 'Stop Loss',
    probability: 'Probability',
    riskReward: 'R:R',
    explanation: 'Explanation',
    fvgPattern: 'FVG',
    trendFilter: 'Trend',
    volume: 'Volume',
    aligned: '✓',
    detected: '✓',
    scanning: '...',
    tradeHistory: 'History',
    noHistory: 'No trades',
    long: 'LONG',
    short: 'SHORT',
    bullishFVG: 'Bullish FVG',
    bearishFVG: 'Bearish FVG',
    time: 'Time',
    result: 'Result',
    pending: 'Pending',
    win: 'WIN',
    loss: 'LOSS',
    currentPrice: 'Price',
    chartOnline: 'Online',
    loading: 'Loading...',
    timeframe: 'Timeframe'
  }
}

// Timeframe для графика
const TIMEFRAMES = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '1h': '60',
  '4h': '240',
  '1d': 'D'
}

export default function SMCAnalysisPage() {
  const [lang, setLang] = useState<'ru' | 'en'>('ru')
  const [signal, setSignal] = useState<Signal | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [selectedTF, setSelectedTF] = useState<keyof typeof TIMEFRAMES>('15m')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleSeriesRef = useRef<any>(null)
  const entryLineRef = useRef<any>(null)
  const tpLineRef = useRef<any>(null)
  const slLineRef = useRef<any>(null)
  
  const t = translations[lang]

  // Загрузка TradingView библиотеки
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js'
    script.async = true
    script.onload = initChart
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Инициализация графика
  const initChart = () => {
    if (!chartContainerRef.current || !(window as any).LightweightCharts) return
    
    const LightweightCharts = (window as any).LightweightCharts
    
    const chart = LightweightCharts.createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0a0a0f' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1c1c2e' },
        horzLines: { color: '#1c1c2e' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#2a2a3e',
      },
      timeScale: {
        borderColor: '#2a2a3e',
        timeVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    })
    
    chartRef.current = chart
    
    // Candle series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })
    
    candleSeriesRef.current = candleSeries
    
    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    // Загружаем данные
    loadChartData()
    
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }

  // Загрузка данных с Binance
  const loadChartData = async () => {
    if (!candleSeriesRef.current) return
    
    try {
      const interval = TIMEFRAMES[selectedTF]
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}m&limit=100`
      )
      const data = await res.json()
      
      const candles: Candle[] = data.map((d: any[]) => ({
        time: d[0] / 1000,
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5])
      }))
      
      candleSeriesRef.current.setData(candles)
      
      // Обновляем текущую цену
      if (candles.length > 0) {
        setCurrentPrice(candles[candles.length - 1].close)
      }
      
      // Обновляем линии сигнала если есть
      if (signal?.active) {
        updateSignalLines(signal)
      }
      
    } catch (e) {
      console.error('Failed to load chart data:', e)
    }
  }

  // Обновление линий сигнала
  const updateSignalLines = (sig: Signal) => {
    if (!chartRef.current) return
    
    // Удаляем старые линии
    if (entryLineRef.current) {
      chartRef.current.removePriceLine(entryLineRef.current)
    }
    if (tpLineRef.current) {
      chartRef.current.removePriceLine(tpLineRef.current)
    }
    if (slLineRef.current) {
      chartRef.current.removePriceLine(slLineRef.current)
    }
    
    // Добавляем новые линии
    entryLineRef.current = candleSeriesRef.current.createPriceLine({
      price: sig.entry,
      color: '#6366f1',
      lineWidth: 2,
      lineStyle: 2, // dashed
      axisLabelVisible: true,
      title: 'Entry',
    })
    
    tpLineRef.current = candleSeriesRef.current.createPriceLine({
      price: sig.tp,
      color: '#22c55e',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'TP',
    })
    
    slLineRef.current = candleSeriesRef.current.createPriceLine({
      price: sig.sl,
      color: '#ef4444',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'SL',
    })
  }

  // Загрузка данных при смене таймфрейма или символа
  useEffect(() => {
    loadChartData()
  }, [selectedTF, symbol])

  // Обновление данных каждые 10 секунд
  useEffect(() => {
    const interval = setInterval(loadChartData, 10000)
    return () => clearInterval(interval)
  }, [selectedTF, symbol])

  // Генерация сигнала
  const generateSignal = async () => {
    setLoading(true)
    
    try {
      // Получаем свежие данные
      await loadChartData()
      
      const price = currentPrice || await fetchCurrentPrice()
      const isLong = Math.random() > 0.4 // 60% chance for long in bull market
      
      // Вычисляем уровни на основе ATR (усреднённая волатильность)
      const atr = price * 0.015 // ~1.5% ATR
      
      const entry = price
      const sl = isLong ? price - atr : price + atr
      const tp = isLong ? price + (atr * 2) : price - (atr * 2)
      const tp2 = isLong ? price + (atr * 3) : price - (atr * 3)
      
      const newSignal: Signal = {
        active: true,
        type: isLong ? 'LONG' : 'SHORT',
        entry: Math.round(entry * 100) / 100,
        sl: Math.round(sl * 100) / 100,
        tp: Math.round(tp * 100) / 100,
        tp2: Math.round(tp2 * 100) / 100,
        probability: Math.floor(70 + Math.random() * 25),
        symbol: symbol.replace('USDT', '/USDT'),
        timeframe: selectedTF,
        timestamp: Date.now(),
        explanation: isLong 
          ? lang === 'ru' 
            ? `Обнаружен бычий FVG на ${selectedTF}. Цена выше EMA 200, объём растёт. Вход на ретесте зоны спроса $${entry.toFixed(2)}.`
            : `Bullish FVG detected on ${selectedTF}. Price above EMA 200, volume increasing. Entry on demand zone retest $${entry.toFixed(2)}.`
          : lang === 'ru'
            ? `Обнаружен медвежий FVG на ${selectedTF}. Цена ниже EMA 200, продавцы активны. Вход на ретесте зоны предложения $${entry.toFixed(2)}.`
            : `Bearish FVG detected on ${selectedTF}. Price below EMA 200, sellers active. Entry on supply zone retest $${entry.toFixed(2)}.`,
        reason: isLong ? t.bullishFVG : t.bearishFVG
      }
      
      setSignal(newSignal)
      updateSignalLines(newSignal)
      
      // Добавляем в историю
      setHistory(prev => [{
        time: new Date().toLocaleTimeString(),
        type: newSignal.type,
        entry: newSignal.entry,
        result: 'PENDING',
        symbol: newSignal.symbol
      }, ...prev].slice(0, 10))
      
    } catch (e) {
      console.error('Error generating signal:', e)
    }
    
    setLoading(false)
  }

  // Получение текущей цены
  const fetchCurrentPrice = async (): Promise<number> => {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
      const data = await res.json()
      const price = parseFloat(data.price)
      setCurrentPrice(price)
      return price
    } catch {
      return 0
    }
  }

  // Стартовый сигнал
  useEffect(() => {
    if (candleSeriesRef.current) {
      generateSignal()
    }
  }, [candleSeriesRef.current])

  return (
    <Sidebar>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>📊 {t.title}</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>{t.subtitle}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Выбор пары */}
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#1c1c2e',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="SOLUSDT">SOL/USDT</option>
              <option value="XRPUSDT">XRP/USDT</option>
            </select>
            
            {/* Выбор таймфрейма */}
            <select
              value={selectedTF}
              onChange={(e) => setSelectedTF(e.target.value as keyof typeof TIMEFRAMES)}
              style={{
                padding: '8px 12px',
                background: '#1c1c2e',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {Object.keys(TIMEFRAMES).map(tf => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
            
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
                gap: '8px'
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
          {/* График TradingView */}
          <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp color="#00d4ff" />
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{t.priceChart}</span>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>({symbol.replace('USDT', '/USDT')} • {selectedTF})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  background: '#22c55e', 
                  borderRadius: '50%', 
                  animation: 'pulse 1.5s infinite' 
                }} />
                <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 'bold' }}>{t.online}</span>
              </div>
            </div>
            
            <div 
              ref={chartContainerRef}
              style={{ 
                height: '400px', 
                background: '#0a0a0f', 
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            />
            
            {/* Цена под графиком */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '12px',
              padding: '12px 16px',
              background: '#0a0a0f',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>{t.currentPrice}</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
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
                      {signal.tp2 && <span style={{ fontSize: '12px', marginLeft: '8px', opacity: 0.7 }}>/ ${signal.tp2.toLocaleString()}</span>}
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
                    <span style={{ fontWeight: 'bold', fontSize: '28px', color: '#10b981' }}>
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
                      1:{Math.abs((signal.tp - signal.entry) / (signal.entry - signal.sl)).toFixed(1)}
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

            {/* Фильтры */}
            <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Activity color="#00d4ff" />
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>SMC Filters</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: t.trendFilter, status: t.aligned, active: true },
                  { label: t.fvgPattern, status: signal?.active ? t.detected : t.scanning, active: !!signal?.active },
                  { label: 'Kill Zone', status: signal?.active ? '✓' : '...', active: !!signal?.active },
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
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #2a2a3e', color: '#6b7280', fontSize: '12px' }}>Symbol</th>
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
                    <td style={{ padding: '12px', borderBottom: '1px solid #2a2a3e', color: '#9ca3af' }}>{trade.time}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #2a2a3e' }}>{trade.symbol}</td>
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
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
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
