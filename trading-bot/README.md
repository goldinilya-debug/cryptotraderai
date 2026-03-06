# Trading Bot для CryptoTraderAI

Автоматическое исполнение торговых сигналов через API бирж.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/goldinilya-debug/cryptotraderai&root-dir=trading-bot)

## Поддерживаемые биржи

- ✅ **BingX** (рекомендуется, есть демо-режим)
- ✅ **Binance** (основная / тестнет)
- ✅ **Bybit** (основная / тестнет)

## Быстрый старт с BingX

### 1. Создай демо-счет на BingX

1. Зарегистрируйся: https://bingx.com
2. Перейди в **API Management**: https://bingx.com/en/account/api/
3. Создай API ключ:
   - **Name**: CryptoTraderAI-Bot
   - **Permissions**: ✅ Read, ✅ Spot Trading
   - **IP Whitelist**: оставь пустым (или укажешь после деплоя)
   - ❌ **НЕ включай вывод средств!**

4. Сохрани:
   - `API Key`
   - `API Secret`

### 2. Переключись на демо-режим

В настройках API BingX есть переключатель **"Demo Trading"** — включи его.

### 3. Настрой бота

Создай файл `.env`:

```env
# BingX (демо или реальный)
BINGX_API_KEY=your_bingx_api_key
BINGX_API_SECRET=your_bingx_secret

# Защита вебхуков (обязательно)
WEBHOOK_SECRET=your_secret_key_here

# Порт сервера
PORT=8000
```

### 4. Локальный запуск

```bash
cd trading-bot
pip install -r requirements.txt
python main.py
```

Проверь работу:
```bash
curl http://localhost:8000/health
```

### 5. Деплой на Railway (рекомендуется)

```bash
# Установи Railway CLI
npm install -g @railway/cli

# Залогинься
railway login

# Создай проект
cd trading-bot
railway init

# Добавь переменные окружения
railway variables set BINGX_API_KEY=xxx
railway variables set BINGX_API_SECRET=xxx
railway variables set WEBHOOK_SECRET=your_secret

# Деплой
railway up
```

После деплоя получи URL: `https://your-bot.up.railway.app`

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
    "exchange": "bingx",
    "dry_run": false
}
```

### Проверить баланс

```bash
GET /balance/bingx
X-Webhook-Secret: your_secret
```

### Проверить статус

```bash
GET /health
```

### Список настроенных бирж

```bash
GET /exchanges
```

## Риск-менеджмент

- `risk_percent` — сколько % от баланса рисковать (по умолчанию 2%)
- Если указан `stop_loss`, размер позиции рассчитывается от расстояния до SL
- Максимум 95% доступного баланса используется для одной сделки
- `dry_run: true` — тестовый режим без реальных сделок

## Интеграция с CryptoTraderAI

Я буду отправлять сигналы на webhook твоего бота.

**Настрой в нашем бэкенде:**
1. Открой `https://cryptotraderai.app/settings`
2. Включи "Авто-торговля"
3. Укажи Webhook URL: `https://your-bot.up.railway.app/webhook/signal`
4. Укажи Webhook Secret
5. Выбери биржу: BingX

## Безопасность ⚠️

1. **WEBHOOK_SECRET** — обязателен для защиты от случайных запросов
2. **API ключи** — только SPOT торговля, без вывода средств
3. **Начни с демо** — убедись что всё работает
4. **IP whitelist** — настрой на BingX после деплоя

## Переход на реальный счет

Когда будешь готов:
1. Создай новый API ключ на BingX
2. **Отключи** Demo Trading
3. Обнови переменные `BINGX_API_KEY` и `BINGX_API_SECRET`
4. Перезапусти бота
5. Начни с малого (risk_percent: 1%)

---

**Готов помочь с настройкой!** Скинь мне API ключи (или создай временные) — я настрою всё сам. ❤️‍🔥
