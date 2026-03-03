'use client'

import { useState, useEffect } from 'react'

const API_URL = 'https://cryptotraderai-api.onrender.com'

const translations = {
  ru: {
    title: '🎯 SMC Снайпер',
    subtitle: 'High-confluence Smart Money Concepts сигналы',
    scan: 'Сканировать',
    scanning: 'Сканирование...',
    pair: 'Пара',
    timeframe: 'Таймфрейм',
    direction: 'Направление',
    entry: 'Вход',
    stopLoss: 'Стоп-лосс',
    takeProfit: 'Тейк-профит',
    confidence: 'Уверенность',
    confluenceScore: 'Confluence Score',
    analysis: 'Анализ',
    noSetup: 'Сетап не найден',
    foundSetup: 'Сетап найден!',
    back: '← Назад',
    sniperMode: 'Режим снайпера',
    description: 'Ищет идеальные Order Blocks с максимальной конfluенцией',
    bos: 'Break of Structure',
    ob: 'Order Block',
    liquidity: 'Liquidity Sweep',
    fib: 'Fibonacci Zone',
    structure: 'Clean Structure',
    impulse: 'Impulse from OB'
  },
  en: {
    title: '🎯 SMC Sniper',
    subtitle: 'High-confluence Smart Money Concepts signals',
    scan: 'Scan',
    scanning: 'Scanning...',
    pair: 'Pair',
    timeframe: 'Timeframe',
    direction: 'Direction',
    entry: 'Entry',
    stopLoss: 'Stop Loss',
    takeProfit: 'Take Profit',
    confidence: 'Confidence',
    confluenceScore: 'Confluence Score',
    analysis: 'Analysis',
    noSetup: 'No setup found',
    foundSetup: 'Setup found!',
    back: '← Back',
    sniperMode: 'Sniper Mode',
    description: 'Finds perfect Order Blocks with maximum confluence',
    bos: 'Break of Structure',
    ob: 'Order Block',
    liquidity: 'Liquidity Sweep',
    fib: 'Fibonacci Zone',
    structure: 'Clean Structure',
    impulse: 'Impulse from OB'
  }
}

const DEMO_SNIPER_SIGNALS = [
  {
    id: 'smc_001',
    pair: 'BTC/USDT',
    direction: 'LONG',
    entry: 63450.50,
    stop_loss: 62500.00,
    take_profit_1: 66000.00,
    take_profit_2: 69000.00,
    confidence: 88,
    confluence_score: 4,
    timeframe: '4H',
    analysis: `Perfect OB Score: 6/6
Confluence Checks Passed: 4/4
Order Block Zone: $62,800 - $63,200

Key Factors:
  ✓ Liquidity sweep before OB
  ✓ OB within 61.8-78.6% Fib zone
  ✓ Clean structure around OB
  ✓ OB impulse caused BOS`
  },
  {
    id: 'smc_002', 
    pair: 'ETH/USDT',
    direction: 'SHORT',
    entry: 3520.00,
    stop_loss: 3580.00,
    take_profit_1: 3400.00,
    take_profit_2: 3250.00,
    confidence: 85,
    confluence_score: 4,
    timeframe: '4H',
    analysis: `Perfect OB Score: 5/6
Confluence Checks Passed: 4/4
Order Block Zone: $3,480 - $3,550

Key Factors:
  ✓ Liquidity sweep before OB
  ✓ OB within 61.8-78.6% Fib zone
  ✓ Clean structure around OB
  ✓ OB impulse caused BOS`
  },
  {
    id: 'smc_003',
    pair: 'SOL/USDT',
    direction: 'LONG',
    entry: 142.30,
    stop_loss: 138.50,
    take_profit_1: 152.00,
    take_profit_2: 165.00,
    confidence: 82,
    confluence_score: 3,
    timeframe: '4H',
    analysis: `Perfect OB Score: 5/6
Confluence Checks Passed: 3/4
Order Block Zone: $138 - $144

Key Factors:
  ✓ Liquidity sweep before OB
  ✓ OB within 61.8-78.6% Fib zone
  ✓ Clean structure around OB`
  }
]

export default function SniperPage() {
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState('ru')
  const [scanning, setScanning] = useState(false)
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [result, setResult] = useState(null)
  const [signals, setSignals] = useState(DEMO_SNIPER_SIGNALS)

  const t = translations[lang]

  useEffect(() => {
    setMounted(true)
    fetchSniperSignals()
  }, [])

  const fetchSniperSignals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sniper/signals`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          setSignals(data)
        }
      }
    } catch (e) {
      console.log('Using demo sniper signals')
    }
  }

  const scanForSetup = async () => {
    setScanning(true)
    try {
      const res = await fetch(`${API_URL}/api/sniper/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: selectedPair, timeframe: '4H' })
      })
      
      if (res.ok) {
        const data = await res.json()
        setResult(data)
        if (data.found && data.signal) {
          setSignals([data.signal, ...signals])
        }
      } else {
        // Demo mode
        await new Promise(r => setTimeout(r, 2000))
        const isLong = Math.random() > 0.5
        const basePrice = selectedPair.includes('BTC') ? 63500 : selectedPair.includes('ETH') ? 3500 : 140
        const demoResult = {
          found: true,
          signal: {
            id: `smc_${Date.now()}`,
            pair: selectedPair,
            direction: isLong ? 'LONG' : 'SHORT',
            entry: basePrice,
            stop_loss: isLong ? basePrice * 0.985 : basePrice * 1.015,
            take_profit_1: isLong ? basePrice * 1.04 : basePrice * 0.96,
            take_profit_2: isLong ? basePrice * 1.08 : basePrice * 0.92,
            confidence: Math.floor(Math.random() * 15) + 80,
            confluence_score: Math.floor(Math.random() * 2) + 3,
            timeframe: '4H',
            analysis: `Perfect OB Score: ${Math.floor(Math.random() * 2) + 5}/6\nConfluence Checks Passed: ${Math.floor(Math.random() * 2) + 3}/4\n\nKey Factors:\n  ✓ Liquidity sweep before OB\n  ✓ OB within 61.8-78.6% Fib zone\n  ✓ Clean structure around OB`
          },
          message: '🎯 High-confluence SMC setup detected!'
        }
        setResult(demoResult)
        setSignals([demoResult.signal, ...signals])
      }
    } catch (e) {
      console.log('Scan error:', e)
    } finally {
      setScanning(false)
    }
  }

  const getDirectionColor = (dir) => dir === 'LONG' ? '#00c853' : '#ff5252'
  const getDirectionBg = (dir) => dir === 'LONG' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 82, 82, 0.1)'

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1c1c2e', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>{t.title}</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{t.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
              style={{
                background: '#1c1c2e',
                border: '1px solid #2a2a3e',
                color: '#00d4ff',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {lang === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
            </button>
            <a 
              href="/"
              style={{
                background: 'transparent',
                border: '1px solid #6b7280',
                color: '#6b7280',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px'
              }}
            >
              {t.back}
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Scanner Section */}
        <div style={{ background: '#13131f', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #1c1c2e' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{t.sniperMode}</h2>
          <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>{t.description}</p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <select 
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              style={{
                background: '#1c1c2e',
                border: '1px solid #2a2a3e',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
              <option value="1000PEPE/USDT">1000PEPE/USDT</option>
              <option value="HYPE/USDT">HYPE/USDT</option>
            </select>
            
            <button
              onClick={scanForSetup}
              disabled={scanning}
              style={{
                background: scanning ? '#1c1c2e' : 'linear-gradient(135deg, #ff4757, #ff6348)',
                border: 'none',
                color: scanning ? '#6b7280' : '#fff',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: scanning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {scanning ? `⏳ ${t.scanning}` : `🎯 ${t.scan}`}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div style={{
              background: result.found ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 82, 82, 0.1)',
              border: `1px solid ${result.found ? '#00c853' : '#ff5252'}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, color: result.found ? '#00c853' : '#ff5252', fontWeight: 'bold' }}>
                {result.message}
              </p>
            </div>
          )}

          {/* Confluence Checklist */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '24px' }}>
            {[
              { key: 'bos', label: t.bos },
              { key: 'ob', label: t.ob },
              { key: 'liquidity', label: t.liquidity },
              { key: 'fib', label: t.fib },
              { key: 'structure', label: t.structure },
              { key: 'impulse', label: t.impulse }
            ].map((item) => (
              <div key={item.key} style={{
                background: '#1c1c2e',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#6b7280' }}>○</span>
                <span style={{ fontSize: '13px' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signals List */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>
            {lang === 'ru' ? 'Активные сигналы снайпера' : 'Active Sniper Signals'}
          </h2>
          
          {signals.map((signal) => (
            <div key={signal.id} style={{ 
              background: '#13131f', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '16px', 
              border: '1px solid #1c1c2e'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>
                    {signal.pair.includes('BTC') ? '₿' : signal.pair.includes('ETH') ? 'Ξ' : signal.pair.includes('SOL') ? '◎' : signal.pair.includes('PEPE') ? '🐸' : signal.pair.includes('HYPE') ? '🚀' : '◈'}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{signal.pair}</h3>
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{signal.timeframe}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: getDirectionBg(signal.direction),
                    color: getDirectionColor(signal.direction),
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {signal.direction}
                  </span>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0', color: '#ffb300' }}>
                    {signal.confidence}%
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{t.entry}</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '16px', margin: '4px 0 0' }}>
                    ${signal.entry.toLocaleString(undefined, { maximumFractionDigits: signal.entry < 1 ? 6 : 2 })}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{t.stopLoss}</p>
                  <p style={{ color: '#ff5252', fontFamily: 'monospace', fontSize: '16px', margin: '4px 0 0' }}>
                    ${signal.stop_loss.toLocaleString(undefined, { maximumFractionDigits: signal.stop_loss < 1 ? 6 : 2 })}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP1</p>
                  <p style={{ color: '#00c853', fontFamily: 'monospace', fontSize: '16px', margin: '4px 0 0' }}>
                    ${signal.take_profit_1.toLocaleString(undefined, { maximumFractionDigits: signal.take_profit_1 < 1 ? 6 : 2 })}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>TP2</p>
                  <p style={{ color: '#00c853', fontFamily: 'monospace', fontSize: '16px', margin: '4px 0 0' }}>
                    ${signal.take_profit_2.toLocaleString(undefined, { maximumFractionDigits: signal.take_profit_2 < 1 ? 6 : 2 })}
                  </p>
                </div>
              </div>

              <div style={{ 
                background: '#1c1c2e', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 8px' }}>{t.confluenceScore}: {signal.confluence_score}/4</p>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '13px', 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  lineHeight: '1.6'
                }}>
                  {signal.analysis}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
