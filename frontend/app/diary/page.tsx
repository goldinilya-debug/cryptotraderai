'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://cryptotraderai.onrender.com';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('diary_token');
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

interface Entry {
  id: string;
  entry_date: string;
  symbol: string;
  direction: string;
  entry_price: number;
  exit_price?: number;
  pnl?: number;
  status: string;
  emotions?: string;
  setup_notes?: string;
  strategy?: string;
  timeframe?: string;
  stop_loss?: number;
  take_profit?: number;
  position_size?: number;
  pnl_percent?: number;
  mistakes?: string;
  lessons?: string;
}

interface Stats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  profit_factor: number;
}

export default function DiaryPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split('T')[0],
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
    timeframe: '1H',
    emotions: 'calm',
    setup_notes: '',
    mistakes: '',
    lessons: '',
  });

 useEffect(() => {
  const saved = localStorage.getItem('diary_token');
  if (saved) setToken(saved);
  const savedEmail = localStorage.getItem('diary_email');
  if (savedEmail) setEmail(savedEmail);
}, []);

  useEffect(() => {
    if (token) {
      loadEntries();
      loadStats();
    }
  }, [token]);

  async function handleAuth() {
    setAuthLoading(true);
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const data = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('diary_token', data.access_token);
localStorage.setItem('token', data.access_token);
localStorage.setItem('diary_email', email);
setToken(data.access_token); // для Stats страницы
localStorage.setItem('diary_email', email);
setToken(data.access_token);
    } catch (e: any) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
  localStorage.removeItem('diary_token');
  localStorage.removeItem('token');
  localStorage.removeItem('diary_email');
  setToken(null);
  setEntries([]);
  setStats(null);
}
  }

  async function loadEntries() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSymbol) params.append('symbol', filterSymbol);
      if (filterStatus) params.append('status', filterStatus);
      const data = await fetchWithAuth(`/api/diary/entries${params.toString() ? '?' + params : ''}`);
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await fetchWithAuth('/api/diary/stats');
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit() {
    try {
      const payload = {
        ...form,
        entry_price: parseFloat(form.entry_price) || 0,
        exit_price: form.exit_price ? parseFloat(form.exit_price) : null,
        stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
        take_profit: form.take_profit ? parseFloat(form.take_profit) : null,
        position_size: form.position_size ? parseFloat(form.position_size) : null,
        pnl: form.pnl ? parseFloat(form.pnl) : null,
        pnl_percent: form.pnl_percent ? parseFloat(form.pnl_percent) : null,
      };
      if (editEntry) {
        await fetchWithAuth(`/api/diary/entries/${editEntry.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchWithAuth('/api/diary/entries', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      setEditEntry(null);
      resetForm();
      loadEntries();
      loadStats();
    } catch (e: any) {
      alert('Ошибка: ' + e.message);
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm('Удалить сделку?')) return;
    try {
      await fetchWithAuth(`/api/diary/entries/${id}`, { method: 'DELETE' });
      loadEntries();
      loadStats();
    } catch (e: any) {
      alert('Ошибка: ' + e.message);
    }
  }

  function resetForm() {
    setForm({
      entry_date: new Date().toISOString().split('T')[0],
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
      timeframe: '1H',
      emotions: 'calm',
      setup_notes: '',
      mistakes: '',
      lessons: '',
    });
  }

  function openEdit(entry: Entry) {
    setEditEntry(entry);
    setForm({
      entry_date: entry.entry_date,
      symbol: entry.symbol,
      direction: entry.direction,
      entry_price: String(entry.entry_price),
      exit_price: entry.exit_price ? String(entry.exit_price) : '',
      stop_loss: entry.stop_loss ? String(entry.stop_loss) : '',
      take_profit: entry.take_profit ? String(entry.take_profit) : '',
      position_size: entry.position_size ? String(entry.position_size) : '',
      pnl: entry.pnl ? String(entry.pnl) : '',
      pnl_percent: entry.pnl_percent ? String(entry.pnl_percent) : '',
      status: entry.status,
      strategy: entry.strategy || '',
      timeframe: entry.timeframe || '1H',
      emotions: entry.emotions || 'calm',
      setup_notes: entry.setup_notes || '',
      mistakes: entry.mistakes || '',
      lessons: entry.lessons || '',
    });
    setShowForm(true);
  }

  // ─── AUTH SCREEN ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');`}</style>
        <div style={{
          width: 400, background: '#0f0f1a', border: '1px solid #1e2040',
          borderRadius: 16, padding: 40,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📒</div>
            <h1 style={{ color: '#00f5a0', fontSize: 22, fontWeight: 700, margin: 0 }}>Trading Journal</h1>
            <p style={{ color: '#555', fontSize: 13, margin: '8px 0 0' }}>Дневник трейдера</p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {(['login', 'register'] as const).map(mode => (
              <button key={mode} onClick={() => setAuthMode(mode)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: authMode === mode ? '#00f5a0' : '#1a1a2e',
                color: authMode === mode ? '#000' : '#666',
                fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
              }}>
                {mode === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Пароль" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            style={{ ...inputStyle, marginTop: 12 }}
          />

          {authError && (
            <div style={{ color: '#ff4757', fontSize: 13, marginTop: 12, textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <button onClick={handleAuth} disabled={authLoading} style={{
            width: '100%', marginTop: 20, padding: '14px',
            background: '#00f5a0', color: '#000', border: 'none',
            borderRadius: 8, fontWeight: 700, fontSize: 15,
            cursor: authLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: authLoading ? 0.7 : 1,
          }}>
            {authLoading ? '...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN APP ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        input, select, textarea { outline: none; }
        input::placeholder, textarea::placeholder { color: #444; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f0f1a; }
        ::-webkit-scrollbar-thumb { background: #1e2040; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1e2040', padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0f0f1a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>📒</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#00f5a0' }}>Trading Journal</h1>
            <p style={{ margin: 0, fontSize: 11, color: '#555' }}>Дневник трейдера с аналитикой и психологией</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#555' }}>{localStorage.getItem('diary_email') || ''}</span>
          <button onClick={() => { setShowForm(true); setEditEntry(null); resetForm(); }} style={btnPrimary}>
            + Новая сделка
          </button>
          <button onClick={logout} style={btnSecondary}>Выйти</button>
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Всего P&L', value: `${stats.total_pnl > 0 ? '+' : ''}${stats.total_pnl.toFixed(0)} $`, color: stats.total_pnl >= 0 ? '#00f5a0' : '#ff4757' },
              { label: 'Сделок', value: stats.total_trades, sub: `${stats.winning_trades}W / ${stats.losing_trades}L`, color: '#e0e0e0' },
              { label: 'Винрейт', value: `${stats.win_rate}%`, color: stats.win_rate >= 50 ? '#00f5a0' : '#ff4757' },
              { label: 'Профит-фактор', value: stats.profit_factor, color: '#e0e0e0' },
              { label: 'Ср. выигрыш', value: `+${stats.avg_win.toFixed(0)} $`, color: '#00f5a0' },
              { label: 'Ср. проигрыш', value: `${stats.avg_loss.toFixed(0)} $`, color: '#ff4757' },
            ].map((s, i) => (
              <div key={i} style={statCard}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <input
            placeholder="Фильтр по паре (BTC/USDT)"
            value={filterSymbol}
            onChange={e => setFilterSymbol(e.target.value)}
            style={{ ...inputStyle, width: 220, margin: 0 }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="">Все статусы</option>
            <option value="OPEN">Открытые</option>
            <option value="CLOSED">Закрытые</option>
          </select>
          <button onClick={loadEntries} style={btnSecondary}>Применить</button>
          {(filterSymbol || filterStatus) && (
            <button onClick={() => { setFilterSymbol(''); setFilterStatus(''); setTimeout(loadEntries, 0); }} style={{ ...btnSecondary, color: '#ff4757' }}>
              Сбросить
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>
            {loading ? 'Загрузка...' : `${entries.length} сделок`}
          </span>
        </div>

        {/* Table */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e2040', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2040' }}>
                {['Дата', 'Пара', 'Тип', 'Вход', 'Выход', 'P&L', 'R:R', 'Эмоция', 'Заметки', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#555', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 48, color: '#444', fontSize: 14 }}>
                    {loading ? 'Загрузка...' : 'Нет сделок. Добавьте первую!'}
                  </td>
                </tr>
              )}
              {entries.map(entry => {
                const rr = entry.stop_loss && entry.take_profit && entry.entry_price
                  ? Math.abs((entry.take_profit - entry.entry_price) / (entry.entry_price - entry.stop_loss)).toFixed(1)
                  : '—';
                return (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #13131f', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#111122')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={td}>{entry.entry_date}</td>
                    <td style={{ ...td, fontWeight: 600, color: '#e0e0e0' }}>{entry.symbol}</td>
                    <td style={td}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: entry.direction === 'LONG' ? '#00f5a020' : '#ff475720',
                        color: entry.direction === 'LONG' ? '#00f5a0' : '#ff4757',
                      }}>{entry.direction}</span>
                    </td>
                    <td style={td}>${entry.entry_price?.toLocaleString()}</td>
                    <td style={td}>{entry.exit_price ? `$${entry.exit_price?.toLocaleString()}` : '—'}</td>
                    <td style={{ ...td, fontWeight: 700, color: (entry.pnl || 0) >= 0 ? '#00f5a0' : '#ff4757' }}>
                      {entry.pnl != null ? `${entry.pnl > 0 ? '+' : ''}${entry.pnl} $` : '—'}
                    </td>
                    <td style={td}>{rr}</td>
                    <td style={td}>
                      {entry.emotions && (
                        <span style={{
                          padding: '3px 8px', borderRadius: 4, fontSize: 11,
                          background: emotionColor(entry.emotions) + '20',
                          color: emotionColor(entry.emotions),
                        }}>{entry.emotions}</span>
                      )}
                    </td>
                    <td style={{ ...td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#666', fontSize: 12 }}>
                      {entry.setup_notes || '—'}
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(entry)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 16 }}>✏️</button>
                        <button onClick={() => deleteEntry(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 16 }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: '#000000cc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#0f0f1a', border: '1px solid #1e2040', borderRadius: 16,
            padding: 32, width: '100%', maxWidth: 700,
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#00f5a0' }}>
                {editEntry ? 'Редактировать сделку' : 'Новая сделка'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditEntry(null); }} style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Дата</label>
                <input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Пара</label>
                <input placeholder="BTC/USDT" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Направление</label>
                <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })} style={selectStyle}>
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Таймфрейм</label>
                <select value={form.timeframe} onChange={e => setForm({ ...form, timeframe: e.target.value })} style={selectStyle}>
                  {['1M', '5M', '15M', '1H', '4H', '1D', '1W'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Цена входа</label>
                <input type="number" placeholder="0.00" value={form.entry_price} onChange={e => setForm({ ...form, entry_price: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Цена выхода</label>
                <input type="number" placeholder="0.00" value={form.exit_price} onChange={e => setForm({ ...form, exit_price: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Стоп-лосс</label>
                <input type="number" placeholder="0.00" value={form.stop_loss} onChange={e => setForm({ ...form, stop_loss: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Тейк-профит</label>
                <input type="number" placeholder="0.00" value={form.take_profit} onChange={e => setForm({ ...form, take_profit: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>P&L ($)</label>
                <input type="number" placeholder="0.00" value={form.pnl} onChange={e => setForm({ ...form, pnl: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Статус</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selectStyle}>
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Эмоция</label>
                <select value={form.emotions} onChange={e => setForm({ ...form, emotions: e.target.value })} style={selectStyle}>
                  {['calm', 'confident', 'anxious', 'fomo', 'greedy', 'fearful', 'neutral'].map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Стратегия</label>
                <input placeholder="SMC, ICT, Breakout..." value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Заметки по сетапу</label>
              <textarea rows={3} placeholder="Опиши сетап..." value={form.setup_notes} onChange={e => setForm({ ...form, setup_notes: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Ошибки</label>
              <textarea rows={2} placeholder="Что сделал не так?" value={form.mistakes} onChange={e => setForm({ ...form, mistakes: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Уроки</label>
              <textarea rows={2} placeholder="Что вынес из сделки?" value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={handleSubmit} style={{ ...btnPrimary, flex: 1, padding: '14px' }}>
                {editEntry ? 'Сохранить изменения' : 'Добавить сделку'}
              </button>
              <button onClick={() => { setShowForm(false); setEditEntry(null); }} style={{ ...btnSecondary, flex: 1, padding: '14px' }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function emotionColor(emotion: string) {
  const map: Record<string, string> = {
    calm: '#00f5a0', confident: '#00b4d8', anxious: '#ffa500',
    fomo: '#ff6b6b', greedy: '#ff4757', fearful: '#9b59b6', neutral: '#888',
  };
  return map[emotion] || '#888';
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: '#13131f', border: '1px solid #1e2040',
  borderRadius: 8, color: '#e0e0e0', fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: 'pointer', appearance: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, color: '#555',
  marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const td: React.CSSProperties = {
  padding: '14px 16px', fontSize: 13, color: '#aaa',
};

const statCard: React.CSSProperties = {
  background: '#0f0f1a', border: '1px solid #1e2040',
  borderRadius: 12, padding: '20px 20px',
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px', background: '#00f5a0', color: '#000',
  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
  cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
};

const btnSecondary: React.CSSProperties = {
  padding: '10px 16px', background: '#1a1a2e', color: '#888',
  border: '1px solid #1e2040', borderRadius: 8, fontWeight: 600, fontSize: 13,
  cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
};
