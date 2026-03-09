'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, BookOpen, Plus, TrendingUp, TrendingDown, 
  Calendar, Search, Filter, Trash2, Edit2, BarChart3,
  Target, AlertTriangle, Lightbulb, Image as ImageIcon,
  X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { diaryAPI } from '@/lib/api'

interface DiaryEntry {
  id: string
  entry_date: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  entry_price: number
  exit_price?: number
  stop_loss?: number
  take_profit?: number
  position_size?: number
  pnl?: number
  pnl_percent?: number
  status: 'OPEN' | 'CLOSED' | 'CANCELLED'
  strategy?: string
  timeframe?: string
  setup_notes?: string
  emotions?: string
  mistakes?: string
  lessons?: string
  tags?: string
}

interface Stats {
  total_trades: number
  winning_trades: number
  losing_trades: number
  open_trades: number
  total_pnl: number
  win_rate: number
  profit_factor: number
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [filter, setFilter] = useState({ symbol: '', status: '' })

  // Form state
  const [formData, setFormData] = useState({
    symbol: '',
    direction: 'LONG',
    entry_price: '',
    exit_price: '',
    stop_loss: '',
    take_profit: '',
    position_size: '',
    pnl: '',
    pnl_percent: '',
    status: 'OPEN',
    strategy: '',
    timeframe: '1h',
    setup_notes: '',
    emotions: '',
    mistakes: '',
    lessons: '',
    tags: '',
  })

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [entriesData, statsData] = await Promise.all([
        diaryAPI.getEntries({ limit: '50', symbol: filter.symbol, status: filter.status }),
        diaryAPI.getStats(),
      ])
      setEntries(entriesData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load diary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        entry_price: parseFloat(formData.entry_price),
        exit_price: formData.exit_price ? parseFloat(formData.exit_price) : undefined,
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : undefined,
        take_profit: formData.take_profit ? parseFloat(formData.take_profit) : undefined,
        position_size: formData.position_size ? parseFloat(formData.position_size) : undefined,
        pnl: formData.pnl ? parseFloat(formData.pnl) : undefined,
        pnl_percent: formData.pnl_percent ? parseFloat(formData.pnl_percent) : undefined,
      }

      if (editingEntry) {
        await diaryAPI.updateEntry(editingEntry.id, payload)
      } else {
        await diaryAPI.createEntry(payload)
      }

      setShowForm(false)
      setEditingEntry(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Failed to save entry:', error)
      alert('Ошибка сохранения: ' + (error as Error).message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту запись?')) return
    try {
      await diaryAPI.deleteEntry(id)
      loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry)
    setFormData({
      symbol: entry.symbol,
      direction: entry.direction,
      entry_price: entry.entry_price.toString(),
      exit_price: entry.exit_price?.toString() || '',
      stop_loss: entry.stop_loss?.toString() || '',
      take_profit: entry.take_profit?.toString() || '',
      position_size: entry.position_size?.toString() || '',
      pnl: entry.pnl?.toString() || '',
      pnl_percent: entry.pnl_percent?.toString() || '',
      status: entry.status,
      strategy: entry.strategy || '',
      timeframe: entry.timeframe || '1h',
      setup_notes: entry.setup_notes || '',
      emotions: entry.emotions || '',
      mistakes: entry.mistakes || '',
      lessons: entry.lessons || '',
      tags: entry.tags || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      symbol: '',
      direction: 'LONG',
      entry_price: '',
      exit_price: '',
      stop_loss: '',
      take_profit: '',
      position_size: '',
      pnl: '',
      pnl_percent: '',
      status: 'OPEN',
      strategy: '',
      timeframe: '1h',
      setup_notes: '',
      emotions: '',
      mistakes: '',
      lessons: '',
      tags: '',
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid #2a2a3e', background: '#13131f' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ color: '#00d4ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={20} /> Назад
            </Link>
            <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BookOpen size={28} color="#00d4ff" />
              Торговый дневник
            </h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingEntry(null); resetForm(); }}
            style={{
              padding: '12px 20px',
              background: '#00d4ff',
              color: '#0a0a0f',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} /> Новая сделка
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <StatCard 
              title="Всего сделок" 
              value={stats.total_trades} 
              icon={<BarChart3 size={20} />} 
              color="#6b7280"
            />
            <StatCard 
              title="Win Rate" 
              value={`${stats.win_rate}%`} 
              icon={<Target size={20} />} 
              color={stats.win_rate >= 50 ? '#10b981' : '#ef4444'}
            />
            <StatCard 
              title="P&L" 
              value={`$${stats.total_pnl?.toFixed(2) || '0.00'}`} 
              icon={stats.total_pnl >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              color={stats.total_pnl >= 0 ? '#10b981' : '#ef4444'}
            />
            <StatCard 
              title="Profit Factor" 
              value={stats.profit_factor?.toFixed(2) || '0.00'} 
              icon={<Target size={20} />} 
              color="#00d4ff"
            />
            <StatCard 
              title="Прибыльных" 
              value={stats.winning_trades} 
              icon={<TrendingUp size={20} />} 
              color="#10b981"
            />
            <StatCard 
              title="Убыточных" 
              value={stats.losing_trades} 
              icon={<TrendingDown size={20} />} 
              color="#ef4444"
            />
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', borderBottom: '1px solid #2a2a3e' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Поиск по паре..."
            value={filter.symbol}
            onChange={(e) => setFilter({ ...filter, symbol: e.target.value.toUpperCase() })}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              background: '#13131f',
              border: '1px solid #2a2a3e',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px'
            }}
          />
        </div>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          style={{
            padding: '10px 12px',
            background: '#13131f',
            border: '1px solid #2a2a3e',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="">Все статусы</option>
          <option value="OPEN">Открытые</option>
          <option value="CLOSED">Закрытые</option>
          <option value="CANCELLED">Отменённые</option>
        </select>
      </div>

      {/* Entries List */}
      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Загрузка...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Дневник пуст. Добавьте первую сделку.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: '#13131f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onClick={() => handleEdit(entry)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      color: entry.direction === 'LONG' ? '#10b981' : '#ef4444'
                    }}>
                      {entry.direction === 'LONG' ? '▲' : '▼'} {entry.symbol}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      background: entry.status === 'OPEN' ? 'rgba(245, 158, 11, 0.2)' : 
                                  entry.pnl && entry.pnl > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: entry.status === 'OPEN' ? '#f59e0b' : 
                             entry.pnl && entry.pnl > 0 ? '#10b981' : '#ef4444',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {entry.status === 'OPEN' ? 'ОТКРЫТА' : entry.pnl && entry.pnl > 0 ? 'ПРИБЫЛЬ' : 'УБЫТОК'}
                    </span>
                    {entry.strategy && (
                      <span style={{ fontSize: '12px', color: '#6b7280', padding: '4px 8px', background: '#0a0a0f', borderRadius: '4px' }}>
                        {entry.strategy}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{formatDate(entry.entry_date)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', fontSize: '14px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>Вход</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>${entry.entry_price.toLocaleString()}</p>
                  </div>
                  {entry.exit_price && (
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>Выход</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>${entry.exit_price.toLocaleString()}</p>
                    </div>
                  )}
                  {entry.pnl !== undefined && entry.pnl !== null && (
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>P&L</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: entry.pnl >= 0 ? '#10b981' : '#ef4444' }}>
                        {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toFixed(2)} ({entry.pnl_percent?.toFixed(2)}%)
                      </p>
                    </div>
                  )}
                  {entry.setup_notes && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>Заметки</p>
                      <p style={{ margin: 0, color: '#9ca3af' }}>{entry.setup_notes.substring(0, 100)}{entry.setup_notes.length > 100 ? '...' : ''}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: '#13131f',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{editingEntry ? 'Редактировать сделку' : 'Новая сделка'}</h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Пара *</label>
                  <input
                    type="text"
                    required
                    placeholder="BTC/USDT"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Направление *</label>
                  <select
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="LONG">LONG ▲</option>
                    <option value="SHORT">SHORT ▼</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Цена входа *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="0.00"
                    value={formData.entry_price}
                    onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Цена выхода</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="0.00"
                    value={formData.exit_price}
                    onChange={(e) => setFormData({ ...formData, exit_price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Stop Loss</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="0.00"
                    value={formData.stop_loss}
                    onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Take Profit</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="0.00"
                    value={formData.take_profit}
                    onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>P&L ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.pnl}
                    onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="OPEN">Открыта</option>
                    <option value="CLOSED">Закрыта</option>
                    <option value="CANCELLED">Отменена</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Стратегия</label>
                  <input
                    type="text"
                    placeholder="SMC, Wyckoff..."
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Таймфрейм</label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                    <option value="4h">4h</option>
                    <option value="1d">1d</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Заметки по сетапу</label>
                <textarea
                  rows={3}
                  placeholder="Почему вошли в сделку? Что видели на графике?"
                  value={formData.setup_notes}
                  onChange={(e) => setFormData({ ...formData, setup_notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>
                  <AlertTriangle size={16} /> Эмоции
                </label>
                <textarea
                  rows={2}
                  placeholder="Как вы себя чувствовали? Страх? Жадность? Уверенность?"
                  value={formData.emotions}
                  onChange={(e) => setFormData({ ...formData, emotions: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>
                  <AlertTriangle size={16} color="#ef4444" /> Ошибки
                </label>
                <textarea
                  rows={2}
                  placeholder="Что пошло не так?"
                  value={formData.mistakes}
                  onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>
                  <Lightbulb size={16} color="#f59e0b" /> Уроки
                </label>
                <textarea
                  rows={2}
                  placeholder="Что узнали? Что будете делать по-другому?"
                  value={formData.lessons}
                  onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#00d4ff',
                    color: '#0a0a0f',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {editingEntry ? 'Сохранить' : 'Добавить сделку'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ 
      background: '#0a0a0f', 
      padding: '16px', 
      borderRadius: '12px',
      border: '1px solid #2a2a3e'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color }})>
        {icon}
        <span style={{ fontSize: '12px', color: '#6b7280' }}>{title}</span>
      </div>
      <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color }}>{value}</p>
    </div>
  )
}
