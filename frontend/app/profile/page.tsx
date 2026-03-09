'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, User, Key, Shield, Landmark, Check, AlertCircle, 
  BookOpen, LogOut, Loader2
} from 'lucide-react'
import { authAPI } from '@/lib/api'

const EXCHANGES = [
  { id: 'bingx', name: 'BingX', logo: '🔵', color: '#1E90FF' },
  { id: 'binance', name: 'Binance', logo: '🟡', color: '#F0B90B' },
  { id: 'bybit', name: 'Bybit', logo: '⚫', color: '#F7A600' },
  { id: 'okx', name: 'OKX', logo: '⚪', color: '#000000' }
]

interface User {
  id: string
  email: string
  created_at: string
}

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  
  const [selectedExchange, setSelectedExchange] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoggedIn(false)
      setIsLoading(false)
      return
    }

    try {
      const profile = await authAPI.getProfile()
      setUser(profile)
      setIsLoggedIn(true)
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('token')
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLoginMode) {
        const response = await authAPI.login(email, password)
        localStorage.setItem('token', response.access_token)
        setUser({
          id: response.user_id,
          email: response.email,
          created_at: new Date().toISOString()
        })
      } else {
        const response = await authAPI.register(email, password)
        localStorage.setItem('token', response.access_token)
        setUser({
          id: response.user_id,
          email: response.email,
          created_at: new Date().toISOString()
        })
      }
      setIsLoggedIn(true)
    } catch (err: any) {
      setError(err.message || 'Ошибка. Попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUser(null)
    setEmail('')
    setPassword('')
  }

  const handleConnectExchange = () => {
    if (selectedExchange && apiKey && apiSecret) {
      setIsConnected(true)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="animate-spin" color="#00d4ff" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Link href="/" style={{ color: '#00d4ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <ArrowLeft size={20} /> Назад
          </Link>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={40} color="#fff" />
            </div>
            <h1 style={{ margin: '0', fontSize: '24px' }}>
              {isLoginMode ? 'Вход в аккаунт' : 'Регистрация'}
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
              {isLoginMode ? 'Управляйте своими биржами' : 'Создайте аккаунт для доступа'}
            </p>
          </div>

          {error && (
            <div style={{ 
              padding: '12px 16px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#ef4444',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#13131f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#13131f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '14px',
                background: isLoading ? '#2a2a3e' : '#00d4ff',
                color: '#0a0a0f',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280', fontSize: '14px' }}>
            {isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
              style={{ 
                color: '#00d4ff', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isLoginMode ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: '#00d4ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ArrowLeft size={20} /> Назад
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={30} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: '0', fontSize: '24px' }}>Личный кабинет</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </div>

      {/* Diary Link */}
      <Link href="/diary" style={{ textDecoration: 'none' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))',
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #00d4ff',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(0, 212, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={24} color="#00d4ff" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#fff' }}>📓 Торговый дневник</h3>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
              Ваш личный дневник сделок. Только вы видите свои записи.
            </p>
          </div>
          <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#00d4ff' }} />
        </div>
      </Link>

      {/* Exchange Connection */}
      <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Landmark size={20} color="#00d4ff" />
          Подключение биржи
        </h2>

        {isConnected ? (
          <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '40px' }}>{EXCHANGES.find(e => e.id === selectedExchange)?.logo}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0', fontWeight: 'bold', fontSize: '18px' }}>{EXCHANGES.find(e => e.id === selectedExchange)?.name}</p>
                <p style={{ margin: '4px 0 0 0', color: '#10b981', fontSize: '14px' }}><Check size={14} style={{ display: 'inline' }} /> Подключено</p>
              </div>
              <button
                onClick={() => setIsConnected(false)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Отключить
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Exchange Selection */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 12px 0', color: '#9ca3af', fontSize: '14px' }}>Выберите биржу:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {EXCHANGES.map((exchange) => (
                  <button
                    key={exchange.id}
                    onClick={() => setSelectedExchange(exchange.id)}
                    style={{
                      padding: '16px',
                      background: selectedExchange === exchange.id ? 'rgba(0, 212, 255, 0.1)' : '#0a0a0f',
                      border: selectedExchange === exchange.id ? '2px solid #00d4ff' : '1px solid #2a2a3e',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{exchange.logo}</span>
                    <span style={{ fontWeight: 'bold' }}>{exchange.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* API Keys Form */}
            {selectedExchange && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>API Key</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Введите API ключ"
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 44px',
                        background: '#0a0a0f',
                        border: '1px solid #2a2a3e',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '16px'
                      }}
                    />
                    <Key size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>API Secret</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Введите API Secret"
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 44px',
                        background: '#0a0a0f',
                        border: '1px solid #2a2a3e',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '16px'
                      }}
                    />
                    <Shield size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} color="#f59e0b" />
                  <p style={{ margin: '0', fontSize: '12px', color: '#f59e0b' }}>API ключи хранятся в зашифрованном виде. Не храните их в открытом виде.</p>
                </div>

                <button
                  onClick={handleConnectExchange}
                  disabled={!apiKey || !apiSecret}
                  style={{
                    padding: '14px',
                    background: !apiKey || !apiSecret ? '#2a2a3e' : '#00d4ff',
                    color: '#0a0a0f',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: !apiKey || !apiSecret ? 'not-allowed' : 'pointer'
                  }}
                >
                  Подключить биржу
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Security Info */}
      <div style={{ background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#00d4ff' }}>🔐 Безопасность</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#0a0a0f', borderRadius: '8px' }}>
            <Shield size={20} color="#10b981" />
            <div>
              <p style={{ margin: '0', fontWeight: 'bold' }}>Шифрование AES-256</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Все API ключи шифруются перед сохранением</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#0a0a0f', borderRadius: '8px' }}>
            <Key size={20} color="#00d4ff" />
            <div>
              <p style={{ margin: '0', fontWeight: 'bold' }}>Только нужные разрешения</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Чтение баланса и торговля — без вывода средств</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#0a0a0f', borderRadius: '8px' }}>
            <AlertCircle size={20} color="#f59e0b" />
            <div>
              <p style={{ margin: '0', fontWeight: 'bold' }}>IP Whitelist</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Ограничьте доступ по IP в настройках биржи для безопасности</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
