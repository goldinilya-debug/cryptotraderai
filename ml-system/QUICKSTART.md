# 🎯 БЫСТРЫЙ СТАРТ ML СИСТЕМЫ

## Что создано:

### ✅ Компоненты:
1. **Data Fetcher** — сбор OHLCV с Bybit/Binance
2. **Feature Engineering** — 20+ признаков (RSI, MACD, ATR, VWAP, OBV)
3. **ML Model** — взвешенная модель с обучением
4. **Signal Generator** — генерация сигналов с риск-менеджментом
5. **API** — REST + WebSocket для бота
6. **Self-learning** — feedback loop для обучения

## 🚀 Запуск:

```bash
cd ml-system
./start.sh
```

## 📡 API Endpoints:

### Получить сигнал:
```bash
curl http://localhost:8000/signal/BTCUSDT/1h?balance=10000
```

### Ответ:
```json
{
  "signal": {
    "symbol": "BTCUSDT",
    "side": "buy",
    "entry": {"price": 72650, "zone": [72288, 73012]},
    "stop_loss": 70471,
    "take_profit": {"tp1": 76316, "tp2": 79982},
    "position": {"size_usd": 200, "leverage": 1, "risk_percent": 2},
    "metadata": {"confidence": 0.72, "risk_reward": 2.0}
  }
}
```

## 🎓 Как обучать модель:

### 1. Отправь сигнал боту:
```bash
curl http://localhost:8000/signal/BTCUSDT/1h
```

### 2. После сделки отправь результат:
```bash
curl -X POST http://localhost:8000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "signal_id": "BTCUSDT_20250305_120000",
    "outcome": "WIN",
    "pnl": 150.50
  }'
```

### 3. Модель автоматически:
- Пересчитает веса признаков
- Обновит параметры
- Сохранит новую версию

### 4. Проверь статистику:
```bash
curl http://localhost:8000/stats
```

## 📊 Фичи модели:

| Признак | Вес | Описание |
|---------|-----|----------|
| Trend | 20% | EMA 10/20/50 |
| Support/Resistance | 20% | Bollinger Bands, VWAP |
| RSI | 15% | Перекупленность/перепроданность |
| MACD | 15% | Пересечения и гистограмма |
| Volume | 15% | Объём относительно среднего |
| Volatility | 15% | ATR и сжатие |

## 🔄 Self-Learning:

1. **Собирай данные** — каждый сигнал логируется
2. **Отправляй feedback** — WIN/LOSS + PnL
3. **Модель адаптируется** — веса корректируются
4. **Улучшай точность** — чем больше данных, тем лучше

## 🎯 Риск-менеджмент:

- **Риск на сделку**: 1-2% (настраивается)
- **Макс позиция**: $1000 (лимит)
- **R:R минимум**: 1:1.5
- **Max leverage**: 1x (по умолчанию)
- **Drawdown limit**: 5% дневной

## 🛠️ Интеграция с твоим ботом:

```python
import requests

# Получить сигнал
response = requests.get("http://localhost:8000/signal/BTCUSDT/1h")
signal = response.json()['signal']

if signal and signal['side'] != 'hold':
    # Отправить в твой бот
    your_bot.execute_trade(
        symbol=signal['symbol'],
        side=signal['side'],
        entry=signal['entry']['price'],
        stop=signal['stop_loss'],
        tp=signal['take_profit']['tp1'],
        size=signal['position']['size_usd']
    )
    
    # Сохранить ID для feedback
    signal_id = signal['id']
    
# После закрытия сделки
requests.post("http://localhost:8000/feedback", json={
    "signal_id": signal_id,
    "outcome": "WIN",  # или "LOSS"
    "pnl": 150.50
})
```

## 📈 Метрики:

Система отслеживает:
- Accuracy по направлению
- Win rate по парам
- Average PnL
- Sharpe ratio
- Max drawdown
- Feature importance

## 🚀 Roadmap:

- [x] MVP: Базовая модель + API
- [ ] RL Agent: Обучение с подкреплением
- [ ] Backtesting: Тестирование на истории
- [ ] Paper Trading: Тест без реальных денег
- [ ] Live Trading: Подключение к бирже

## 📞 Поддержка:

Смотри логи:
```bash
docker-compose logs -f ml-api
```