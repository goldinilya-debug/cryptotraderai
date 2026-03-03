'use client'

import { useState, useEffect } from 'react'

// Translations
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
    win: 'Победа',
    loss: 'Поражение',
    won: 'Победа',
    lost: 'Поражение',
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
    active: 'Активно',
    loading: 'Загрузка...'
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
    win: 'WIN',
    loss: 'LOSS',
    won: 'WON',
    lost: 'LOST',
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
    active: 'Active',
    loading: 'Loading...'
  }
}

// Demo данные
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
    stopLoss: 62800,
    takeProfit1: 64500,
    takeProfit2: 65500,
    wyckoffPhase: 'accumulation',
    killZone: 'London',
    timeframe: '4H',
    exchange: 'Binance',
    status: 'ACTIVE',
    analysis: {
      wyckoff: 'Price is in accumulation phase after markdown. Spring test completed with volume confirmation.',
      smc: 'Liquidity sweep below $62,800 followed by bullish engulfing. Order block at $63,200 respected.',
      killZone: 'London Open provides high volatility window. Entry aligned with institutional flow.',
      entry: 'Long at $63,500 after BOS above $63,200 with volume expansion.',
      risk: 'Stop below accumulation low at $62,800. Risk: 1.1% of account.',
      reward: 'TP1 at $64,500 (1:1.4 R:R). TP2 at $65,500 (1:2.8 R:R).'
    }
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT',
    confidence: 75,
    entry: 2031.69,
    stopLoss: 2054.05,
    takeProfit1: 1961.62,
    takeProfit2: 1928.54,
    wyckoffPhase: 'markup',
    killZone: 'New York',
    timeframe: '4H',
    exchange: 'BingX',
    status: 'ACTIVE',
    analysis: {
      wyckoff: 'Distribution forming at top of markup. UTAD pattern visible.',
      smc: 'Fair Value Gap above $2,050 likely to be filled. Bearish order block at $2,040.',
      killZone: 'New York session showing distribution by smart money.',
      entry: 'Short at $2,031 after rejection from $2,040 resistance.',
      risk: 'Stop above distribution high at $2,054. Risk: 1.2% of account.',
      reward: 'TP1 at $1,961 (1:3.1 R:R). TP2 at $1,928 (1:4.7 R:R).'
    }
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    direction: 'LONG',
    confidence: 68,
    entry: 142.50,
    stopLoss: 138.00,
    takeProfit1: 150.00,
    takeProfit2: 158.00,
    wyckoffPhase: 'accumulation',
    killZone: 'Asian',
    timeframe: '4H',
    exchange: 'Binance',
    status: 'ACTIVE',
    analysis: {
      wyckoff: 'Accumulation with shakeout below $138. Volume drying up.',
      smc: 'Bullish order block at $140. Liquidity sweep completed.',
      killZone: 'Asian session providing quiet accumulation.',
      entry: 'Long at $142.50 after reclaim of $140.',
      risk: 'Stop below shakeout low at $138. Risk: 1.0% of account.',
      reward: 'TP1 at $150 (1:1.7 R:R). TP2 at $158 (1:3.4 R:R).'
    }
  },
  {
    id: '4',
    pair: 'AVAX/USDT',
    direction: 'SHORT',
    confidence: 71,
    entry: 38.20,
    stopLoss: 39.50,
    takeProfit1: 35.80,
    takeProfit2: 33.50,
    wyckoffPhase: 'distribution',
    killZone: 'London Close',
    timeframe: '4H',
    exchange: 'KuCoin',
    status: 'ACTIVE',
    analysis: {
      wyckoff: 'Distribution completed. Sign of weakness with volume.',
      smc: 'Break of structure below $38. Bearish FVG at $38.50.',
      killZone: 'London Close often brings reversals.',
      entry: 'Short at $38.20 on re-test of broken support.',
      risk: 'Stop above distribution zone at $39.50. Risk: 1.1%.',
      reward: 'TP1 at $35.80 (1:1.8 R:R). TP2 at $33.50 (1:3.6 R:R).'
    }
  }
]

const API_URL = 'https://cryptotraderai-api.onrender.com'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState('ru')
  const [signals, setSignals] = useState(SIGNALS_DATA)
  const [generating, setGenerating] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedSignal, setSelectedSignal] = useState<any>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const t = translations[lang as keyof typeof translations]

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const generateSignal = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1500))
    const demoSignal = {
      id: Date.now().toString(),
      pair: 'BTC/USDT',
      direction: Math.random() > 0.5 ? 'LONG' : 'SHORT',
      confidence: Math.floor(Math.random() * 20) + 70,
      entry: 63500,
      stopLoss: 62800,
      takeProfit1: 64500,
      takeProfit2: 65500,
      wyckoffPhase: 'accumulation',
      killZone: 'New York',
      timeframe: '4H',
      exchange: 'Binance',
      status: 'ACTIVE',
      analysis: {
        wyckoff: 'Accumulation phase with volume confirmation.',
        smc: 'Liquidity sweep completed.',
        killZone: 'New York session optimal.',
        entry: 'Entry after BOS.',
        risk: 'Stop below recent low.',
        reward: 'Multiple TP levels.'
      }
    }
    setSignals([demoSignal, ...signals])
    setGenerating(false)
  }

  const openAnalysis = (signal: any) => {
    setSelectedSignal(signal)
    setShowAnalysis(true)
  }

  const closeAnalysis = () => {
    setShowAnalysis(false)
    setSelectedSignal(null)
  }

  const submitFeedback = async (signalId: string, result: string) => {
    try {
      const res = await fetch(`${API_URL}/api/ml/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signal_id: signalId, 
          result: result,
          exit_price: 0,
          pnl_percent: 0
        })
      })
      if (res.ok) {
        alert(lang === 'ru' ? `✅ Сигнал отмечен как ${result === 'WIN' ? 'победа' : 'поражение'}!` : `✅ Signal marked as ${result}!`)
      }
    } catch (e) {
      // Fallback
    }
    setSignals(signals.map(s => s.id === signalId ? {...s, status: result} : s))
  }

  const getDirectionColor = (dir: string) => dir === 'LONG' ? '#00c853' : '#ff5252'
  const getDirectionBg = (dir: string) => dir === 'LONG' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 82, 82, 0.1)'
  const getPairIcon = (pair: string) => pair.includes('BTC') ? '₿' : pair.includes('ETH') ? 'Ξ' : pair.includes('SOL') ? '◎' : '◈'
  const calcRR = (entry: number, sl: number, tp: number) => ((tp - entry) / (entry - sl)).toFixed(1)

  const getKillZoneName = (kz: string) => {
    if (lang === 'ru') {
      if (kz === 'Asian') return 'Азиатская сессия'
      if (kz === 'London') return 'Лондонская сессия'
      if (kz === 'New York') return 'Нью-Йоркская сессия'
      if (kz === 'London Close') return 'Закрытие Лондона'
    }
    return kz
  }

  const getVolatilityLabel = (v: string) => {
    if (lang === 'ru') return v === 'High' ? 'Высокая' : 'Средняя'
    return v
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
      {/* Header */}
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
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>{t.totalSignals}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{DEMO_STATS.totalSignals}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{t.allTimeGenerated}</p>
          </div>
          <div style={{ background: 'rgba(0, 212, 255, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>{t.activeSignals}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00d4ff' }}>{signals.length}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{t.currentlyOpen}</p>
          </div>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>{t.winRate}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#ffb300' }}>{DEMO_STATS.winRate}%</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{DEMO_STATS.hitTP} {t.winsLosses.split(' / ')[0]} / {DEMO_STATS.hitSL} {t.winsLosses.split(' / ')[1]}</p>
          </div>
          <div style={{ background: '#13131f', padding: '16px', borderRadius: '12px', border: '1px solid #1c1c2e' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>{t.hitTP}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#00c853' }}>{DEMO_STATS.hitTP}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{t.takeProfitReached}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* Signals */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{t.activeSignalsTitle}</h2>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>{signals.length} {t.signals}</span>
            </div>
            
            {signals.map((signal) => (
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
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{signal.timeframe.toLowerCase()} • {signal.exchange.toLowerCase()}</p>
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
                  <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{t.entry}</p><p style={{ fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${signal.entry.toLocaleString()}</p></div>
                  <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{t.stopLoss}</p><p style={{ color: '#ff5252', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${signal.stopLoss.toLocaleString()}</p></div>
                  <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP1</p><p style={{ color: '#00c853', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${signal.takeProfit1.toLocaleString()}</p></div>
                  <div><p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP2</p><p style={{ color: '#00c853', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0' }}>${signal.takeProfit2.toLocaleString()}</p></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', paddingTop: '12px', borderTop: '1px solid #1c1c2e', alignItems: 'center' }}>
                  <span>Wyckoff: <strong style={{ color: '#fff' }}>{signal.wyckoffPhase}</strong> | KZ: <strong style={{ color: '#fff' }}>{getKillZoneName(signal.killZone)}</strong> | R:R <strong style={{ color: '#fff' }}>1:{calcRR(signal.entry, signal.stopLoss, signal.takeProfit1)}</strong> | <strong style={{ color: signal.status === 'WIN' ? '#00c853' : signal.status === 'LOSS' ? '#ff5252' : '#ffb300' }}>{signal.status === 'ACTIVE' ? (lang === 'ru' ? 'АКТИВЕН' : 'ACTIVE') : signal.status}</strong></span>
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
                        fontSize: '11px',
                        background: signal.status === 'WIN' ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 82, 82, 0.2)',
                        color: signal.status === 'WIN' ? '#00c853' : '#ff5252'
                      }}>
                        {signal.status === 'WIN' ? t.won : t.lost}
                      </span>
                    )}
                  </div>
                </div>
            ))}
          </div>

          {/* Sidebar */}
          <div>
            {/* Statistics -->
            <div style={{ background: "#13131f", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "1px solid #1c1c2e" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>📊 {lang === 'ru' ? 'Статистика' : 'Statistics'}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>{lang === 'ru' ? 'Win Rate' : 'Win Rate'}</span>
                <span style={{ color: "#00c853", fontWeight: "bold" }}>{DEMO_STATS.winRate}%</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#1c1c2e", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>{lang === 'ru' ? 'Побед' : 'Wins'}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#00c853" }}>{DEMO_STATS.hitTP}</p>
                </div>
                <div style={{ background: "#1c1c2e", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>{lang === 'ru' ? 'Поражений' : 'Losses'}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#ff5252" }}>{DEMO_STATS.hitSL}</p>
                </div>
              </div>
            </div>

            {/* Kill Zones */}
            <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #1c1c2e' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⏰ {t.killZoneStatus}
              </h3>
              
              {[
                { name: lang === 'ru' ? 'Азиатская сессия' : 'Asian Session', time: '20:00 - 22:00 EST', volatility: 'Medium', active: false },
                { name: lang === 'ru' ? 'Лондонская сессия' : 'London Session', time: '02:00 - 05:00 EST', volatility: 'High', active: false },
                { name: lang === 'ru' ? 'Нью-Йоркская сессия' : 'New York Session', time: '07:00 - 10:00 EST', volatility: 'High', active: true },
                { name: lang === 'ru' ? 'Закрытие Лондона' : 'London Close', time: '10:00 - 12:00 EST', volatility: 'Medium', active: false },
              ].map((zone, idx) => (
                <div key={idx} style={{ 
                  padding: '12px', 
                  marginBottom: '8px', 
                  borderRadius: '8px',
                  background: zone.active ? 'rgba(0, 212, 255, 0.1)' : '#1c1c2e',
                  border: zone.active ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: zone.active ? 'bold' : 'normal', color: zone.active ? '#00d4ff' : '#fff' }}>
                      {zone.name}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      background: zone.volatility === 'High' ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 179, 0, 0.2)',
                      color: zone.volatility === 'High' ? '#ff5252' : '#ffb300'
                    }}>
                      {getVolatilityLabel(zone.volatility)}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{zone.time}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#13131f', borderRadius: '12px', padding: '16px', border: '1px solid #1c1c2e' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>{t.quickActions}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={generateSignal}
                  disabled={generating}
                  style={{ 
                    padding: '12px', 
                    background: generating ? '#1c1c2e' : '#00d4ff', 
                    color: generating ? '#6b7280' : '#0a0a0f', 
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {generating ? `⏳ ${t.generating}` : `⚡ ${t.generateSignal}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Analysis Modal */}
      {showAnalysis && selectedSignal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        >
          <div style={{
            background: '#13131f',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid #1c1c2e'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #1c1c2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>📊 {t.signalAnalysis}</h2>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{selectedSignal?.pair} • {selectedSignal?.direction}</p>
              </div>
              <button 
                onClick={closeAnalysis}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                {t.close}
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>📈 {t.wyckoffAnalysis}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{selectedSignal?.analysis?.wyckoff}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>🎯 {t.smartMoneyConcepts}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{selectedSignal?.analysis?.smc}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>⏰ {t.killZoneTiming}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{selectedSignal?.analysis?.killZone}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>🚪 {t.entryLogic}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{selectedSignal?.analysis?.entry}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>⚠️ {t.riskManagement}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{selectedSignal?.analysis?.risk}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#00d4ff' }}>💰 {t.rewardTargets}</h3>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>{selectedSignal?.analysis?.reward}</p>
              </div>

              <div style={{ 
                background: 'rgba(0, 212, 255, 0.1)', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid rgba(0, 212, 255, 0.3)'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#00d4ff' }}>
                  ✨ {t.aiConfidence}: <strong>{selectedSignal?.confidence}%</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
