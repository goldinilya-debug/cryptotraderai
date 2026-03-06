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
        'options': {'defaultType': 'spot'},
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

# ==================== ЗАПУСК ====================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)