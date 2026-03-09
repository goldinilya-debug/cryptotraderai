"""
TradingView Webhook Integration
Получение сигналов от TradingView алертов и передача их на исполнение
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import os
import logging
import requests

logger = logging.getLogger(__name__)

router = APIRouter()

# ==================== МОДЕЛИ ДАННЫХ ====================

class TradingViewAlert(BaseModel):
    """Формат webhook от TradingView"""
    symbol: str = Field(..., example="BTCUSDT", description="Торговая пара (например, BTCUSDT)")
    side: Literal["buy", "sell", "long", "short"] = Field(..., example="buy", description="Сторона сделки")
    price: float = Field(..., example=70000, description="Цена входа")
    strategy: str = Field(..., example="my_strategy", description="Название стратегии")
    quantity: Optional[float] = Field(None, description="Количество (опционально)")
    stop_loss: Optional[float] = Field(None, description="Стоп-лосс (опционально)")
    take_profit: Optional[float] = Field(None, description="Тейк-профит (опционально)")
    timeframe: Optional[str] = Field(None, description="Таймфрейм (опционально)")
    message: Optional[str] = Field(None, description="Сообщение от стратегии")

class TradingViewResponse(BaseModel):
    """Ответ на webhook от TradingView"""
    success: bool
    message: str
    order_id: Optional[str] = None
    symbol: str
    side: str
    timestamp: str
    error: Optional[str] = None

class TradingViewStatus(BaseModel):
    """Статус интеграции TradingView"""
    enabled: bool
    webhook_url: str
    secret_configured: bool
    trading_bot_url: str
    last_signal: Optional[dict] = None

# ==================== КОНФИГУРАЦИЯ ====================

TRADINGVIEW_WEBHOOK_SECRET = os.getenv('TRADINGVIEW_WEBHOOK_SECRET', '')
TRADING_BOT_URL = os.getenv('TRADING_BOT_URL', 'http://localhost:8001')
AUTO_TRADING_ENABLED = os.getenv('AUTO_TRADING_ENABLED', 'false').lower() == 'true'

# Список разрешённых стратегий (пустой = все разрешены)
ALLOWED_STRATEGIES = os.getenv('ALLOWED_STRATEGIES', '').split(',') if os.getenv('ALLOWED_STRATEGIES') else []

# ==================== ВАЛИДАЦИЯ ====================

def verify_tradingview_secret(x_webhook_secret: Optional[str] = Header(None)):
    """Проверка секрета TradingView webhook"""
    if not TRADINGVIEW_WEBHOOK_SECRET:
        logger.warning("TRADINGVIEW_WEBHOOK_SECRET не настроен - webhook не защищен!")
        return True
    
    if not x_webhook_secret:
        raise HTTPException(status_code=401, detail="Missing webhook secret header")
    
    if x_webhook_secret != TRADINGVIEW_WEBHOOK_SECRET:
        logger.warning(f"Invalid webhook secret received")
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    
    return True

def validate_strategy(strategy_name: str) -> bool:
    """Проверка, разрешена ли стратегия"""
    if not ALLOWED_STRATEGIES or ALLOWED_STRATEGIES == ['']:
        return True
    return strategy_name in ALLOWED_STRATEGIES

def normalize_symbol(symbol: str) -> str:
    """Приведение символа к стандартному формату"""
    # TradingView может отправлять разные форматы: BTCUSDT, BTC/USDT, etc.
    symbol = symbol.upper().replace('/', '').replace('-', '')
    
    # Добавляем / между базовой и котируемой валютой
    if 'USDT' in symbol:
        base = symbol.replace('USDT', '')
        return f"{base}/USDT"
    elif 'USD' in symbol:
        base = symbol.replace('USD', '')
        return f"{base}/USD"
    
    return symbol

def normalize_side(side: str) -> str:
    """Приведение стороны к стандартному формату"""
    side = side.lower()
    if side in ['buy', 'long']:
        return 'LONG'
    elif side in ['sell', 'short']:
        return 'SHORT'
    return side.upper()

# ==================== ОТПРАВКА В TRADING BOT ====================

async def send_to_trading_bot(alert: TradingViewAlert) -> dict:
    """
    Отправка сигнала в Trading Bot для исполнения
    """
    try:
        # Формируем сигнал для trading bot
        webhook_secret = os.getenv('WEBHOOK_SECRET', '')
        
        signal_payload = {
            "pair": normalize_symbol(alert.symbol),
            "direction": normalize_side(alert.side),
            "entry": alert.price,
            "confidence": 85,  # TradingView сигналы считаем высокоуверенными
            "stop_loss": alert.stop_loss,
            "take_profit": alert.take_profit,
            "risk_percent": 2.0,  # Стандартный риск
            "exchange": "bingx",  # По умолчанию
            "dry_run": not AUTO_TRADING_ENABLED
        }
        
        headers = {}
        if webhook_secret:
            headers['X-Webhook-Secret'] = webhook_secret
        
        logger.info(f"Sending signal to trading bot: {signal_payload}")
        
        response = requests.post(
            f"{TRADING_BOT_URL}/webhook/signal",
            json=signal_payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Trading bot response: {result}")
            return {
                "success": True,
                "order_id": result.get('order_id'),
                "status": result.get('status'),
                "message": "Signal sent to trading bot successfully"
            }
        else:
            error_msg = f"Trading bot error: {response.status_code} - {response.text}"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }
            
    except requests.exceptions.ConnectionError:
        error_msg = f"Cannot connect to trading bot at {TRADING_BOT_URL}"
        logger.error(error_msg)
        return {
            "success": False,
            "error": error_msg
        }
    except Exception as e:
        error_msg = f"Error sending to trading bot: {str(e)}"
        logger.error(error_msg)
        return {
            "success": False,
            "error": error_msg
        }

# ==================== API ENDPOINTS ====================

@router.post("/webhook/tradingview", response_model=TradingViewResponse)
async def receive_tradingview_alert(
    alert: TradingViewAlert,
    authorized: bool = Depends(verify_tradingview_secret)
):
    """
    Получить webhook alert от TradingView
    
    Формат JSON от TradingView:
    ```json
    {
        "symbol": "BTCUSDT",
        "side": "buy",
        "price": 70000,
        "strategy": "my_strategy",
        "stop_loss": 69000,
        "take_profit": 72000,
        "timeframe": "1h"
    }
    ```
    
    Для настройки в TradingView:
    1. Создайте alert
    2. В Message используйте формат JSON
    3. В Webhook URL укажите: https://your-api.com/webhook/tradingview
    4. Добавьте заголовок X-Webhook-Secret если настроен секрет
    """
    try:
        logger.info(f"Received TradingView alert: {alert.symbol} {alert.side} @ {alert.price}")
        
        # Валидация стратегии
        if not validate_strategy(alert.strategy):
            logger.warning(f"Strategy '{alert.strategy}' not in allowed list")
            return TradingViewResponse(
                success=False,
                message=f"Strategy '{alert.strategy}' is not allowed",
                symbol=alert.symbol,
                side=alert.side,
                timestamp=datetime.utcnow().isoformat(),
                error="Strategy not allowed"
            )
        
        # Отправляем на исполнение в trading bot
        bot_result = await send_to_trading_bot(alert)
        
        if bot_result["success"]:
            return TradingViewResponse(
                success=True,
                message=f"Signal executed: {alert.strategy} {alert.side} {alert.symbol} @ {alert.price}",
                order_id=bot_result.get("order_id"),
                symbol=alert.symbol,
                side=alert.side,
                timestamp=datetime.utcnow().isoformat()
            )
        else:
            return TradingViewResponse(
                success=False,
                message="Failed to execute signal",
                symbol=alert.symbol,
                side=alert.side,
                timestamp=datetime.utcnow().isoformat(),
                error=bot_result.get("error")
            )
            
    except Exception as e:
        logger.error(f"Error processing TradingView alert: {str(e)}")
        return TradingViewResponse(
            success=False,
            message="Internal error processing alert",
            symbol=alert.symbol,
            side=alert.side,
            timestamp=datetime.utcnow().isoformat(),
            error=str(e)
        )

@router.get("/webhook/tradingview/status", response_model=TradingViewStatus)
async def get_tradingview_status():
    """Получить статус интеграции TradingView"""
    return TradingViewStatus(
        enabled=True,
        webhook_url="/webhook/tradingview",
        secret_configured=bool(TRADINGVIEW_WEBHOOK_SECRET),
        trading_bot_url=TRADING_BOT_URL,
        last_signal=None  # TODO: добавить хранение последнего сигнала
    )

@router.get("/webhook/tradingview/test")
async def test_tradingview_integration():
    """Тестовый endpoint для проверки доступности"""
    return {
        "status": "ok",
        "message": "TradingView webhook endpoint is active",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "webhook": True,
            "validation": bool(TRADINGVIEW_WEBHOOK_SECRET),
            "auto_trading": AUTO_TRADING_ENABLED,
            "trading_bot_connected": False  # TODO: проверять реальное подключение
        }
    }
