'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { MessageCircle, Bot, Bell, Check, AlertCircle, Send } from 'lucide-react'

const styles = {
  container: { padding: '24px' },
  header: { marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280' },
  card: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' },
  botHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  botAvatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #0088cc, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  botInfo: { flex: 1 },
  botName: { margin: 0, fontSize: '20px' },
  botStatus: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: '#6b7280', fontSize: '14px' },
  statusDot: (online: boolean) => ({ width: '8px', height: '8px', borderRadius: '50%', background: online ? '#10b981' : '#ef4444' }),
  button: { background: '#0088cc', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  infoBox: { background: '#0a0a0f', padding: '20px', borderRadius: '8px' },
  sectionTitle: { margin: '0 0 16px 0', color: '#00d4ff', display: 'flex', alignItems: 'center', gap: '8px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' },
  featureCard: { padding: '16px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid transparent' },
  featureTitle: { margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' },
  featureDesc: { margin: 0, fontSize: '14px', color: '#6b7280' },
  commandGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  commandCard: { padding: '12px', background: '#0a0a0f', borderRadius: '8px' },
  commandName: { color: '#00d4ff', fontWeight: 'bold', fontFamily: 'monospace' },
  commandDesc: { margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' },
}

export default function TelegramPage() {
  const [botStatus, setBotStatus] = useState('online')
  
  const botUsername = 'G1234N_Bot'
  const botDisplayName = '@G1234N_Bot (Makeiteasy)'
  const botLink = `https://t.me/${botUsername}`

  return (
    <Sidebar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <MessageCircle size={32} color="#00d4ff" />
            Telegram Bot
          </h1>
          <p style={styles.subtitle}>Получай сигналы и управляй торговлей через Telegram</p>
        </div>

        <div style={styles.card}>
          <div style={styles.botHeader}>
            <div style={styles.botAvatar}>
              <Bot size={32} color="#fff" />
            </div>
            <div style={styles.botInfo}>
              <h3 style={styles.botName}>{botDisplayName}</h3>
              <div style={styles.botStatus}>
                <span style={styles.statusDot(botStatus === 'online')} />
                <span>{botStatus === 'online' ? '🟢 Онлайн' : '🔴 Офлайн'}</span>
              </div>
            </div>

            <a href={botLink} target="_blank" rel="noopener noreferrer" style={styles.button}>
              <MessageCircle size={18} /> Открыть в Telegram
            </a>
          </div>

          <div style={styles.infoBox}>
            <h4 style={styles.sectionTitle}>🚀 Как подключить:</h4>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', lineHeight: '2' }}>
              <li>Нажмите кнопку "Открыть в Telegram" выше</li>
              <li>Нажмите "Start" в чате с ботом</li>
              <li>Готово! Вы будете получать сигналы автоматически</li>
            </ol>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ ...styles.sectionTitle, color: '#fff' }}>
            <Bell size={20} color="#00d4ff" />
            Что умеет бот:
          </h3>

          <div style={styles.featureGrid}>
            {[
              { icon: '📊', title: 'Торговые сигналы', desc: 'Мгновенные уведомления о новых входах с уровнями Entry, SL, TP' },
              { icon: '💰', title: 'Открытие сделок', desc: 'Уведомление когда бот открывает позицию на бирже' },
              { icon: '✅', title: 'Закрытие сделок', desc: 'Отчет по закрытым сделкам с P&L' },
              { icon: '⚡', title: 'Ценовые алерты', desc: 'Уведомления о пробое ключевых уровней' },
              { icon: '📈', title: 'Ежедневная сводка', desc: 'Итоги торговли за день' },
              { icon: '🎯', title: 'FVG Сетапы', desc: 'Smart Money Concepts сигналы в реальном времени' },
            ].map((item, i) => (
              <div key={i} style={styles.featureCard}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00d4ff'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <p style={styles.featureTitle}>{item.icon} {item.title}</p>
                <p style={styles.featureDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ ...styles.sectionTitle, color: '#fff' }}>
            <Send size={20} color="#00d4ff" />
            Пример сигнала:
          </h3>

          <div style={{ background: '#0a0a0f', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px' }}>
            <pre style={{ margin: 0, color: '#fff' }}>{`🟢 NEW TRADING SIGNAL 🟢

📊 BTC/USDT | LONG
🎯 Confidence: 85%

💰 Entry: $67,350.00
🛑 Stop Loss: $65,400.00
✅ Take Profit 1: $71,250.00
✅ Take Profit 2: $73,200.00

📈 R:R Ratio: 1:2.5
🧠 Wyckoff: Accumulation
⏰ Kill Zone: New York

🤖 Generated by CryptoTraderAI
⏱ 2026-03-08 06:45 UTC`}</pre>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ ...styles.sectionTitle, color: '#fff' }}>
            <AlertCircle size={20} color="#00d4ff" />
            Важно:
          </h3>

          <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', lineHeight: '2' }}>
            <li>Бот работает в режиме уведомлений — команды пока не поддерживаются</li>
            <li>Сигналы приходят автоматически при появлении FVG паттернов</li>
            <li>Для настройки уведомлений используйте веб-интерфейс: <a href="/settings" style={{ color: '#00d4ff' }}>Настройки</a></li>
            <li>Бот не требует регистрации — просто откройте и нажмите Start</li>
          </ul>
        </div>
      </div>
    </Sidebar>
  )
}
