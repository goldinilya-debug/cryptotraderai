'use client'

import { useState, useMemo, useRef } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Sidebar from '@/components/Sidebar'

const INITIAL_TRADES = [
  { id: 1, date: "2025-03-01", pair: "BTC/USDT", direction: "LONG", entry: 84200, exit: 87500, size: 0.5, pnl: 1650, rr: 2.1, emotion: "calm", notes: "Пробой уровня 84k, хорошая точка входа", screenshot: null, tags: ["breakout", "trend"] },
  { id: 2, date: "2025-03-03", pair: "ETH/USDT", direction: "SHORT", entry: 3420, exit: 3280, size: 2, pnl: 280, rr: 1.8, emotion: "confident", notes: "Отбой от сопротивления", screenshot: null, tags: ["resistance", "short"] },
  { id: 3, date: "2025-03-05", pair: "SOL/USDT", direction: "LONG", entry: 178, exit: 162, size: 10, pnl: -160, rr: -1, emotion: "fomo", notes: "Вошёл на хайпе, не дождался отката", screenshot: null, tags: ["mistake", "fomo"] },
  { id: 4, date: "2025-03-07", pair: "BTC/USDT", direction: "LONG", entry: 82500, exit: 85100, size: 0.3, pnl: 780, rr: 2.6, emotion: "calm", notes: "Чистый паттерн, соблюдал план", screenshot: null, tags: ["breakout"] },
];

const EMOTIONS = ["calm", "confident", "anxious", "fomo", "greedy", "fearful", "disciplined"];
const EMOTION_COLOR = { calm: "#4ade80", confident: "#38bdf8", anxious: "#facc15", fomo: "#fb923c", greedy: "#f472b6", fearful: "#f87171", disciplined: "#a78bfa" };
const PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "DOGE/USDT", "ADA/USDT", "AVAX/USDT"];

const fmt = (n, digits = 2) => (n >= 0 ? "+" : "") + n.toFixed(digits);
const fmtMoney = (n) => (n >= 0 ? "+" : "") + n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " $";

export default function TradingJournal() {
  const [trades, setTrades] = useState(INITIAL_TRADES);
  const [tab, setTab] = useState("journal");
  const [showForm, setShowForm] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [filterPair, setFilterPair] = useState("ALL");
  const [filterDir, setFilterDir] = useState("ALL");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([
    { id: 1, date: "2025-03-02", text: "Нужно перестать входить на эмоциях. Сегодня дважды нарушил правило — только 1% риска на сделку.", mood: 3 },
    { id: 2, date: "2025-03-06", text: "Хорошая неделя. Держу стоп строго. Результат заметен.", mood: 5 },
  ]);
  const [noteMood, setNoteMood] = useState(3);
  const imgRef = useRef();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10), pair: "BTC/USDT", direction: "LONG",
    entry: "", exit: "", size: "", emotion: "calm", notes: "", tags: "", screenshot: null
  });

  const stats = useMemo(() => {
    const total = trades.reduce((a, t) => a + t.pnl, 0);
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const wr = trades.length ? (wins.length / trades.length * 100) : 0;
    const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((a, t) => a + t.pnl, 0) / losses.length : 0;
    const pf = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    const best = trades.length ? Math.max(...trades.map(t => t.pnl)) : 0;
    const worst = trades.length ? Math.min(...trades.map(t => t.pnl)) : 0;
    const avgRR = trades.length ? trades.reduce((a, t) => a + t.rr, 0) / trades.length : 0;

    let eq = 10000;
    const curve = trades.map(t => { eq += t.pnl; return { date: t.date, eq: Math.round(eq) }; });

    const byPair = {};
    trades.forEach(t => { byPair[t.pair] = (byPair[t.pair] || 0) + t.pnl; });
    const pairData = Object.entries(byPair).map(([pair, pnl]) => ({ pair, pnl }));

    const byEmotion = {};
    trades.forEach(t => { if (!byEmotion[t.emotion]) byEmotion[t.emotion] = { count: 0, pnl: 0 }; byEmotion[t.emotion].count++; byEmotion[t.emotion].pnl += t.pnl; });
    const emotionData = Object.entries(byEmotion).map(([emotion, d]) => ({ emotion, ...d }));

    return { total, wins: wins.length, losses: losses.length, wr, avgWin, avgLoss, pf, best, worst, avgRR, curve, pairData, emotionData };
  }, [trades]);

  const filtered = useMemo(() => trades.filter(t =>
    (filterPair === "ALL" || t.pair === filterPair) &&
    (filterDir === "ALL" || t.direction === filterDir)
  ).sort((a, b) => b.date.localeCompare(a.date)), [trades, filterPair, filterDir]);

  const calcPnl = (f) => {
    const entry = parseFloat(f.entry), exit = parseFloat(f.exit), size = parseFloat(f.size);
    if (!entry || !exit || !size) return 0;
    return f.direction === "LONG" ? (exit - entry) * size : (entry - exit) * size;
  };

  const handleSubmit = () => {
    const pnl = calcPnl(form);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editTrade) {
      setTrades(tr => tr.map(t => t.id === editTrade.id ? { ...form, id: t.id, pnl, tags, entry: parseFloat(form.entry), exit: parseFloat(form.exit), size: parseFloat(form.size) } : t));
      setEditTrade(null);
    } else {
      setTrades(tr => [...tr, { ...form, id: Date.now(), pnl, rr: 0, tags, entry: parseFloat(form.entry), exit: parseFloat(form.exit), size: parseFloat(form.size) }]);
    }
    setShowForm(false);
    setForm({ date: new Date().toISOString().slice(0, 10), pair: "BTC/USDT", direction: "LONG", entry: "", exit: "", size: "", emotion: "calm", notes: "", tags: "", screenshot: null });
  };

  const handleEdit = (t) => {
    setForm({ ...t, tags: t.tags.join(", ") });
    setEditTrade(t);
    setShowForm(true);
    setTab("journal");
  };

  const handleDelete = (id) => setTrades(tr => tr.filter(t => t.id !== id));

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, screenshot: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(n => [...n, { id: Date.now(), date: new Date().toISOString().slice(0, 10), text: note, mood: noteMood }]);
    setNote("");
  };

  const previewPnl = calcPnl(form);

  return (
    <Sidebar>
      <div style={{ minHeight: "100vh", background: "#0c0c0f", color: "#e2e2e2", fontFamily: "system-ui, sans-serif", padding: "24px" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>📓 Trading Journal</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>Дневник трейдера с аналитикой и психологией</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["journal", "analytics", "psychology"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ 
                padding: "8px 16px", 
                borderRadius: 8, 
                border: "none", 
                background: tab === t ? "#00d4ff" : "#1a1a1a", 
                color: tab === t ? "#000" : "#888",
                cursor: "pointer"
              }}>
                {t === "journal" ? "Сделки" : t === "analytics" ? "Аналитика" : "Психология"}
              </button>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
          <div style={{ background: "#13131f", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#666" }}>Всего P&L</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: stats.total >= 0 ? "#10b981" : "#ef4444" }}>{fmtMoney(stats.total)}</div>
          </div>
          <div style={{ background: "#13131f", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#666" }}>Сделок</div>
            <div style={{ fontSize: 22, fontWeight: "bold" }}>{trades.length}</div>
            <div style={{ fontSize: 11, color: "#666" }}>{stats.wins}W / {stats.losses}L</div>
          </div>
          <div style={{ background: "#13131f", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#666" }}>Винрейт</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: stats.wr >= 50 ? "#10b981" : "#ef4444" }}>{stats.wr.toFixed(1)}%</div>
          </div>
          <div style={{ background: "#13131f", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#666" }}>Профит-фактор</div>
            <div style={{ fontSize: 22, fontWeight: "bold" }}>{stats.pf.toFixed(2)}</div>
          </div>
          <div style={{ background: "#13131f", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#666" }}>Лучшая</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#10b981" }}>{fmtMoney(stats.best)}</div>
          </div>
          <div style={{ background: "#13131f", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#666" }}>Худшая</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#ef4444" }}>{fmtMoney(stats.worst)}</div>
          </div>
        </div>

        {/* TAB: JOURNAL */}
        {tab === "journal" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={filterPair} onChange={e => setFilterPair(e.target.value)} style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }}>
                  <option value="ALL">Все пары</option>
                  {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={filterDir} onChange={e => setFilterDir(e.target.value)} style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }}>
                  <option value="ALL">Все направления</option>
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>
              <button onClick={() => { setShowForm(!showForm); setEditTrade(null); }} style={{ background: "#00d4ff", color: "#000", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: "bold", cursor: "pointer" }}>
                {showForm ? "✕ Закрыть" : "+ Новая сделка"}
              </button>
            </div>

            {/* FORM */}
            {showForm && (
              <div style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 16px 0" }}>{editTrade ? "✏️ Редактировать" : "📝 Новая сделка"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }} />
                  <select value={form.pair} onChange={e => setForm(f => ({ ...f, pair: e.target.value }))} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }}>
                    {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={form.direction} onChange={e => setForm(f => ({ ...f, direction: e.target.value }))} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }}>
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                  <select value={form.emotion} onChange={e => setForm(f => ({ ...f, emotion: e.target.value }))} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }}>
                    {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
                  <input type="number" placeholder="Вход ($)" value={form.entry} onChange={e => setForm(f => ({ ...f, entry: e.target.value }))} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }} />
                  <input type="number" placeholder="Выход ($)" value={form.exit} onChange={e => setForm(f => ({ ...f, exit: e.target.value }))} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }} />
                  <input type="number" placeholder="Объём" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }} />
                  <div style={{ background: previewPnl >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: "1px solid", borderColor: previewPnl >= 0 ? "#10b981" : "#ef4444", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#666" }}>P&L</div>
                    <div style={{ fontWeight: "bold", color: previewPnl >= 0 ? "#10b981" : "#ef4444" }}>{fmtMoney(previewPnl)}</div>
                  </div>
                </div>
                <input placeholder="Теги (через запятую)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff", marginBottom: 12 }} />
                <textarea placeholder="Заметки о сделке..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff", minHeight: 60, marginBottom: 12 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleSubmit} style={{ background: "#00d4ff", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: "bold", cursor: "pointer" }}>{editTrade ? "Сохранить" : "Добавить"}</button>
                  <button onClick={() => { setShowForm(false); setEditTrade(null); }} style={{ background: "transparent", border: "1px solid #2a2a3e", borderRadius: 8, padding: "10px 20px", color: "#666", cursor: "pointer" }}>Отмена</button>
                </div>
              </div>
            )}

            {/* TRADES TABLE */}
            <div style={{ background: "#13131f", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2a3e" }}>
                    {["Дата", "Пара", "Тип", "Вход", "Выход", "P&L", "R:R", "Эмоция", "Заметки", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#666", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #2a2a3e" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{t.date}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{t.pair}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "4px 8px", borderRadius: 4, background: t.direction === "LONG" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)", color: t.direction === "LONG" ? "#10b981" : "#ef4444", fontSize: 11, fontWeight: "bold" }}>{t.direction}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>${t.entry.toLocaleString()}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>${t.exit.toLocaleString()}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: t.pnl >= 0 ? "#10b981" : "#ef4444", fontWeight: "bold" }}>{fmtMoney(t.pnl)}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{t.rr ? t.rr.toFixed(1) : "-"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "4px 8px", borderRadius: 4, background: EMOTION_COLOR[t.emotion] + "30", color: EMOTION_COLOR[t.emotion], fontSize: 11 }}>{t.emotion}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{t.notes}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => handleEdit(t)} style={{ background: "none", border: "none", color: "#00d4ff", cursor: "pointer", marginRight: 8 }}>✏️</button>
                        <button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS */}
        {tab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#13131f", padding: 20, borderRadius: 12 }}>
                <h3 style={{ margin: "0 0 16px 0" }}>Equity Curve</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.curve}>
                    <defs>
                      <linearGradient id="colorEq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a3e' }} />
                    <Area type="monotone" dataKey="eq" stroke="#00d4ff" fillOpacity={1} fill="url(#colorEq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: "#13131f", padding: 20, borderRadius: 12 }}>
                <h3 style={{ margin: "0 0 16px 0" }}>P&L по парам</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.pairData} dataKey="pnl" nameKey="pair" cx="50%" cy="50%" outerRadius={70}>
                      {stats.pairData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a3e' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: "#13131f", padding: 20, borderRadius: 12 }}>
              <h3 style={{ margin: "0 0 16px 0" }}>Эмоции vs P&L</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {stats.emotionData.map(e => (
                  <div key={e.emotion} style={{ background: EMOTION_COLOR[e.emotion] + "20", border: `1px solid ${EMOTION_COLOR[e.emotion]}`, borderRadius: 8, padding: 12, minWidth: 120 }}>
                    <div style={{ fontSize: 11, color: EMOTION_COLOR[e.emotion], textTransform: "uppercase" }}>{e.emotion}</div>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: e.pnl >= 0 ? "#10b981" : "#ef4444" }}>{fmtMoney(e.pnl)}</div>
                    <div style={{ fontSize: 11, color: "#666" }}>{e.count} сделок</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PSYCHOLOGY */}
        {tab === "psychology" && (
          <div>
            <div style={{ background: "#13131f", padding: 20, borderRadius: 12, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px 0" }}>🧠 Дневник психологии</h3>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <input type="date" value={new Date().toISOString().slice(0, 10)} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }} />
                <select value={noteMood} onChange={e => setNoteMood(parseInt(e.target.value))} style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#fff" }}>
                  <option value={1}>😫 Ужасно</option>
                  <option value={2}>😕 Плохо</option>
                  <option value={3}>😐 Нормально</option>
                  <option value={4}>🙂 Хорошо</option>
                  <option value={5}>😁 Отлично</option>
                </select>
              </div>
              <textarea placeholder="Как прошёл день? Что чувствовал во время торговли?" value={note} onChange={e => setNote(e.target.value)} style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "12px", color: "#fff", minHeight: 80, marginBottom: 12 }} />
              <button onClick={addNote} style={{ background: "#00d4ff", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: "bold", cursor: "pointer" }}>Добавить запись</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notes.sort((a,b) => b.date.localeCompare(a.date)).map(n => (
                <div key={n.id} style={{ background: "#13131f", padding: 16, borderRadius: 12, borderLeft: `3px solid ${["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"][n.mood - 1]}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#666" }}>{n.date}</span>
                    <span style={{ fontSize: 16 }}>{["😫", "😕", "😐", "🙂", "😁"][n.mood - 1]}</span>
                  </div>
                  <p style={{ margin: 0, color: "#e2e2e2", lineHeight: 1.5 }}>{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
