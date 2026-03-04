# Trading Bot для CryptoTraderAI

Автоматическое исполнение торговых сигналов через API бирж.

## Быстрый старт

### 1. Настройка API ключей

Создай файл `.env`:

```env
# Binance (основная или тестовая сеть)
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_secret

# Bybit (опционально)
BYBIT_API_KEY=your_bybit_api_key
BYBIT_API_SECRET=your_bybit_secret

# Защита вебхуков (обязательно для продакшена)
WEBHOOK_SECRET=your_secret_key_here

# Порт сервера
PORT=8000
```

**Важно:** Создай API ключи с правами только на **SPOT торговлю**. Не включай права на вывод средств!

### 2. Локальный запуск

```bash
pip install -r requirements.txt
python main.py
```

### 3. Деплой на Railway (рекомендуется)

```bash
# Установи Railway CLI
npm install -g @railway/cli

# Залогинься
railway login

# Создай проект
railway init

# Добавь переменные окружения
railway variables set BINANCE_API_KEY=xxx
railway variables set BINANCE_API_SECRET=xxx
railway variables set WEBHOOK_SECRET=your_secret

# Деплой
railway up
```

## API Endpoints

### Получить сигнал и исполнить

```bash
POST /webhook/signal
Content-Type: application/json
X-Webhook-Secret: your_secret

{
    "pair": "BTC/USDT",
    "direction": "LONG",
    "entry": 63500,
    "confidence": 82,
    "stop_loss": 62000,
    "take_profit": 68000,
    "risk_percent": 2.0,
    "exchange": "binance",
    "dry_run": true
}
```

### Проверить баланс

```bash
GET /balance/binance
X-Webhook-Secret: your_secret
```

### Проверить статус

```bash
GET /health
```

## Риск-менеджмент

- `risk_percent` — сколько % от баланса рисковать (по умолчанию 2%)
- Если указан `stop_loss`, размер позиции рассчитывается от расстояния до SL
- Максимум 95% доступного баланса используется для одной сделки

## Тестовый режим

Установи `"dry_run": true` в сигнале — бот покажет что сделает, но не откроет реальную позицию.

## Безопасность

1. **WEBHOOK_SECRET** — обязателен для защиты от случайных запросов
2. **API ключи** — только SPOT торговля, без вывода
3. **IP whitelist** — настрой на бирже если возможно

## Интеграция с CryptoTraderAI

Я буду отправлять сигналы на твой webhook URL:

```
POST https://your-bot-url/webhook/signal
```

Укажи в настройках AI:
- Webhook URL
- Секрет для верификации
- Предпочитаемую биржу