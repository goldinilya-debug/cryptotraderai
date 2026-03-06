# Trading Bot API
# FastAPI + CCXT для исполнения торговых сигналов

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
import ccxt
import os
import logging
from datetime import datetime
import json
import requests
import threading
import time

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CryptoTraderAI - Trading Bot",
    description="Автоматическое исполнение торговых сигналов",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== КОНФИГУРАЦИЯ ====================
# API ключи берутся из переменных окружения
# BINANCE_API_KEY, BINANCE_API_SECRET
# BYBIT_API_KEY, BYBIT_API_SECRET
# WEBHOOK_SECRET - для защиты вебхуков

EXCHANGE_CONFIG = {
    'bingx': {
        'apiKey': os.getenv('BINGX_API_KEY'),
        'secret': os.getenv('BINGX_API_SECRET'),
        'options': {'defaultType': 'swap'},  # Фьючерсы perpetual
        'sandbox': os.getenv('BINGX_SANDBOX', 'false').lower() == 'true'
    },
    'binance': {
        'apiKey': os.getenv('BINANCE_API_KEY'),
        'secret': os.getenv('BINANCE_API_SECRET'),
        'options': {'defaultType': 'spot'}
    },
    'bybit': {
        'apiKey': os.getenv('BYBIT_API_KEY'),
        'secret': os.getenv('BYBIT_API_SECRET'),
        'options': {'defaultType': 'spot'}
    }
}

# ==================== TELEGRAM УВЕДОМЛЕНИЯ ====================

class TelegramNotifier:
    """Отправка уведомлений в Telegram"""
    
    def __init__(self):
        self.token = os.getenv('TELEGRAM_BOT_TOKEN', '')
        self.chat_id = os.getenv('TELEGRAM_CHAT_ID', '')
        self.enabled = bool(self.token and self.chat_id)
        
    def send_message(self, message: str, parse_mode='HTML'):
        """Отправить сообщение в Telegram"""
        if not self.enabled:
            logger.warning("Telegram not configured")
            return False
            
        try:
            url = f"https://api.telegram.org/bot{self.token}/sendMessage"
            payload = {
                'chat_id': self.chat_id,
                'text': message,
                'parse_mode': parse_mode,
                'disable_web_page_preview': True
            }
            response = requests.post(url, json=payload, timeout=10)
            
            if response.status_code == 200:
                logger.info(f"Telegram message sent: {message[:50]}...")
                return True
            else:
                logger.error(f"Telegram error: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send Telegram: {e}")
            return False
    
    def send_trade_opened(self, pair: str, direction: str, entry: float, amount: float, stop: float = None, take: float = None):
        """Уведомление об открытии сделки"""
        emoji = "🟢" if direction == "LONG" else "🔴"
        message = f"{emoji} <b>СДЕЛКА ОТКРЫТА</b>\n\n"
        message += f"<b>Пара:</b> {pair}\n"
        message += f"<b>Направление:</b> {direction}\n"
        message += f"<b>Вход:</b> ${entry:,.2f}\n"
        message += f"<b>Количество:</b> {amount:.6f}\n"
        if stop:
            message += f"<b>Stop Loss:</b> ${stop:,.2f}\n"
        if take:
            message += f"<b>Take Profit:</b> ${take:,.2f}\n"
        message += f"\n⏳ Ожидаем результат..."
        return self.send_message(message)
    
    def send_trade_closed(self, pair: str, direction: str, entry: float, exit_price: float, pnl: float, status: str):
        """Уведомление о закрытии сделки"""
        emoji = "💰" if pnl > 0 else "🛑"
        pnl_percent = ((exit_price - entry) / entry * 100) if direction == "LONG" else ((entry - exit_price) / entry * 100)
        
        message = f"{emoji} <b>СДЕЛКА ЗАКРЫТА</b>\n\n"
        message += f"<b>Пара:</b> {pair}\n"
        message += f"<b>Направление:</b> {direction}\n"
        message += f"<b>Вход:</b> ${entry:,.2f}\n"
        message += f"<b>Выход:</b> ${exit_price:,.2f}\n"
        message += f"<b>Результат:</b> ${pnl:,.2f} ({pnl_percent:+.2f}%)\n"
        message += f"<b>Статус:</b> {status}"
        return self.send_message(message)
    
    def send_alert(self, title: str, message: str):
        """Срочное уведомление"""
        text = f"⚠️ <b>{title}</b>\n\n{message}"
        return self.send_message(text)

# Инициализация
telegram = TelegramNotifier()

# ==================== МОДЕЛИ ДАННЫХ ====================

class TradingSignal(BaseModel):
    """Торговый сигнал от AI"""
    pair: str = Field(..., example="BTC/USDT")
    direction: Literal["LONG", "SHORT"]
    entry: float = Field(..., example=63500)
    confidence: int = Field(..., ge=0, le=100, example=82)
    stop_loss: Optional[float] = Field(None, example=62000)
    take_profit: Optional[float] = Field(None, example=68000)
    risk_percent: float = Field(2.0, ge=0.1, le=100, example=2.0)
    exchange: Literal["bingx", "binance", "bybit"] = "bingx"
    dry_run: bool = Field(False, description="Тестовый режим без реальных сделок")

class TradeResult(BaseModel):
    """Результат сделки"""
    success: bool
    order_id: Optional[str] = None
    pair: str
    direction: str
    amount: float
    price: float
    status: str
    timestamp: str
    error: Optional[str] = None

class BalanceResponse(BaseModel):
    """Баланс аккаунта"""
    exchange: str
    total_usdt: float
    available_usdt: float
    assets: dict

# ==================== ТОРГОВЫЙ ДВИЖОК ====================

class TradingEngine:
    def __init__(self, exchange_id: str):
        self.exchange_id = exchange_id
        config = EXCHANGE_CONFIG.get(exchange_id, {})
        
        if not config.get('apiKey'):
            raise ValueError(f"API ключ для {exchange_id} не настроен")
        
        self.exchange = getattr(ccxt, exchange_id)({
            'apiKey': config['apiKey'],
            'secret': config['secret'],
            'options': config.get('options', {}),
            'enableRateLimit': True,
        })
        
        logger.info(f"TradingEngine инициализирован для {exchange_id}")
    
    def get_balance(self) -> dict:
        """Получить баланс"""
        balance = self.exchange.fetch_balance()
        usdt = balance.get('USDT', {})
        
        # Собираем все ненулевые позиции
        assets = {}
        for coin, data in balance.get('total', {}).items():
            if data > 0 and coin != 'USDT':
                assets[coin] = data
        
        return {
            'exchange': self.exchange_id,
            'total_usdt': usdt.get('total', 0),
            'available_usdt': usdt.get('free', 0),
            'assets': assets
        }
    
    def calculate_position_size(self, signal: TradingSignal) -> float:
        """Расчёт размера позиции на основе риска"""
        balance = self.get_balance()
        available = balance['available_usdt']
        
        # Риск = процент от доступного баланса
        risk_amount = available * (signal.risk_percent / 100)
        
        # Если есть стоп-лосс, считаем размер позиции от расстояния до SL
        if signal.stop_loss and signal.direction == "LONG":
            sl_distance = abs(signal.entry - signal.stop_loss) / signal.entry
            if sl_distance > 0:
                position_size = risk_amount / sl_distance
            else:
                position_size = risk_amount
        else:
            # Без SL — просто фиксированный риск
            position_size = risk_amount
        
        # Не используем больше 95% доступного баланса
        position_size = min(position_size, available * 0.95)
        
        logger.info(f"Расчёт позиции: доступно ${available:.2f}, риск {signal.risk_percent}%, позиция ${position_size:.2f}")
        return position_size
    
    def execute_signal(self, signal: TradingSignal) -> TradeResult:
        """Исполнить торговый сигнал"""
        try:
            logger.info(f"{'[DRY RUN] ' if signal.dry_run else ''}Получен сигнал: {signal.direction} {signal.pair} @ {signal.entry}")
            
            # Расчёт размера позиции
            position_usdt = self.calculate_position_size(signal)
            amount = position_usdt / signal.entry
            
            # Округляем до допустимого размера лота
            market = self.exchange.market(signal.pair)
            amount = self.exchange.amount_to_precision(signal.pair, amount)
            
            if signal.dry_run:
                # Тестовый режим — не исполняем реальную сделку
                return TradeResult(
                    success=True,
                    order_id="DRY_RUN",
                    pair=signal.pair,
                    direction=signal.direction,
                    amount=float(amount),
                    price=signal.entry,
                    status="SIMULATED",
                    timestamp=datetime.utcnow().isoformat(),
                    error=None
                )
            
            # Определяем сторону сделки
            side = 'buy' if signal.direction == 'LONG' else 'sell'
            
            # Рыночный ордер для быстрого входа
            order = self.exchange.create_market_buy_order(
                symbol=signal.pair,
                amount=float(amount)
            ) if side == 'buy' else self.exchange.create_market_sell_order(
                symbol=signal.pair,
                amount=float(amount)
            )
            
            logger.info(f"Ордер создан: {order['id']}")
            
            # Отправляем уведомление в Telegram
            telegram.send_trade_opened(
                pair=signal.pair,
                direction=signal.direction,
                entry=order.get('average', signal.entry),
                amount=float(amount),
                stop=signal.stop_loss,
                take=signal.take_profit
            )
            
            # TODO: Установить TP/SL отдельными ордерами если указаны
            
            return TradeResult(
                success=True,
                order_id=order['id'],
                pair=signal.pair,
                direction=signal.direction,
                amount=float(amount),
                price=order.get('average', signal.entry),
                status=order['status'],
                timestamp=datetime.utcnow().isoformat(),
                error=None
            )
            
        except Exception as e:
            logger.error(f"Ошибка исполнения: {str(e)}")
            return TradeResult(
                success=False,
                pair=signal.pair,
                direction=signal.direction,
                amount=0,
                price=0,
                status="FAILED",
                timestamp=datetime.utcnow().isoformat(),
                error=str(e)
            )

# ==================== API ENDPOINTS ====================

def verify_webhook_secret(x_webhook_secret: str = Header(None)):
    """Проверка секрета вебхука"""
    expected = os.getenv('WEBHOOK_SECRET')
    if expected and x_webhook_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    return True

@app.get("/")
async def root():
    return {
        "name": "CryptoTraderAI Trading Bot",
        "version": "1.0.0",
        "status": "running",
        "features": ["signal_execution", "risk_management", "multi_exchange"]
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/webhook/signal", response_model=TradeResult)
async def receive_signal(
    signal: TradingSignal,
    authorized: bool = Depends(verify_webhook_secret)
):
    """
    Получить торговый сигнал и исполнить
    
    Пример запроса:
    ```json
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
    """
    try:
        # Автоматическая валидация сигнала
        auto_trading_enabled = os.getenv('AUTO_TRADING_ENABLED', 'false').lower() == 'true'
        
        if auto_trading_enabled and not signal.dry_run:
            # Критерии для автовхода
            criteria_met = []
            
            # 1. Confidence >= 85%
            if signal.confidence >= 85:
                criteria_met.append(f"✅ Confidence: {signal.confidence}%")
            else:
                criteria_met.append(f"❌ Confidence: {signal.confidence}% (need 85%+)")
            
            # 2. R:R >= 1:2
            if signal.take_profit and signal.stop_loss:
                risk = abs(signal.entry - signal.stop_loss)
                reward = abs(signal.take_profit - signal.entry)
                rr_ratio = reward / risk if risk > 0 else 0
                
                if rr_ratio >= 2.0:
                    criteria_met.append(f"✅ R:R = 1:{rr_ratio:.2f}")
                else:
                    criteria_met.append(f"❌ R:R = 1:{rr_ratio:.2f} (need 1:2+)")
            else:
                criteria_met.append("❌ No TP/SL set")
            
            # 3. Риск <= 1%
            if signal.risk_percent <= 1.0:
                criteria_met.append(f"✅ Risk: {signal.risk_percent}%")
            else:
                criteria_met.append(f"❌ Risk: {signal.risk_percent}% (need <=1%)")
            
            # Проверяем все критерии
            all_passed = all('✅' in c for c in criteria_met)
            
            if not all_passed:
                logger.info(f"Auto-trading: Signal rejected\n" + "\n".join(criteria_met))
                return TradeResult(
                    success=False,
                    pair=signal.pair,
                    direction=signal.direction,
                    amount=0,
                    price=0,
                    status="REJECTED",
                    timestamp=datetime.utcnow().isoformat(),
                    error=f"Auto-trading criteria not met:\n" + "\n".join(criteria_met)
                )
            
            logger.info(f"Auto-trading: Signal approved\n" + "\n".join(criteria_met))
        
        engine = TradingEngine(signal.exchange)
        result = engine.execute_signal(signal)
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.error)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Неожиданная ошибка: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/balance/{exchange}", response_model=BalanceResponse)
async def get_balance(exchange: str, authorized: bool = Depends(verify_webhook_secret)):
    """Получить баланс биржи"""
    try:
        engine = TradingEngine(exchange)
        balance = engine.get_balance()
        return BalanceResponse(**balance)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/exchanges")
async def list_exchanges():
    """Список доступных бирж"""
    available = []
    for ex, config in EXCHANGE_CONFIG.items():
        available.append({
            "id": ex,
            "name": ex.capitalize(),
            "configured": bool(config.get('apiKey')),
            "testnet": config.get('options', {}).get('testnet', False)
        })
    return {"exchanges": available}


# ==================== TELEGRAM ENDPOINTS ====================

@app.get("/telegram/status")
async def telegram_status():
    """Статус подключения Telegram"""
    return {
        "enabled": telegram.enabled,
        "token_configured": bool(telegram.token),
        "chat_id_configured": bool(telegram.chat_id),
        "chat_id": telegram.chat_id if telegram.chat_id else None
    }


@app.post("/telegram/test")
async def telegram_test(authorized: bool = Depends(verify_webhook_secret)):
    """Отправить тестовое сообщение в Telegram"""
    if not telegram.enabled:
        raise HTTPException(status_code=400, detail="Telegram not configured")
    
    success = telegram.send_message(
        "🤖 <b>CryptoTraderAI Bot</b>\n\n"
        "✅ Подключение успешно!\n"
        "Я готов отправлять уведомления о сделках.\n\n"
        "📊 Жду сигналов..."
    )
    
    if success:
        return {"success": True, "message": "Test message sent"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test message")


@app.post("/telegram/set-chat-id")
async def set_telegram_chat_id(chat_id: str, authorized: bool = Depends(verify_webhook_secret)):
    """Установить Chat ID для Telegram"""
    os.environ['TELEGRAM_CHAT_ID'] = chat_id
    telegram.chat_id = chat_id
    telegram.enabled = bool(telegram.token and telegram.chat_id)
    
    # Отправляем тестовое сообщение
    if telegram.enabled:
        telegram.send_message(f"✅ Chat ID установлен: {chat_id}")
    
    return {"success": True, "chat_id": chat_id, "enabled": telegram.enabled}


# ==================== ЗАПУСК ====================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)