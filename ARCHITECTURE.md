# CryptoTraderAI - Архитектура Системы

## Общая Схема

```
┌─────────────────────────────────────────────────────────────────┐
│                        ПОЛЬЗОВАТЕЛЬ                            │
│                     (Ты + Твой телефон)                        │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  TELEGRAM BOT (@cryptotraderai_yourname_bot)                   │
│  • Уведомления о сделках                                       │
│  • Команды управления (/status, /close, /stop)                │
│  • Алерты от AI                                                │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                          │
│                    https://cryptotraderai.app                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Dashboard    │  │ Sniper       │  │ Settings     │        │
│  │ (сигналы)    │  │ (SMC скан)   │  │ (ML настройки)│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ SignalAnalysisCard (с разбором Wyckoff/SMC/Fibo)      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────────────────────────┘
           │ HTTP API
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND API (FastAPI)                          │
│              https://cryptotraderai-api.onrender.com           │
│                                                                 │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ ML Model     │  │ Signals  │  │ Analysis │  │ Trading  │  │
│  │ (7 факторов) │  │ Generator│  │ Engine   │  │ Config   │  │
│  └──────────────┘  └──────────┘  └──────────┘  └──────────┘  │
└──────────┬──────────────────────────────────────────────────────┘
           │ Webhook
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                TRADING BOT (FastAPI + CCXT)                    │
│              https://cryptotraderai-bot.loca.lt                │
│                                                                 │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐     │
│  │ Auto-Trading   │  │ Risk Manager │  │ Telegram       │     │
│  │ (validation)   │  │ (0.5% risk)  │  │ Notifier       │     │
│  └────────────────┘  └──────────────┘  └────────────────┘     │
│                                                                 │
│  Connection: BingX API (Real Account)                          │
│  Balance: 565.78 USDT                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BINGX EXCHANGE                             │
│                      (Real Money)                              │
│                                                                 │
│  • Spot/Futures Trading                                        │
│  • Demo Mode Available                                         │
│  • API Keys: Configured                                        │
└─────────────────────────────────────────────────────────────────┘


## DATA FLOW (Поток данных)

### 1. Генерация Сигнала
```
Binance API (цены) 
    ↓
Backend API (ML Model) → AI Confidence Score
    ↓
Signal Object {
    pair: "BTC/USDT",
    direction: "LONG",
    entry: 70000,
    stopLoss: 68000,
    takeProfit1: 73000,
    confidence: 87,
    wyckoffPhase: "accumulation",
    killZone: "London",
    analysis: {...}
}
    ↓
Frontend (отображение карточки)
```

### 2. Авто-Торговля
```
Signal Generated
    ↓
Trading Bot получает webhook
    ↓
Валидация (3 фильтра):
  ✓ Confidence >= 85%
  ✓ R:R >= 1:2
  ✓ Risk <= 0.5%
    ↓
Исполнение на BingX
    ↓
Telegram уведомление:
  "🟢 СДЕЛКА ОТКРЫТА
   BTC/USDT LONG @ $70,000
   Stop: $68,000 | TP: $73,000
   Risk: 0.5% ($2.83)"
```

### 3. Мониторинг и Закрытие
```
Position Open
    ↓
Каждые 30 сек:
  • Проверка текущей цены
  • Проверка достижения TP/SL
    ↓
TP или SL достигнут
    ↓
Закрытие позиции
    ↓
Telegram уведомление:
  "💰 СДЕЛКА ЗАКРЫТА
   Прибыль: +$5.60 (+2.8%)
   Итоговый баланс: $571.38"
```


## КОМПОНЕНТЫ СВЯЗИ

### API Endpoints

**Frontend ↔ Backend:**
```
GET  /api/signals          → Список активных сигналов
POST /api/signals/generate → Сгенерировать новый сигнал
GET  /api/performance      → Статистика торговли
```

**Backend ↔ Trading Bot:**
```
POST /webhook/signal       → Отправить сигнал на исполнение
GET  /balance/{exchange}   → Баланс биржи
POST /telegram/test        → Тест Telegram
```

**Trading Bot ↔ BingX:**
```
CCXT Library (REST API)
• create_order()
• fetch_balance()
• fetch_positions()
```

**Telegram Bot API:**
```
POST /sendMessage
• Уведомления о сделках
• Команды от пользователя
```


## AI АССИСТЕНТ (МОЗГ СИСТЕМЫ)

### Роли AI

**1. Signal Analyzer**
- Анализирует рыночные данные
- Определяет фазу Wyckoff
- Ищет SMC структуры
- Рассчитывает зоны Фибоначчи

**2. Trade Validator**
- Проверяет сигнал перед входом
- Убеждается в соответствии критериям
- Оценивает риск

**3. Educational Assistant**
- Объясняет почему вход
- Разбирает ошибки
- Обучает трейдингу

**4. Market Watcher**
- Следит за ценами 24/7
- Отправляет алерты
- Предупреждает о важных событиях


## БУДУЩИЕ ИНТЕГРАЦИИ

### Phase 2: TradingView
```
TradingView Chart
    ↓
Alert (webhook)
    ↓
Our Backend
    ↓
Trading Bot
    ↓
Telegram: "Сигнал из TV исполнен"
```

### Phase 3: Footprint
```
Binance Order Book
    ↓
Footprint Analyzer
    ↓
Heatmap on Frontend
    ↓
AI: "Крупный игрок покупает на $69,800"
```

### Phase 4: News Aggregator
```
Twitter/X API
CoinDesk RSS
Whale Alert
    ↓
News Processor
    ↓
Impact Analyzer
    ↓
Telegram: "🔴 Важно: SEC одобрил ETF"
```


## БЕЗОПАСНОСТЬ И КОНТРОЛЬ

### Проверки перед сделкой:
1. **AI Validation**: Confidence >= 85%
2. **Risk Check**: Max 0.5% баланса
3. **R:R Check**: Min 1:2
4. **Human Confirm**: Для реальных счетов

### Мониторинг:
- Каждые 30 сек: Проверка цен
- Каждые 5 мин: Health check бота
- Каждый час: Резервное копирование

### Экстренная остановка:
- Команда `/stop` в Telegram
- Кнопка "Emergency Close" на сайте
- Авто-остановка при просадке >5%


## КОМАНДЫ УПРАВЛЕНИЯ

### Telegram Commands:
```
/status     → Баланс и открытые позиции
/close      → Закрыть все позиции
/stop       → Остановить авто-торговлю
/start      → Возобновить
/balance    → Текущий баланс
/signals    → Активные сигналы
/help       → Список команд
```


## ИТОГОВАЯ СВЯЗЬ

```
ПОЛЬЗОВАТЕЛЬ
    ↕ Telegram
FRONTEND (сайт)
    ↕ HTTP API
BACKEND (AI + ML)
    ↕ Webhook
TRADING BOT
    ↕ CCXT API
BINGX (реальные деньги)

Все компоненты связаны двунаправленно.
Любое действие отражается во всех интерфейсах.
```

**Всё работает как единый организм.** 🤖❤️‍🔥
