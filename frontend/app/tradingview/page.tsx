'use client'

import { useState, useEffect } from 'react'

const translations = {
  ru: {
    title: 'TradingView Интеграция',
    subtitle: 'Подключение алертов TradingView к CryptoTraderAI',
    overview: 'Обзор',
    overviewText: 'Интеграция позволяет автоматически исполнять сигналы из TradingView. Когда ваш индикатор генерирует сигнал, он мгновенно отправляется на торговый бот для открытия сделки.',
    webhookUrl: 'Webhook URL',
    webhookUrlText: 'Используйте этот URL в настройках алерта TradingView:',
    copy: 'Копировать',
    copied: 'Скопировано!',
    howToSetup: 'Как настроить',
    step1: 'Создайте стратегию в Pine Script',
    step1Text: 'Напишите свою стратегию или используйте готовую из библиотеки TradingView.',
    step2: 'Добавьте алерт',
    step2Text: 'Нажмите на кнопку "Alerts" и создайте новый алерт.',
    step3: 'Настройте сообщение',
    step3Text: 'В поле Message вставьте JSON с параметрами сигнала:',
    step4: 'Укажите Webhook URL',
    step4Text: 'Включите "Webhook URL" и вставьте URL из раздела выше.',
    step5: 'Добавьте секрет (опционально)',
    step5Text: 'Для безопасности добавьте заголовок X-Webhook-Secret.',
    pinescriptExamples: 'Примеры Pine Script',
    basicStrategy: 'Базовая стратегия',
    smaCrossover: 'SMA Crossover',
    rsiStrategy: 'RSI Стратегия',
    testIntegration: 'Тест интеграции',
    testWebhook: 'Отправить тестовый webhook',
    testing: 'Отправка...',
    status: 'Статус',
    active: 'Активен',
    inactive: 'Неактивен',
    lastSignal: 'Последний сигнал',
    noSignals: 'Сигналов пока не было',
    security: 'Безопасность',
    securityText: 'Настоятельно рекомендуется установить TRADINGVIEW_WEBHOOK_SECRET в переменных окружения для защиты от несанкционированных запросов.',
    format: 'Формат сообщения',
    backToHome: '← Назад на главную'
  },
  en: {
    title: 'TradingView Integration',
    subtitle: 'Connect TradingView alerts to CryptoTraderAI',
    overview: 'Overview',
    overviewText: 'This integration allows automatic execution of signals from TradingView. When your indicator generates a signal, it is instantly sent to the trading bot to open a trade.',
    webhookUrl: 'Webhook URL',
    webhookUrlText: 'Use this URL in your TradingView alert settings:',
    copy: 'Copy',
    copied: 'Copied!',
    howToSetup: 'How to Setup',
    step1: 'Create Pine Script Strategy',
    step1Text: 'Write your strategy or use one from TradingView library.',
    step2: 'Add Alert',
    step2Text: 'Click "Alerts" button and create a new alert.',
    step3: 'Configure Message',
    step3Text: 'In the Message field, insert JSON with signal parameters:',
    step4: 'Set Webhook URL',
    step4Text: 'Enable "Webhook URL" and paste the URL from the section above.',
    step5: 'Add Secret (Optional)',
    step5Text: 'For security, add X-Webhook-Secret header.',
    pinescriptExamples: 'Pine Script Examples',
    basicStrategy: 'Basic Strategy',
    smaCrossover: 'SMA Crossover',
    rsiStrategy: 'RSI Strategy',
    testIntegration: 'Test Integration',
    testWebhook: 'Send Test Webhook',
    testing: 'Sending...',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    lastSignal: 'Last Signal',
    noSignals: 'No signals yet',
    security: 'Security',
    securityText: 'It is strongly recommended to set TRADINGVIEW_WEBHOOK_SECRET in environment variables to protect against unauthorized requests.',
    format: 'Message Format',
    backToHome: '← Back to Home'
  }
}

const API_URL = 'https://cryptotraderai-api.onrender.com'

export default function TradingViewPage() {
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState<'ru' | 'en'>('ru')
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | undefined>(undefined)

  const t = translations[lang]
  const webhookUrl = `${API_URL}/webhook/tradingview`

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const testWebhook = async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch(`${API_URL}/webhook/tradingview/test`)
      const data = await response.json()
      setTestResult(data.status === 'ok' ? '✅ OK' : '❌ Error')
    } catch (e) {
      setTestResult('❌ Connection failed')
    } finally {
      setTesting(false)
    }
  }

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
        <p>Loading...</p>
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
              📊
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px' }}>{t.title}</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{t.subtitle}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              href="/"
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
              {t.backToHome}
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Overview */}
        <div style={{ 
          background: '#13131f', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          border: '1px solid #1c1c2e'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#00d4ff' }}>📡 {t.overview}</h2>
          <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
            {t.overviewText}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* Webhook URL */}
          <div>
            <div style={{ 
              background: '#13131f', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px',
              border: '1px solid #1c1c2e'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🔗 {t.webhookUrl}</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '12px' }}>
                {t.webhookUrlText}
              </p>
              <div style={{ 
                background: '#0a0a0f', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #2a2a3e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <code style={{ color: '#00d4ff', fontSize: '13px', wordBreak: 'break-all' }}>
                  {webhookUrl}
                </code>
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: copied ? '#00c853' : '#00d4ff',
                    color: '#0a0a0f',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </div>

            {/* Test Integration */}
            <div style={{ 
              background: '#13131f', 
              borderRadius: '12px', 
              padding: '24px',
              border: '1px solid #1c1c2e'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🧪 {t.testIntegration}</h3>
              <button
                onClick={testWebhook}
                disabled={testing}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: testing ? '#1c1c2e' : '#10b981',
                  color: testing ? '#6b7280' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: testing ? 'not-allowed' : 'pointer',
                  marginBottom: '12px'
                }}
              >
                {testing ? `⏳ ${t.testing}` : `📡 ${t.testWebhook}`}
              </button>
              {testResult && (
                <div style={{ 
                  textAlign: 'center',
                  padding: '12px',
                  background: testResult.includes('OK') ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 82, 82, 0.1)',
                  borderRadius: '6px',
                  color: testResult.includes('OK') ? '#00c853' : '#ff5252'
                }}>
                  {testResult}
                </div>
              )}
            </div>
          </div>

          {/* Setup Instructions */}
          <div style={{ 
            background: '#13131f', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #1c1c2e'
          }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px' }}>⚙️ {t.howToSetup}</h3>
            
            {[
              { num: '1', title: t.step1, text: t.step1Text },
              { num: '2', title: t.step2, text: t.step2Text },
              { num: '3', title: t.step3, text: t.step3Text, code: true },
              { num: '4', title: t.step4, text: t.step4Text },
              { num: '5', title: t.step5, text: t.step5Text },
            ].map((step) => (
              <div key={step.num} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  background: '#00d4ff', 
                  color: '#0a0a0f',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0
                }}>
                  {step.num}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{step.title}</h4>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px', lineHeight: '1.5' }}>
                    {step.text}
                  </p>
                  {step.code && (
                    <pre style={{ 
                      background: '#0a0a0f', 
                      padding: '12px', 
                      borderRadius: '6px',
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#00d4ff',
                      overflow: 'auto'
                    }}>
{`{
  "symbol": "BTCUSDT",
  "side": "buy",
  "price": {{close}},
  "strategy": "sma_crossover",
  "stop_loss": {{close}} * 0.98,
  "take_profit": {{close}} * 1.05
}`}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pine Script Examples */}
        <div style={{ 
          background: '#13131f', 
          borderRadius: '12px', 
          padding: '24px', 
          marginTop: '24px',
          border: '1px solid #1c1c2e'
        }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px' }}>📜 {t.pinescriptExamples}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* SMA Crossover */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#00d4ff' }}>{t.smaCrossover}</h4>
              <pre style={{ 
                background: '#0a0a0f', 
                padding: '16px', 
                borderRadius: '8px',
                fontSize: '12px',
                color: '#9ca3af',
                overflow: 'auto',
                lineHeight: '1.6'
              }}>
{`//@version=5
strategy("SMA Crossover", overlay=true)

// Inputs
fastLength = input.int(9, "Fast SMA")
slowLength = input.int(21, "Slow SMA")

// SMA Calculation
fastSMA = ta.sma(close, fastLength)
slowSMA = ta.sma(close, slowLength)

// Signals
longCondition = ta.crossover(fastSMA, slowSMA)
shortCondition = ta.crossunder(fastSMA, slowSMA)

// Plot
plot(fastSMA, color=color.new(#00d4ff, 0))
plot(slowSMA, color=color.new(#ff5252, 0))

// Strategy
if (longCondition)
    strategy.entry("Long", strategy.long)
    
if (shortCondition)
    strategy.close("Long")

// Alert message
alertMessage = '{"symbol": "' + syminfo.ticker + '", "side": "buy", "price": ' + str.tostring(close) + ', "strategy": "sma_crossover"}'

if (longCondition)
    alert(alertMessage, alert.freq_once_per_bar_close)`}
              </pre>
            </div>

            {/* RSI Strategy */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#00d4ff' }}>{t.rsiStrategy}</h4>
              <pre style={{ 
                background: '#0a0a0f', 
                padding: '16px', 
                borderRadius: '8px',
                fontSize: '12px',
                color: '#9ca3af',
                overflow: 'auto',
                lineHeight: '1.6'
              }}>
{`//@version=5
strategy("RSI Strategy", overlay=true)

// RSI Inputs
rsiLength = input.int(14, "RSI Length")
oversold = input.int(30, "Oversold")
overbought = input.int(70, "Overbought")

// RSI Calculation
rsi = ta.rsi(close, rsiLength)

// Signals
longCondition = ta.crossover(rsi, oversold)
shortCondition = ta.crossunder(rsi, overbought)

// Plot RSI
hline(overbought, "Overbought", color.red)
hline(oversold, "Oversold", color.green)
plot(rsi, "RSI", color=#00d4ff)

// Strategy
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.close("Long")

// Alert with dynamic SL/TP
sl = close * 0.97  // 3% stop loss
tp = close * 1.06  // 6% take profit

alertMessage = '{"symbol": "' + syminfo.ticker + '", "side": "buy", "price": ' + str.tostring(close) + ', "strategy": "rsi_oversold", "stop_loss": ' + str.tostring(sl) + ', "take_profit": ' + str.tostring(tp) + '}'

if (longCondition)
    alert(alertMessage, alert.freq_once_per_bar_close)`}
              </pre>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{ 
          background: 'rgba(255, 179, 0, 0.1)', 
          borderRadius: '12px', 
          padding: '20px', 
          marginTop: '24px',
          border: '1px solid rgba(255, 179, 0, 0.3)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#ffb300' }}>🔒 {t.security}</h4>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>
            {t.securityText}
          </p>
        </div>

        {/* Message Format Reference */}
        <div style={{ 
          background: '#13131f', 
          borderRadius: '12px', 
          padding: '24px', 
          marginTop: '24px',
          border: '1px solid #1c1c2e'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📋 {t.format}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6b7280' }}>Поле</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6b7280' }}>Тип</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6b7280' }}>Обязательное</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6b7280' }}>Описание</th>
              </tr>
            </thead>
            <tbody>
              {[
                { field: 'symbol', type: 'string', req: '✅', desc: 'Торговая пара (BTCUSDT)' },
                { field: 'side', type: 'string', req: '✅', desc: 'buy/sell или long/short' },
                { field: 'price', type: 'number', req: '✅', desc: 'Цена входа' },
                { field: 'strategy', type: 'string', req: '✅', desc: 'Название стратегии' },
                { field: 'stop_loss', type: 'number', req: '❌', desc: 'Стоп-лосс' },
                { field: 'take_profit', type: 'number', req: '❌', desc: 'Тейк-профит' },
                { field: 'quantity', type: 'number', req: '❌', desc: 'Количество' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1c1c2e' }}>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#00d4ff' }}>{row.field}</td>
                  <td style={{ padding: '12px 8px', color: '#9ca3af' }}>{row.type}</td>
                  <td style={{ padding: '12px 8px' }}>{row.req}</td>
                  <td style={{ padding: '12px 8px', color: '#9ca3af' }}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
