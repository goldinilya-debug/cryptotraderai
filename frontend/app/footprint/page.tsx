'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Activity, BarChart3, Layers, TrendingUp, Clock, DollarSign } from 'lucide-react'

export default function FootprintPage() {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [timeframe, setTimeframe] = useState('1H')
  const [orderBook, setOrderBook] = useState<any>(null)
  const [clusters, setClusters] = useState<any[]>([])
  const [delta, setDelta] = useState(0)

  // Simulated footprint data
  useEffect(() => {
    const generateFootprint = () => {
      const basePrice = selectedPair === 'BTC/USDT' ? 68726 : 3450
      const newClusters = []
      let cumulativeDelta = 0
      
      for (let i = 0; i < 20; i++) {
        const price = basePrice - (i * (selectedPair === 'BTC/USDT' ? 50 : 2.5))
        const bidVolume = Math.floor(Math.random() * 100) + 50
        const askVolume = Math.floor(Math.random() * 100) + 50
        const clusterDelta = bidVolume - askVolume
        cumulativeDelta += clusterDelta
        
        newClusters.push({
          price: price,
          bidVolume,
          askVolume,
          delta: clusterDelta,
          totalVolume: bidVolume + askVolume,
          poc: bidVolume + askVolume > 150 // Point of Control
        })
      }
      
      setClusters(newClusters.reverse())
      setDelta(cumulativeDelta)
      
      setOrderBook({
        bidDepth: Math.floor(Math.random() * 500) + 200,
        askDepth: Math.floor(Math.random() * 500) + 200,
        bidWall: basePrice - (selectedPair === 'BTC/USDT' ? 200 : 10),
        askWall: basePrice + (selectedPair === 'BTC/USDT' ? 200 : 10),
        spread: selectedPair === 'BTC/USDT' ? 0.5 : 0.02
      })
    }
    
    generateFootprint()
    const interval = setInterval(generateFootprint, 5000)
    return () => clearInterval(interval)
  }, [selectedPair, timeframe])

  const getDeltaColor = (d: number) => d > 0 ? '#10b981' : d < 0 ? '#ef4444' : '#6b7280'
  const getVolumeColor = (bid: number, ask: number) => bid > ask ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: '#00d4ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ArrowLeft size={20} /> Назад
        </Link>
        <h1 style={{ margin: '0', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={32} color="#00d4ff" />
          Footprint Графики
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Анализ объемов, кластеров и дельты</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select 
          value={selectedPair} 
          onChange={(e) => setSelectedPair(e.target.value)}
          style={{ background: '#13131f', border: '1px solid #2a2a3e', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontSize: '16px' }}
        >
          <option value="BTC/USDT">BTC/USDT</option>
          <option value="ETH/USDT">ETH/USDT</option>
          <option value="SOL/USDT">SOL/USDT</option>
        </select>
        
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          style={{ background: '#13131f', border: '1px solid #2a2a3e', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontSize: '16px' }}
        >
          <option value="1M">1 минута</option>
          <option value="5M">5 минут</option>
          <option value="15M">15 минут</option>
          <option value="1H">1 час</option>
        </select>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#6b7280' }}>
            <TrendingUp size={20} />
            <span>Дельта</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: getDeltaColor(delta) }}>
            {delta > 0 ? '+' : ''}{delta}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {delta > 0 ? 'Покупатели доминируют' : delta < 0 ? 'Продавцы доминируют' : 'Баланс'}
          </div>
        </div>

        <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#6b7280' }}>
            <Layers size={20} />
            <span>POC (Point of Control)</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00d4ff' }}>
            ${clusters.find(c => c.poc)?.price?.toLocaleString() || '-'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Максимальный объем
          </div>
        </div>

        <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#6b7280' }}>
            <BarChart3 size={20} />
            <span>Объем профиль</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {clusters.reduce((sum, c) => sum + c.totalVolume, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Общий объем
          </div>
        </div>

        <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#6b7280' }}>
            <DollarSign size={20} />
            <span>Стены ликвидности</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            <span style={{ color: '#10b981' }}>Bid: {orderBook?.bidDepth}</span>
            <span style={{ color: '#6b7280', margin: '0 8px' }}>/</span>
            <span style={{ color: '#ef4444' }}>Ask: {orderBook?.askDepth}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Глубина стакана
          </div>
        </div>
      </div>

      {/* Footprint Chart */}
      <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={20} color="#00d4ff" />
          Кластерный анализ
        </h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '12px', color: '#6b7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.5)', borderRadius: '2px' }}></span>
            Bid (покупки)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.5)', borderRadius: '2px' }}></span>
            Ask (продажи)
          </span>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {clusters.map((cluster, idx) => (
            <div 
              key={idx}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '80px 1fr 1fr 60px', 
                gap: '8px', 
                padding: '8px 12px',
                borderBottom: '1px solid #1c1c2e',
                background: cluster.poc ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                borderLeft: cluster.poc ? '3px solid #f59e0b' : '3px solid transparent'
              }}
            >
              <span style={{ fontFamily: 'monospace', color: cluster.poc ? '#f59e0b' : '#fff' }}>
                ${cluster.price.toLocaleString()}
                {cluster.poc && <span style={{ marginLeft: '4px' }}>★</span>}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ 
                  height: '20px', 
                  background: 'rgba(16, 185, 129, 0.5)', 
                  width: `${(cluster.bidVolume / 150) * 100}%`,
                  borderRadius: '2px',
                  minWidth: '20px'
                }}></div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{cluster.bidVolume}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ 
                  height: '20px', 
                  background: 'rgba(239, 68, 68, 0.5)', 
                  width: `${(cluster.askVolume / 150) * 100}%`,
                  borderRadius: '2px',
                  minWidth: '20px'
                }}></div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{cluster.askVolume}</span>
              </div>
              
              <span style={{ 
                fontSize: '12px', 
                color: getDeltaColor(cluster.delta),
                fontWeight: 'bold',
                textAlign: 'right'
              }}>
                {cluster.delta > 0 ? '+' : ''}{cluster.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div style={{ background: '#13131f', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3e' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#00d4ff' }}>🎓 Как читать Footprint</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Дельта (Delta)</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' }}>
              Разница между покупками и продажами. Положительная дельта = давление покупателей, 
              отрицательная = давление продавцов.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>POC (Point of Control)</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' }}>
              Уровень с максимальным объемом. Зона сильного интереса участников рынка. 
              Часто работает как поддержка/сопротивление.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#00d4ff' }}>Кластеры</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' }}>
              Объемы на конкретных ценовых уровнях. Показывают где "умные деньги" 
              набирали позиции или разгружали.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#0a0a0f', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>Стены ликвидности</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' }}>
              Крупные заявки в стакане. Могут остановить движение цены 
              или стать целью для сбора ликвидности.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
