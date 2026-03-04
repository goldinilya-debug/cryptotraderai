# CryptoTraderAI ML System

## Архитектура

```
ml-system/
├── data/                    # Работа с данными
│   ├── fetcher.py          # Сбор OHLCV с бирж
│   ├── database.py         # PostgreSQL/ClickHouse
│   └── features.py         # Feature engineering
├── models/                  # ML модели
│   ├── base_model.py       # Базовая supervised модель
│   ├── signal_generator.py # Генерация сигналов
│   └── rl_agent.py         # RL агент (опционально)
├── trading/                 # Торговая логика
│   ├── risk_manager.py     # Риск-менеджмент
│   ├── position_sizer.py   # Расчёт размера позиции
│   └── performance.py      # Метрики и PnL
├── api/                     # API сервис
│   ├── main.py             # FastAPI приложение
│   └── websocket.py        # WebSocket для real-time
└── monitoring/              # Мониторинг
    ├── dashboard.py        # Панель метрик
    └── alerts.py           # Алерты
```

## Компоненты

### 1. Data Fetcher
- Bybit API (основной)
- Binance API (бэкап)
- Интервалы: 5m, 15m, 1h, 4h
- Авто-обновление каждые 5 минут

### 2. Feature Engineering
- Технические индикаторы: RSI, MACD, EMA, VWAP, ATR
- Признаки: доходности, волатильность, объём, спред
- Sliding window: 50-200 баров

### 3. ML Model
- XGBoost/LightGBM для начала
- Вход: окно признаков
- Выход: вероятность up/down + expected return
- Retrain: ежедневно на новых данных

### 4. Signal Generator
- Правила: buy/sell/hold
- Threshold: 0.6 для сигнала
- Фильтры: комиссия, спред, волатильность

### 5. Risk Manager
- Риск на сделку: 1-2%
- Position sizing: от стопа и риска
- Max exposure, leverage limits
- Daily/weekly drawdown limits

### 6. API
- REST: GET /signal/{symbol}/{timeframe}
- WebSocket: real-time streaming
- Формат: JSON с side, size, entry, stop, tp, confidence

## Запуск

```bash
docker-compose up -d
```

## Roadmap

1. **MVP (неделя 1)**: Data fetcher + базовая модель + API
2. **Alpha (неделя 2)**: Risk manager + backtesting
3. **Beta (неделя 3)**: Self-learning + monitoring
4. **Production (неделя 4)**: RL agent + оптимизация