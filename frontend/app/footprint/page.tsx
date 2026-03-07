'use client'

import Sidebar from '@/components/Sidebar'
import { Layers, BarChart2, TrendingUp, Activity, Info } from 'lucide-react'

const styles = {
  container: { padding: '24px' },
  header: { marginBottom: '24px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0 0', color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' },
  card: { background: '#13131f', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a3e' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  cardTitle: { fontWeight: 'bold', fontSize: '16px' },
  chartPlaceholder: { 
    height: '180px', 
    background: '#0a0a0f', 
    borderRadius: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: '#6b7280'
  },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' },
  metric: { background: '#0a0a0f', padding: '12px', borderRadius: '8px' },
  metricLabel: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
  metricValue: { fontSize: '18px', fontWeight: 'bold' },
  explanation: { 
    background: '#0a0a0f', 
    padding: '16px', 
    borderRadius: '8px', 
    marginTop: '16px',
    borderLeft: '3px solid #00d4ff'
  },
  explanationTitle: { fontWeight: 'bold', color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
  explanationText: { fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' },
}

export default function FootprintPage() {
  return (
    <Sidebar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Footprint Charts</h1>
          <p style={styles.subtitle}>Order flow analysis explained simply</p>
        </div>

        <div style={styles.grid}>
          {/* Volume Profile */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Layers color="#00d4ff" />
              <span style={styles.cardTitle}>Volume Profile</span>
            </div>
            <div style={styles.chartPlaceholder}>
              Гистограмма объемов по ценовым уровням
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>POC (Point of Control)</p>
                <p style={styles.metricValue}>$71,245</p>
              </div>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Value Area</p>
                <p style={styles.metricValue}>$70.8K - $71.7K</p>
              </div>
            </div>

            <div style={styles.explanation}>
              <p style={styles.explanationTitle}><Info size={16} /> Что это значит:</p>
              <p style={styles.explanationText}>
                <strong>POC</strong> — цена, где прошел максимальный объем торгов. 
                Это уровень согласия покупателей и продавцов. 
                Цена часто возвращается к этому уровню.
                <br /><br />
                <strong>Value Area</strong> — зона, где прошло 70% всего объема. 
                Выход за границы этой зоны = сильное движение.
              </p>
            </div>
          </div>

          {/* Order Flow Delta */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <BarChart2 color="#00d4ff" />
              <span style={styles.cardTitle}>Order Flow Delta</span>
            </div>
            <div style={styles.chartPlaceholder}>
              Дельта = Покупки - Продажи по каждой свече
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Buy Volume (поглощение)</p>
                <p style={{ ...styles.metricValue, color: '#10b981' }}>+452 BTC</p>
              </div>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Sell Volume (продажи)</p>
                <p style={{ ...styles.metricValue, color: '#ef4444' }}>-298 BTC</p>
              </div>
            </div>

            <div style={styles.explanation}>
              <p style={styles.explanationTitle}><Info size={16} /> Как читать:</p>
              <p style={styles.explanationText}>
                <strong>Позитивная дельта</strong> — больше покупок (быки сильнее). 
                Смотри: цена падает, а дельта растет = агрессивное поглощение, разворот вверх.
                <br /><br />
                <strong>Негативная дельта</strong> — больше продаж (медведи сильнее).
                Смотри: цена растет, а дельта падает = слабость, разворот вниз.
              </p>
            </div>
          </div>

          {/* Cumulative Delta */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <TrendingUp color="#00d4ff" />
              <span style={styles.cardTitle}>Cumulative Delta (CVD)</span>
            </div>
            <div style={styles.chartPlaceholder}>
              Накопительная дельта за сессию
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Session Delta</p>
                <p style={{ ...styles.metricValue, color: '#10b981' }}>+154 BTC</p>
              </div>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Delta %</p>
                <p style={styles.metricValue}>+12.4%</p>
              </div>
            </div>

            <div style={styles.explanation}>
              <p style={styles.explanationTitle}><Info size={16} /> Простыми словами:</p>
              <p style={styles.explanationText}>
                CVD — это сумма всей дельты за период. 
                Показывает, кто доминирует в целом: покупатели или продавцы.
                <br /><br />
                <strong>Дивергенция CVD и цены:</strong><br />
                • Цена растет, CVD падает = подделка роста, жди падения<br />
                • Цена падает, CVD растет = подделка падения, жди роста
              </p>
            </div>
          </div>

          {/* Imbalance Zones */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Activity color="#00d4ff" />
              <span style={styles.cardTitle}>Imbalance Zones</span>
            </div>
            <div style={styles.chartPlaceholder}>
              Небаланс = отсутствие противоположных сделок
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Active Imbalances</p>
                <p style={styles.metricValue}>3 зоны</p>
              </div>
              <div style={styles.metric}>
                <p style={styles.metricLabel}>Nearest Zone</p>
                <p style={styles.metricValue}>$70,850</p>
              </div>
            </div>

            <div style={styles.explanation}>
              <p style={styles.explanationTitle}><Info size={16} /> Что такое Imbalance:</p>
              <p style={styles.explanationText}>
                <strong>Небаланс</strong> — это когда цена движется в одном направлении 
                без значительных противоположных сделок. 
                На графике выглядит как 3+ свечи подряд одного цвета без откатов.
                <br /><br />
                <strong>Почему важно:</strong><br />
                Рынок всегда стремится закрыть небаланс. 
                Эти зоны — магниты для цены. 
                Отличные точки для входа при ретесте.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div style={{ ...styles.card, marginTop: '24px' }}>
          <div style={styles.cardHeader}>
            <Activity color="#10b981" />
            <span style={styles.cardTitle}>🎯 Как использовать Footprint в торговле</span>
          </div>          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={styles.explanation}>
              <p style={{ fontWeight: 'bold', color: '#00d4ff', marginBottom: '8px' }}>1. Подтверждение тренда</p>
              <p style={styles.explanationText}>
                CVD растет вместе с ценой = тренд здоровый. 
                Можно держать позицию.
              </p>
            </div>
            
            <div style={styles.explanation}>
              <p style={{ fontWeight: 'bold', color: '#00d4ff', marginBottom: '8px' }}>2. Ловля разворотов</p>
              <p style={styles.explanationText}>
                Цена делает новый максимум, CVD — нет. 
                Дивергенция = сигнал к развороту.
              </p>
            </div>
            
            <div style={styles.explanation}>
              <p style={{ fontWeight: 'bold', color: '#00d4ff', marginBottom: '8px' }}>3. Зоны входа</p>
              <p style={styles.explanationText}>
                Входи в сделку у границ Value Area или 
                на закрытии Imbalance зон.
              </p>
            </div>
            
            <div style={styles.explanation}>
              <p style={{ fontWeight: 'bold', color: '#00d4ff', marginBottom: '8px' }}>4. Подтверждение сигнала</p>
              <p style={styles.explanationText}>
                AI дает сигнал + дельта подтверждает = 
                уверенность выше, можно входить.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
