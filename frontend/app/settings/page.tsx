'use client'

import { useState, useEffect } from 'react'

const API_URL = 'https://cryptotraderai-api.onrender.com'

export default function MLSettings() {
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState('ru')
  const [settings, setSettings] = useState({
    min_confidence: 70,
    min_risk_reward: 1.5,
    max_daily_signals: 10,
    auto_adjust_confidence: true,
    learning_rate: 0.1,
    min_samples_for_ml: 5,
    preferred_pairs: ["BTC/USDT", "ETH/USDT"],
    avoid_low_performance: true,
    min_pair_win_rate: 40.0
  })
  const [learningStatus, setLearningStatus] = useState({
    learning_enabled: true,
    signals_collected: 0,
    learning_progress: 0,
    status: 'collecting_data'
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [buttonTest, setButtonTest] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchSettings()
    fetchLearningStatus()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ml/settings`)
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (e) {
      console.log('Using default settings')
    }
  }

  const fetchLearningStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ml/learning-status`)
      if (res.ok) {
        const data = await res.json()
        setLearningStatus(data)
      }
    } catch (e) {
      console.log('Using default status')
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/ml/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        setMessage('✅ Настройки сохранены!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (e) {
      setMessage('❌ Ошибка сохранения')
    }
    setSaving(false)
  }

  const resetSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ml/settings/reset`, {
        method: 'POST'
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        setMessage('✅ Настройки сброшены!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (e) {
      console.log('Reset failed')
    }
  }

  const toggleLearning = async () => {
    const endpoint = learningStatus.learning_enabled ? 'pause-learning' : 'resume-learning'
    const actionText = learningStatus.learning_enabled ? 'пауза' : 'возобновление'
    setButtonTest(`Отправка запроса: ${endpoint}...`)
    
    try {
      const res = await fetch(`${API_URL}/api/ml/${endpoint}`, {
        method: 'POST'
      })
      if (res.ok) {
        const data = await res.json()
        setButtonTest(`✅ Успех: ${data.message || actionText}`)
        fetchLearningStatus()
        setTimeout(() => setButtonTest(''), 3000)
      } else {
        setButtonTest(`❌ Ошибка: ${res.status}`)
        setTimeout(() => setButtonTest(''), 3000)
      }
    } catch (e) {
      setButtonTest('❌ Ошибка сети')
      setTimeout(() => setButtonTest(''), 3000)
    }
  }

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>🧠 ML Настройки</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>Настройте параметры машинного обучения</p>
        </div>

        {message && (
          <div style={{ 
            background: message.includes('✅') ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 82, 82, 0.2)',
            border: `1px solid ${message.includes('✅') ? '#00c853' : '#ff5252'}`,
            color: message.includes('✅') ? '#00c853' : '#ff5252',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            {message}
          </div>
        )}

        {/* Learning Status */}
        <div style={{ background: '#13131f', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #1c1c2e' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📊 Статус обучения</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>Сигналов собрано</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{learningStatus.signals_collected}</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>Прогресс обучения</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#00d4ff' }}>
                {learningStatus.learning_progress?.toFixed(0)}%
              </p>
            </div>
          </div>

          <div style={{ 
            height: '8px', 
            background: '#1c1c2e', 
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{
              width: `${learningStatus.learning_progress || 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00d4ff, #00c853)',
              transition: 'width 0.3s'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '12px',
              background: learningStatus.status === 'active' ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 179, 0, 0.2)',
              color: learningStatus.status === 'active' ? '#00c853' : '#ffb300'
            }}>
              {learningStatus.status === 'active' ? '🟢 Обучение активно' : '🟡 Сбор данных'}
            </span>
            
            <button
              onClick={toggleLearning}
              style={{
                padding: '8px 16px',
                background: learningStatus.learning_enabled ? '#ff5252' : '#00c853',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {learningStatus.learning_enabled ? '⏸️ Пауза' : '▶️ Старт'}
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <div style={{ background: '#13131f', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #1c1c2e' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>⚙️ Параметры</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Min Confidence */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Минимальная уверенность (%)
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={settings.min_confidence}
                onChange={(e) => setSettings({...settings, min_confidence: parseInt(e.target.value)})}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                <span>50%</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{settings.min_confidence}%</span>
                <span>95%</span>
              </div>
            </div>

            {/* Min Risk/Reward */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Минимальный Risk/Reward
              </label>
              <select
                value={settings.min_risk_reward}
                onChange={(e) => setSettings({...settings, min_risk_reward: parseFloat(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1c1c2e',
                  border: '1px solid #2a2a3e',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              >
                <option value={1.0}>1:1 (Консервативный)</option>
                <option value={1.5}>1:1.5 (Сбалансированный)</option>
                <option value={2.0}>1:2 (Агрессивный)</option>
                <option value={3.0}>1:3 (Высокий риск)</option>
              </select>
            </div>

            {/* Max Daily Signals */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Макс. сигналов в день
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.max_daily_signals}
                onChange={(e) => setSettings({...settings, max_daily_signals: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1c1c2e',
                  border: '1px solid #2a2a3e',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              />
            </div>

            {/* Min Pair Win Rate */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Мин. win rate для пары (%)
              </label>
              <input
                type="range"
                min="30"
                max="60"
                value={settings.min_pair_win_rate}
                onChange={(e) => setSettings({...settings, min_pair_win_rate: parseFloat(e.target.value)})}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                <span>30%</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{settings.min_pair_win_rate}%</span>
                <span>60%</span>
              </div>
            </div>

            {/* Toggle Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.auto_adjust_confidence}
                  onChange={(e) => setSettings({...settings, auto_adjust_confidence: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Авто-регулировка уверенности</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.avoid_low_performance}
                  onChange={(e) => setSettings({...settings, avoid_low_performance: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Избегать плохо-performing пар</span>
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={saveSettings}
            disabled={saving}
            style={{
              flex: 1,
              padding: '14px',
              background: saving ? '#1c1c2e' : '#00d4ff',
              color: saving ? '#6b7280' : '#0a0a0f',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {saving ? '💾 Сохранение...' : '💾 Сохранить настройки'}
          </button>
          
          <button
            onClick={resetSettings}
            style={{
              padding: '14px 24px',
              background: 'transparent',
              border: '1px solid #6b7280',
              color: '#6b7280',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ↺ Сбросить
          </button>
        </div>
      </div>
    </div>
  )
}
