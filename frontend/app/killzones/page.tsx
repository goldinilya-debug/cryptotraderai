'use client'

import Sidebar from '@/components/Sidebar'
import { Clock, TrendingUp, AlertCircle } from 'lucide-react'

const styles = {
  container: { padding: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' },
  card: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  cardLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconBox: (color: string) => ({ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}20` }),
  zoneName: { fontWeight: 'bold', fontSize: '16px' },
  zoneTime: { fontSize: '14px', color: '#6b7280' },
  badge: (active: boolean) => ({ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)', color: active ? '#10b981' : '#6b7280' }),
  volatility: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  infoCard: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' },
  infoHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', color: '#9ca3af' },
  bullet: { color: '#00d4ff' },
}

export default function KillZonesPage() {
  const zones = [
    { name: 'Asian', time: '00:00 - 08:00 UTC', status: 'Closed', color: '#6b7280', volatility: 'Low' },
    { name: 'London', time: '08:00 - 16:00 UTC', status: 'Closed', color: '#3b82f6', volatility: 'Medium' },
    { name: 'New York', time: '13:00 - 21:00 UTC', status: 'Active', color: '#10b981', volatility: 'High' },
    { name: 'London Close', time: '14:00 - 16:00 UTC', status: 'Closed', color: '#a855f7', volatility: 'High' },
  ]

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.title}>Kill Zones</h1>
        <p style={styles.subtitle}>High-probability trading sessions</p>

        <div style={styles.grid}>
          {zones.map((zone) => {
            const isActive = zone.status === 'Active'
            return (
              <div key={zone.name} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardLeft}>
                    <div style={styles.iconBox(zone.color)}>
                      <Clock color={zone.color} size={20} />
                    </div>
                    <div>
                      <p style={styles.zoneName}>{zone.name}</p>
                      <p style={styles.zoneTime}>{zone.time}</p>
                    </div>
                  </div>
                  <span style={styles.badge(isActive)}>{zone.status}</span>
                </div>
                <div style={styles.volatility}>
                  <TrendingUp size={14} color="#6b7280" />
                  <span style={{ color: '#6b7280' }}>Volatility:</span>
                  <span style={{ fontWeight: 'bold', color: zone.color }}>{zone.volatility}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={styles.infoCard}>
          <div style={styles.infoHeader}>
            <AlertCircle color="#00d4ff" />
            <span style={{ fontWeight: 'bold' }}>Kill Zone Strategy</span>
          </div>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span>
              <span>Trade only during high volatility sessions (London, NY, London Close)</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span>
              <span>Look for breakouts during session opens</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span>
              <span>Avoid trading during Asian session unless scalping</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span>
              <span>Best setups: London-NY overlap (13:00-16:00 UTC)</span>
            </li>
          </ul>
        </div>
      </div>
    </Sidebar>
  )
}
