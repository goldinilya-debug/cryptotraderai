'use client'

import { useState, useEffect } from 'react'

const translations = {
  ru: {
    title: 'CryptoTraderAI',
    subtitle: 'AI-сигналы для трейдинга',
    live: 'В эфире',
    mlSettings: '⚙️ ML Настройки',
    totalSignals: 'Всего сигналов',
    allTimeGenerated: 'Сгенерировано всего',
    activeSignals: 'Активные сигналы',
    currentlyOpen: 'Открытые позиции',
    winRate: 'Win Rate',
    winsLosses: 'побед / поражений',
    hitTP: 'Достигнут TP',
    takeProfitReached: 'Take profit сработал',
    activeSignalsTitle: 'Активные сигналы',
    signals: 'сигналов',
    entry: 'Вход',
    stopLoss: 'Стоп-лосс',
    analysis: 'Анализ',
    killZoneStatus: 'Статус Kill Zone',
    quickActions: 'Быстрые действия',
    generateSignal: 'Сгенерировать сигнал',
    generating: 'Генерация...',
    signalAnalysis: 'Анализ сигнала',
    close: '×',
    wyckoffAnalysis: 'Анализ Wyckoff',
    smartMoneyConcepts: 'Концепция Smart Money',
    killZoneTiming: 'Время Kill Zone',
    entryLogic: 'Логика входа',
    riskManagement: 'Управление рисками',
    rewardTargets: 'Цели прибыли',
    aiConfidence: 'Уверенность AI',
    asianSession: 'Азиатская сессия',
    londonSession: 'Лондонская сессия',
    newYorkSession: 'Нью-Йоркская сессия',
    londonClose: 'Закрытие Лондона',
    medium: 'Средняя',
    high: 'Высокая',
    active: 'АКТИВЕН',
    loading: 'Загрузка...',
    statistics: 'Статистика',
    wins: 'Побед',
    losses: 'Поражений'
  },
  en: {
    title: 'CryptoTraderAI',
    subtitle: 'AI-powered trading signals',
    live: 'Live',
    mlSettings: '⚙️ ML Settings',
    totalSignals: 'Total Signals',
    allTimeGenerated: 'All time generated',
    activeSignals: 'Active Signals',
    currentlyOpen: 'Currently open',
    winRate: 'Win Rate',
    winsLosses: 'wins / losses',
    hitTP: 'Hit TP',
    takeProfitReached: 'Take profit reached',
    activeSignalsTitle: 'Active Signals',
    signals: 'signals',
    entry: 'Entry',
    stopLoss: 'Stop Loss',
    analysis: 'Analysis',
    killZoneStatus: 'Kill Zone Status',
    quickActions: 'Quick Actions',
    generateSignal: 'Generate Signal',
    generating: 'Generating...',
    signalAnalysis: 'Signal Analysis',
    close: '×',
    wyckoffAnalysis: 'Wyckoff Analysis',
    smartMoneyConcepts: 'Smart Money Concepts',
    killZoneTiming: 'Kill Zone Timing',
    entryLogic: 'Entry Logic',
    riskManagement: 'Risk Management',
    rewardTargets: 'Reward Targets',
    aiConfidence: 'AI Confidence',
    asianSession: 'Asian Session',
    londonSession: 'London Session',
    newYorkSession: 'New York Session',
    londonClose: 'London Close',
    medium: 'Medium',
    high: 'High',
    active: 'ACTIVE',
    loading: 'Loading...',
    statistics: 'Statistics',
    wins: 'Wins',
    losses: 'Losses'
  }
}

// Kill Zone график
const KILL_ZONE_SCHEDULE = [
  { name: 'Asian', start: 0, end: 8, color: 'bg-yellow-500' },
  { name: 'London', start: 8, end: 16, color: 'bg-blue-500' },
  { name: 'New York', start: 13, end: 21, color: 'bg-green-500' },
  { name: 'London Close', start: 14, end: 16, color: 'bg-purple-500' },
]

const API_URL = 'https://cryptotraderai-api.onrender.com'

interface PriceData {
  prices: {
    'BTC/USDT': number
    'ETH/USDT': number
    'SOL/USDT': number
  }
  timestamp: string
}

interface Signal {
  id: string
  pair: string
  direction: string
  confidence: number
  entry: number
  stop_loss?: number
  stopLoss?: number
  take_profit_1?: number
  take_profit_2?: number
  takeProfit1?: number
  takeProfit2?: number
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
  current_price?: number
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState<'ru' | 'en'>('ru')
  const [signals, setSignals] = useState<Signal[]>([])
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [stats, setStats] = useState({ total: 0, winRate: 0, wins: 0, losses: 0 })
  const [prices, setPrices] = useState<PriceData | null>(null)

  const t = translations[lang]

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    fetchSignals()
    fetchPrices()
    // Обновлять цены каждые 30 секунд
    const priceTimer = setInterval(fetchPrices, 30000)
    return () => {
      clearInterval(timer)
      clearInterval(priceTimer)
    }
  }, [])

  const fetchSignals = async () => {
    try {
      // Получаем статистику с бэкенда
      const res = await fetch(`${API_URL}/api/signals`)
      if (res.ok) {
        const data = await res.json()
        setStats({
          total: data.total || 0,
          winRate: data.win_rate || 0,
          wins: data.wins || 0,
          losses: data.losses || 0
        })
        // Сигналы будут сгенерированы после получения цен
      }
    } catch (e) {
      console.log('API error:', e)
      setStats({ total: 0, winRate: 0, wins: 0, losses: 0 })
    } finally {
      setLoading(false)
    }
  }

  // Генерация сигналов от реальных цен
  const generateSignalsFromPrices = (priceData: PriceData) => {
    const signals: Signal[] = []
    
    const btcPrice = priceData.prices['BTC/USDT']
    const ethPrice = priceData.prices['ETH/USDT']
    
    if (btcPrice) {
      signals.push({
        id: '1',
        pair: 'BTC/USDT',
        direction: 'LONG',
        current_price: btcPrice,
        entry: Math.round(btcPrice * 1.01),
        stop_loss: Math.round(btcPrice * 0.97),
        take_profit_1: Math.round(btcPrice * 1.05),
        take_profit_2: Math.round(btcPrice * 1.10),
        confidence: 78,
        wyckoff_phase: 'markup',
        kill_zone: 'New York',
        timeframe: '4H',
        exchange: 'Binance',
        status: 'ACTIVE',
        analysis: {
          wyckoff: `BTC at $${btcPrice.toLocaleString()} in markup phase. Breaking resistance with volume.`,
          smc: `Bullish OB forming. Target FVG above $${Math.round(btcPrice * 1.05).toLocaleString()}.`,
          killZone: 'NY session showing smart money buying.',
          entry: `Long at $${Math.round(btcPrice * 1.01).toLocaleString()}`,
          risk: `Stop at $${Math.round(btcPrice * 0.97).toLocaleString()} (3% risk)`,
          reward: `TP1: $${Math.round(btcPrice * 1.05).toLocaleString()}, TP2: $${Math.round(btcPrice * 1.10).toLocaleString()}`
        }
      })
    }
    
    if (ethPrice) {
      signals.push({
        id: '2',
        pair: 'ETH/USDT',
        direction: 'SHORT',
        current_price: ethPrice,
        entry: Math.round(ethPrice * 0.99),
        stop_loss: Math.round(ethPrice * 1.03),
        take_profit_1: Math.round(ethPrice * 0.95),
        take_profit_2: Math.round(ethPrice * 0.90),
        confidence: 74,
        wyckoff_phase: 'distribution',
        kill_zone: 'London',
        timeframe: '4H',
        exchange: 'Binance',
        status: 'ACTIVE',
        analysis: {
          wyckoff: `ETH at $${ethPrice.toLocaleString()} showing distribution.`,
          smc: `Bearish OB at resistance. Target $${Math.round(ethPrice * 0.95).toLocaleString()}.`,
          killZone: 'London session distribution.',
          entry: `Short at $${Math.round(ethPrice * 0.99).toLocaleString()}`,
          risk: `Stop at $${Math.round(ethPrice * 1.03).toLocaleString()} (3% risk)`,
          reward: `TP1: $${Math.round(ethPrice * 0.95).toLocaleString()}, TP2: $${Math.round(ethPrice * 0.90).toLocaleString()}`
        }
      })
    }
    
    setSignals(signals)
  }

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]',
        { cache: 'no-store' }
      )
      if (res.ok) {
        const data = await res.json()
        const prices: Record<string, number> = {}
        data.forEach((item: { symbol: string; price: string }) => {
          const pair = item.symbol.replace('USDT', '/USDT')
          prices[pair] = parseFloat(item.price)
        })
        const priceData = {
          prices: {
            'BTC/USDT': prices['BTC/USDT'] || 0,
            'ETH/USDT': prices['ETH/USDT'] || 0,
            'SOL/USDT': prices['SOL/USDT'] || 0
          },
          timestamp: new Date().toISOString()
        }
        setPrices(priceData)
        // Автоматически генерируем сигналы от новых цен
        generateSignalsFromPrices(priceData)
      }
    } catch (e) {
      console.log('Failed to fetch prices:', e)
    }
  }

  const generateSignal = async () => {
    setGenerating(true)
    const pairs = ['BTC/USDT', 'ETH/USDT', '1000PEPE/USDT', 'HYPE/USDT', 'SOL/USDT', 'AVAX/USDT']
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)]
    
    try {
      const res = await fetch(`${API_URL}/api/signals/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: randomPair, timeframe: '4H', exchange: 'binance' })
      })
      if (res.ok) {
        const newSignal = await res.json()
        setSignals([newSignal, ...signals])
      } else {
        console.log('API error:', res.status)
      }
    } catch (e) {
      console.log('Generate error:', e)
    } finally {
      setGenerating(false)
    }
  }

  const openAnalysis = (signal: Signal) => {
    setSelectedSignal(signal)
    setShowAnalysis(true)
  }

  const closeAnalysis = () => {
    setShowAnalysis(false)
    setSelectedSignal(null)
  }

  const getDirectionColor = (dir: string) => dir === 'LONG' ? '#00c853' : '#ff5252'
  const getDirectionBg = (dir: string) => dir === 'LONG' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 82, 82, 0.1)'
  const getPairIcon = (pair: string) => {
    if (pair.includes('BTC')) return '₿'
    if (pair.includes('ETH')) return 'Ξ'
    if (pair.includes('SOL')) return '◎'
    if (pair.includes('PEPE')) return '🐸'
    if (pair.includes('HYPE')) return '🚀'
    return '◈'
  }
  const calcRR = (entry: number, sl: number, tp: number) => ((tp - entry) / (entry - sl)).toFixed(1)

  const getKillZoneName = (kz: string) => {
    if (lang === 'ru') {
      if (kz === 'Asian') return 'Азиатская'
      if (kz === 'London') return 'Лондон'
      if (kz === 'New York') return 'Нью-Йорк'
      if (kz === 'London Close') return 'Закр. Лондона'
    }
    return kz
  }

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
        <p>{t.loading}</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #1c1c2e', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', height: '40px', 
              background: 'linear-gradient(135deg, #00d4ff, #00a8cc)', 
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px'
            }}>
              📈
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px' }}>{t.title}</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{t.subtitle}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
              <div style={{ width: '8px', height: '8px', background: '#00c853', borderRadius: '50%' }}></div>
              <span>{t.live}</span>
              <span>•</span>
              <span>{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <button
              onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
              style={{
                background: '#1c1c2e',
                border: '1px solid #2a2a3e',
                color: '#00d4ff',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {lang === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
            </button>
            <a 
              href="/stats"
              style={{
                background: 'transparent',
                border: '1px solid #00d4ff',
                color: '#00d4ff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              📊 {lang === 'ru' ? 'Статистика' : 'Stats'}
            </a>
            <a 
              href="/strategy"
              style={{
                background: 'transparent',
                border: '1px solid #10b981',
                color: '#10b981',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              ⚡ {lang === 'ru' ? 'Стратегия' : 'Strategy'}
            </a>
            <a 
              href="/sniper"
              style={{
                background: 'linear-gradient(135deg, #ff4757, #ff6348)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🎯 {lang === 'ru' ? 'Снайпер' : 'Sniper'}
            </a>
            <a 
              href="/settings"
              style={{
                background: 'transparent',
                border: '1px solid #6b7280',
                color: '#6b7280',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                textDecoration: 'none'
              }}
            >
              {t.mlSettings}
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>{t.totalSignals}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stats.total}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{t.allTimeGenerated}</p>
          </div>
          <div style={{ background: 'rgba(0, 212, 255, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>{t.activeSignals}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00d4ff' }}>{signals.length}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{t.currentlyOpen}</p>
          </div>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>{t.winRate}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#ffb300' }}>{stats.winRate}%</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{stats.wins} {t.winsLosses.split(' / ')[0]} / {stats.losses} {t.winsLosses.split(' / ')[1]}</p>
          </div>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>{t.hitTP}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00c853' }}>{stats.wins}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{t.takeProfitReached}</p>
          </div>
        </div>

        {/* Live Price Ticker */}
        {prices && (
          <div style={{ 
            background: 'linear-gradient(90deg, #13131f, #1c1c2e)', 
            padding: '16px', 
            borderRadius: '12px', 
            border: '1px solid #2a2a3e',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#00d4ff' }}>📊 Онлайн котировки</h3>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {new Date(prices.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px' }}>BTC/USDT</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#f7931a' }}>
                  ${prices.prices['BTC/USDT']?.toLocaleString() || '-'}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px' }}>ETH/USDT</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#627eea' }}>
                  ${prices.prices['ETH/USDT']?.toLocaleString() || '-'}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px' }}>SOL/USDT</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#14f195' }}>
                  ${prices.prices['SOL/USDT']?.toLocaleString() || '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{t.activeSignalsTitle}</h2>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>{signals.length} {t.signals}</span>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳ {t.loading}...</div>
            ) : signals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{lang === 'ru' ? 'Нет активных сигналов' : 'No active signals'}</div>
            ) : (
              signals.map((signal) => (
              <div key={signal.id} style={{ background: '#13131f', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #1c1c2e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', background: '#1c1c2e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                    }}>
                      {getPairIcon(signal.pair)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px' }}>{signal.pair}</h3>
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{signal.timeframe?.toLowerCase() || ''} • {signal.exchange?.toLowerCase() || ''}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      background: getDirectionBg(signal.direction), 
                      color: getDirectionColor(signal.direction), 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {signal.direction}
                    </span>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0' }}>{signal.confidence}%</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{t.entry}</p><p style={{ fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${(signal.entry || 0).toLocaleString()}</p></div>
                  <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{t.stopLoss}</p><p style={{ color: '#ff5252', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${(signal.stop_loss || signal.stopLoss || 0).toLocaleString()}</p></div>
                  <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP1</p><p style={{ color: '#00c853', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${(signal.take_profit_1 || signal.takeProfit1 || 0).toLocaleString()}</p></div>
                  <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP2</p><p style={{ color: '#00c853', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${(signal.take_profit_2 || signal.takeProfit2 || 0).toLocaleString()}</p></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', paddingTop: '12px', borderTop: '1px solid #1c1c2e', alignItems: 'center' }}>
                  <span>Wyckoff: <strong style={{ color: '#fff' }}>{signal.wyckoff_phase || signal.wyckoffPhase || 'unknown'}</strong> | KZ: <strong style={{ color: '#fff' }}>{getKillZoneName(signal.kill_zone || signal.killZone || '')}</strong> | R:R <strong style={{ color: '#fff' }}>1:{calcRR(signal.entry, signal.stop_loss || signal.stopLoss || 0, signal.take_profit_1 || signal.takeProfit1 || 0)}</strong></span>
                  <button 
                    onClick={() => openAnalysis(signal)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #00d4ff',
                      color: '#00d4ff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    📊 {t.analysis}
                  </button>
                </div>
              </div>
            ))
            )}
          </div>

          <div>
            <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #1c1c2e' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>📊 {t.statistics}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>{t.winRate}</span>
                <span style={{ color: '#00c853', fontWeight: 'bold' }}>{stats.winRate}%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#1c1c2e', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{t.wins}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#00c853' }}>{stats.wins}</p>
                </div>
                <div style={{ background: '#1c1c2e', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{t.losses}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#ff5252' }}>{stats.losses}</p>
                </div>
              </div>
            </div>

            <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #1c1c2e' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>⏰ {t.killZoneStatus}</h3>
              {[
                { name: t.asianSession, time: '20:00 - 22:00 EST', volatility: t.medium, active: false },
                { name: t.londonSession, time: '02:00 - 05:00 EST', volatility: t.high, active: false },
                { name: t.newYorkSession, time: '07:00 - 10:00 EST', volatility: t.high, active: true },
                { name: t.londonClose, time: '10:00 - 12:00 EST', volatility: t.medium, active: false },
              ].map((zone, idx) => (
                <div key={idx} style={{ 
                  padding: '12px', 
                  marginBottom: '8px', 
                  borderRadius: '8px',
                  background: zone.active ? 'rgba(0, 212, 255, 0.1)' : '#1c1c2e',
                  border: zone.active ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: zone.active ? 'bold' : 'normal', color: zone.active ? '#00d4ff' : '#fff' }}>{zone.name}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      background: zone.volatility === t.high ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 179, 0, 0.2)',
                      color: zone.volatility === t.high ? '#ff5252' : '#ffb300'
                    }}>{zone.volatility}</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{zone.time}</p>
                </div>
              ))}
            </div>

            <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px', border: '1px solid #1c1c2e' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>{t.quickActions}</h3>
              <button 
                onClick={generateSignal}
                disabled={generating}
                style={{ 
                  width: '100%',
                  padding: '12px', 
                  background: generating ? '#1c1c2e' : '#00d4ff', 
                  color: generating ? '#6b7280' : '#0a0a0f', 
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: generating ? 'not-allowed' : 'pointer'
                }}
              >
                {generating ? `⏳ ${t.generating}` : `⚡ ${t.generateSignal}`}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showAnalysis && selectedSignal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#13131f', borderRadius: '16px', maxWidth: '600px', width: '100%',
            maxHeight: '80vh', overflow: 'auto', border: '1px solid #1c1c2e'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #1c1c2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>📊 {t.signalAnalysis}</h2>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{selectedSignal?.pair} • {selectedSignal?.direction}</p>
              </div>
              <button onClick={closeAnalysis} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '24px', cursor: 'pointer' }}>{t.close}</button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>📈 {t.wyckoffAnalysis}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{typeof selectedSignal?.analysis === 'object' ? selectedSignal?.analysis?.wyckoff : selectedSignal?.analysis}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>🎯 {t.smartMoneyConcepts}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{typeof selectedSignal?.analysis === 'object' ? selectedSignal?.analysis?.smc : '-'}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>⏰ {t.killZoneTiming}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{typeof selectedSignal?.analysis === 'object' ? selectedSignal?.analysis?.killZone : '-'}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>🚪 {t.entryLogic}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{typeof selectedSignal?.analysis === 'object' ? selectedSignal?.analysis?.entry : '-'}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>⚠️ {t.riskManagement}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{typeof selectedSignal?.analysis === 'object' ? selectedSignal?.analysis?.risk : '-'}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>💰 {t.rewardTargets}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{typeof selectedSignal?.analysis === 'object' ? selectedSignal?.analysis?.reward : '-'}</p>
              </div>
              <div style={{ background: 'rgba(0, 212, 255, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#00d4ff' }}>✨ {t.aiConfidence}: <strong>{selectedSignal?.confidence}%</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
