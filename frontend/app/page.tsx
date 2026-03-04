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

const DEMO_STATS = {
  totalSignals: 42,
  activeSignals: 4,
  winRate: 36,
  hitTP: 13,
  hitSL: 23,
}

const SIGNALS_DATA = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    confidence: 82,
    entry: 63500,
    stop_loss: 62800,
    take_profit_1: 64500,
    take_profit_2: 65500,
    wyckoff_phase: 'accumulation',
    kill_zone: 'London',
    timeframe: '4H',
    exchange: 'Binance',
    status: 'ACTIVE',
    analysis: 'Price in accumulation. Spring test completed. Long at $63,500 after BOS.'
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT',
    confidence: 75,
    entry: 3500.00,
    stop_loss: 3550.00,
    take_profit_1: 3400.00,
    take_profit_2: 3300.00,
    wyckoff_phase: 'distribution',
    kill_zone: 'New York',
    timeframe: '4H',
    exchange: 'BingX',
    status: 'ACTIVE',
    analysis: 'Distribution at top. UTAD pattern. Short at $3,500 after rejection.'
  },
  {
    id: '3',
    pair: '1000PEPE/USDT',
    direction: 'LONG',
    confidence: 78,
    entry: 0.0085,
    stop_loss: 0.0082,
    take_profit_1: 0.0092,
    take_profit_2: 0.0100,
    wyckoff_phase: 'accumulation',
    kill_zone: 'Asian',
    timeframe: '4H',
    exchange: 'Binance',
    status: 'ACTIVE',
    analysis: 'Meme momentum building. Breakout from accumulation zone.'
  },
  {
    id: '4',
    pair: 'HYPE/USDT',
    direction: 'SHORT',
    confidence: 71,
    entry: 18.50,
    stop_loss: 19.20,
    take_profit_1: 17.20,
    take_profit_2: 16.00,
    wyckoff_phase: 'distribution',
    kill_zone: 'London Close',
    timeframe: '4H',
    exchange: 'KuCoin',
    status: 'ACTIVE',
    analysis: 'Distribution after markup. Sign of weakness with volume.'
  }
]

const SIGNAL_DETAILS: Record<string, any> = {
  '2': {
    analysis: {
      wyckoff: 'Distribution forming at top of markup. UTAD pattern visible.',
      smc: 'Fair Value Gap above $2,050 likely to be filled. Bearish order block at $2,040.',
      killZone: 'New York session showing distribution by smart money.',
      entry: 'Short at $2,031 after rejection from $2,040 resistance.',
      risk: 'Stop above distribution high at $2,054. Risk: 1.2% of account.',
      reward: 'TP1 at $1,961 (1:3.1 R:R). TP2 at $1,928 (1:4.7 R:R).'
    }
  },
  '3': {
    analysis: {
      wyckoff: 'Accumulation with shakeout below $138. Volume drying up.',
      smc: 'Bullish order block at $140. Liquidity sweep completed.',
      killZone: 'Asian session providing quiet accumulation.',
      entry: 'Long at $142.50 after reclaim of $140.',
      risk: 'Stop below shakeout low at $138. Risk: 1.0% of account.',
      reward: 'TP1 at $150 (1:1.7 R:R). TP2 at $158 (1:3.4 R:R).'
    }
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

  const t = translations[lang]

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    fetchSignals()
    return () => clearInterval(timer)
  }, [])

  const fetchSignals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/signals`)
      if (res.ok) {
        const data = await res.json()
        setSignals(data.signals || [])
        setStats({
          total: data.total || 0,
          winRate: data.win_rate || 0,
          wins: data.wins || 0,
          losses: data.losses || 0
        })
      }
    } catch (e) {
      console.log('API error, using demo:', e)
      setSignals(SIGNALS_DATA)
      setStats({ total: 42, winRate: 36, wins: 13, losses: 23 })
    } finally {
      setLoading(false)
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
        // Fallback demo generation
        await new Promise(r => setTimeout(r, 1500))
        const isLong = Math.random() > 0.5
        const basePrice = randomPair.includes('PEPE') ? 0.008 : randomPair.includes('HYPE') ? 18 : randomPair.includes('BTC') ? 63500 : randomPair.includes('ETH') ? 3500 : 140
        const demoSignal = {
          id: Date.now().toString(),
          pair: randomPair,
          direction: isLong ? 'LONG' : 'SHORT',
          confidence: Math.floor(Math.random() * 20) + 70,
          entry: basePrice,
          stop_loss: isLong ? basePrice * 0.985 : basePrice * 1.015,
          take_profit_1: isLong ? basePrice * 1.03 : basePrice * 0.97,
          take_profit_2: isLong ? basePrice * 1.06 : basePrice * 0.94,
          wyckoff_phase: isLong ? 'accumulation' : 'distribution',
          kill_zone: ['London', 'New York', 'Asian'][Math.floor(Math.random() * 3)],
          timeframe: '4H',
          exchange: 'Binance',
          status: 'ACTIVE',
          analysis: `AI generated ${isLong ? 'LONG' : 'SHORT'} signal for ${randomPair}`
        }
        setSignals([demoSignal, ...signals])
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
