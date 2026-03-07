'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Bot, Bell, Settings, Check, X, RefreshCw } from 'lucide-react'

export default function TelegramPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [botStatus, setBotStatus] = useState('online')
  const [notifications, setNotifications] = useState({
    signals: true,
    trades: true,
    dailyReport: false,
    priceAlerts: true
  })
  const [recentMessages, setRecentMessages] = useState([
    { type: 'signal', text: '🟢 BTC/USDT LONG @ $68,726', time: '2 мин назад' },
    { type: 'trade', text: '✅ Сделка закрыта по TP +3.2%', time: '15 мин назад' },
    { type: 'alert', text: '⚠️ BTC пробил уровень $69,000', time: '1 час назад' }
  ])

  const botUsername = 'CryptoTraderAI_Bot'
  const botLink = `https://t.me/${botUsername}`

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: '#00d4ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ArrowLeft size={20} /> Назад
        </Link>
        <h1 style={{ margin: '0', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageCircle size={32} color="#00d4ff" />
          Telegram Бот
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Уведомления и управление через Telegram</p>
      </div>

      {/* Bot Status Card */}
      <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #0088cc, #00d4ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={32} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '20px' }}>@{botUsername}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: botStatus === 'online' ? '#10b981' : '#ef4444',
                  display: 'inline-block'
                }} />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>{botStatus === 'online' ? '🟢 Онлайн' : '🔴 Офлайн'}</span>
              </div>
            </div>
          </div>

          <a
            href={botLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#0088cc',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MessageCircle size={18} /> Открыть в Telegram
          </a>
        </div>

        {/* Connection Steps */}
        <div style={{ background: '#0a0a0f', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#00d4ff' }}>🚀 Как подключить:</h4>
          <ol style={{ margin: '0', paddingLeft: '20px', color: '#9ca3af', lineHeight: '2' }}>
            <li>Нажмите кнопку "Открыть в Telegram" выше</li>
            <li>Нажмите "Start" в чате с ботом</li>
            <li>Отправьте команду <code style={{ background: '#2a2a3e', padding: '2px 6px', borderRadius: '4px', color: '#00d4ff' }}>/connect</code></li>
            <li>Готово! Вы будете получать уведомления</li>
          </ol>
        </div>
      </div>

      {/* Notifications Settings */}
      <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} color="#00d4ff" />
          Настройки уведомлений
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'signals', label: '📊 Торговые сигналы', desc: 'Уведомления о новых сигналах входа' },
            { key: 'trades', label: '💰 Открытие/закрытие сделок', desc: 'Когда бот открывает или закрывает позицию' },
            { key: 'priceAlerts', label: '⚡ Ценовые алерты', desc: 'Пробой ключевых уровней' },
            { key: 'dailyReport', label: '📈 Ежедневный отчет', desc: 'Сводка P&L за день' }
          ].map((item) => (
            <div 
              key={item.key}
              onClick={() => toggleNotification(item.key)}
              style={{ 
                padding: '16px', 
                background: '#0a0a0f', 
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: notifications[item.key as keyof typeof notifications] ? '1px solid #00d4ff' : '1px solid transparent'
              }}
            >
              <div>
                <p style={{ margin: '0', fontWeight: 'bold' }}>{item.label}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{item.desc}</p>
              </div>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '6px',
                background: notifications[item.key as keyof typeof notifications] ? '#00d4ff' : '#2a2a3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications[item.key as keyof typeof notifications] && <Check size={16} color="#0a0a0f" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
        <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={20} color="#00d4ff" />
          Последние сообщения
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentMessages.map((msg, idx) => (
            <div key={idx} style={{ padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ margin: '0', fontSize: '14px' }}>{msg.text}</p>
                <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commands Reference */}
      <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#00d4ff' }}>🤖 Команды бота:</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          {[
            { cmd: '/start', desc: 'Начать работу с ботом' },
            { cmd: '/connect', desc: 'Подключить аккаунт' },
            { cmd: '/signals', desc: 'Последние сигналы' },
            { cmd: '/balance', desc: 'Баланс BingX' },
            { cmd: '/trades', desc: 'История сделок' },
            { cmd: '/settings', desc: 'Настройки уведомлений' },
            { cmd: '/stats', desc: 'Статистика торговли' },
            { cmd: '/help', desc: 'Справка по командам' }
          ].map((item) => (
            <div key={item.cmd} style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px' }}>
              <code style={{ color: '#00d4ff', fontWeight: 'bold' }}>{item.cmd}</code>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
