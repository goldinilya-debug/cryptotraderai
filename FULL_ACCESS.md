# 🔐 ПОЛНЫЙ ДОСТУП К КОДУ - CryptoTraderAI

## 📁 Структура проекта

```
cryptotraderai/
├── 📱 frontend/              # Next.js 14 + React (GitHub Pages)
│   ├── app/                  # Страницы приложения
│   │   ├── dashboard/        # Главный дашборд
│   │   ├── signals/          # Сигналы
│   │   ├── screener/         # Скринер
│   │   ├── analysis/         # Анализ
│   │   ├── killzones/        # Kill Zones
│   │   ├── fibzones/         # Fib Zones
│   │   ├── backtest/         # Бэктест
│   │   ├── stats/            # Статистика
│   │   ├── strategy/         # Конструктор стратегий
│   │   ├── sniper/           # SMC Sniper
│   │   ├── footprint/        # Footprint
│   │   ├── smc-analysis/     # SMC Real-Time (новое)
│   │   ├── ml/               # ML Model
│   │   ├── tradingview/      # TradingView
│   │   ├── telegram/         # Telegram интеграция
│   │   └── profile/          # Профиль
│   ├── components/           # React компоненты
│   │   ├── Sidebar.tsx       # Боковое меню
│   │   ├── TradingDashboard.tsx
│   │   ├── SignalAnalysisCard.tsx
│   │   ├── StrategyBuilder.tsx
│   │   └── ...
│   └── package.json
│
├── 🔧 backend/               # FastAPI (Render)
│   ├── app/
│   │   ├── main.py           # Главный файл API
│   │   ├── routers/          # API endpoints
│   │   │   ├── signals.py
│   │   │   ├── analysis.py
│   │   │   ├── auth.py
│   │   │   └── ...
│   │   └── services/         # Бизнес-логика
│   │       ├── signal_generator_dynamic.py
│   │       ├── telegram_service.py
│   │       ├── market_data.py
│   │       └── ...
│   └── requirements.txt
│
├── 🤖 trading-bot/           # Бот для торговли
│   ├── main.py               # Основной бот
│   ├── smc_bot.py            # SMC FVG детектор
│   └── README.md
│
├── 🧠 ml-system/             # ML модели
│   └── api/
│       └── main.py
│
└── local_signal_generator.py # Локальный генератор (наш)
```

---

## 🔑 Ключи и доступы

### Telegram Bot
- **Токен:** `7783653948:AAFoDMKp6moop6m3LdyUYm_xb6i-_uN8y1I`
- **Имя бота:** @G1234N_Bot
- **Chat ID:** 4207488

### API Endpoints
- **Frontend:** https://cryptotraderai.app
- **Backend:** https://cryptotraderai-api.onrender.com
- **Local Backend:** http://localhost:8000

---

## 🚀 Запуск компонентов

### 1. Frontend (GitHub Pages)
```bash
cd /root/.openclaw/workspace/cryptotraderai/frontend
npm install
npm run build
# Деплой: git push origin gh-pages
```

### 2. Backend (Render / Local)
```bash
cd /root/.openclaw/workspace/cryptotraderai/backend
export TELEGRAM_BOT_TOKEN="7783653948:AAFoDMKp6moop6m3LdyUYm_xb6i-_uN8y1I"
export TELEGRAM_CHAT_ID="4207488"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Signal Generator (Systemd)
```bash
# Статус
systemctl status cryptotraderai-signals

# Управление
systemctl start cryptotraderai-signals
systemctl stop cryptotraderai-signals
systemctl restart cryptotraderai-signals
```

---

## 📊 Данные

### Сигналы хранятся в:
- **API (Render):** `current_signal` dict в памяти
- **Telegram:** Отправляются как сообщения
- **История:** `trade_history` list (последние 50)

### Где что лежит:
```python
# Backend: /update_signal (POST)
{
  "type": "BULLISH_FVG",
  "entry": 67095.00,
  "sl": 65100.00,
  "tp": 71200.00,
  "probability": "85%",
  "symbol": "BTC/USDT"
}

# Frontend: /analyze (GET)
{
  "setup": {...},
  "current_price": 67095,
  "history": [],
  "symbol": "BTC/USDT"
}
```

---

## ⚙️ Конфигурация

### Cron Jobs (Пинг Render)
```
Каждые 10 мин: curl -s https://cryptotraderai-api.onrender.com/health
```

### Systemd Service
```
/etc/systemd/system/cryptotraderai-signals.service
```

### Git
- **Репозиторий:** https://github.com/goldinilya-debug/cryptotraderai
- **Ветки:** main, gh-pages

---

## 🔧 Отладка

### Логи:
```bash
# Генератор сигналов
tail -f /tmp/signals.log

# Backend (если локально)
tail -f /tmp/backend.log

# Systemd
journalctl -u cryptotraderai-signals -f
```

### Проверка процессов:
```bash
ps aux | grep signal_generator
ps aux | grep uvicorn
systemctl status cryptotraderai-signals
```

---

## 📝 Важные файлы

| Файл | Назначение |
|------|-----------|
| `frontend/components/Sidebar.tsx` | Меню навигации |
| `frontend/app/smc-analysis/page.tsx` | Новая страница SMC |
| `backend/app/main.py` | API endpoints |
| `backend/app/services/telegram_service.py` | Отправка в Telegram |
| `local_signal_generator.py` | Локальный генератор |
| `.github/workflows/deploy.yml` | Авто-деплой |

---

## 🔄 Рабочий процесс

1. **Frontend** → GitHub Pages (авто-деплой из gh-pages)
2. **Backend** → Render (просыпается от пинга)
3. **Generator** → Local server (systemd, авто-запуск)
4. **Telegram** → @G1234N_Bot (уведомления)

---

## 💡 Быстрые команды

```bash
# Перезапустить генератор
sudo systemctl restart cryptotraderai-signals

# Проверить статус
sudo systemctl status cryptotraderai-signals

# Посмотреть логи генератора
tail -f /tmp/signals.log

# Отправить тестовый сигнал
curl -X POST "https://cryptotraderai-api.onrender.com/update_signal" \
  -H "Content-Type: application/json" \
  -d '{"type":"BULLISH_FVG","entry":67000,"sl":65000,"tp":71000,"probability":"85%","symbol":"BTC/USDT"}'
```

---

**Всё готово! Полный доступ предоставлен.** 🔓
