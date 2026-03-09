from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from services.signal_generator_dynamic import signal_generator, start_signal_generation
from services.telegram_service import send_signal_to_telegram
from services.market_data import get_current_price

router = APIRouter()

VALID_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "AVAX/USDT", "DOT/USDT"]

class SignalRequest(BaseModel):
    pair: str
    timeframe: str = "4H"
    exchange: str = "binance"

class SignalResponse(BaseModel):
    id: str
    pair: str
    direction: str
    entry: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: Optional[float]
    confidence: int
    timeframe: str
    exchange: str
    status: str
    wyckoff_phase: str
    kill_zone: str
    analysis: str
    created_at: datetime

class SignalListResponse(BaseModel):
    signals: List[SignalResponse]
    total: int
    win_rate: float = 0
    wins: int = 0
    losses: int = 0

@router.post("/generate", response_model=SignalResponse)
async def create_signal(request: SignalRequest):
    """Generate a new AI trading signal manually"""
    if request.pair not in VALID_PAIRS:
        raise HTTPException(status_code=400, detail=f"Invalid pair. Valid pairs: {', '.join(VALID_PAIRS)}")
    
    try:
        # Get current price
        current_price = await get_current_price(request.pair, request.exchange)
        
        # Create manual signal
        signal_data = {
            "id": f"manual_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "pair": request.pair,
            "direction": "LONG",  # Default
            "entry": current_price,
            "stop_loss": current_price * 0.97,
            "take_profit_1": current_price * 1.03,
            "take_profit_2": current_price * 1.06,
            "confidence": 75,
            "timeframe": request.timeframe,
            "exchange": request.exchange,
            "status": "ACTIVE",
            "wyckoff_phase": "markup",
            "kill_zone": "Manual",
            "risk_reward": 2.0,
            "analysis": f"Manually generated signal for {request.pair}",
            "created_at": datetime.utcnow()
        }
        
        # Send to Telegram
        await send_signal_to_telegram(signal_data)
        
        return signal_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=SignalListResponse)
async def list_signals(
    status: Optional[str] = None,
    pair: Optional[str] = None,
    limit: int = 50
):
    """List active trading signals - DYNAMIC from generator with REAL-TIME prices"""
    
    # Get signals from dynamic generator
    signals = signal_generator.get_active_signals()
    
    # Update with real-time prices from Binance
    for signal in signals:
        try:
            real_price = await get_current_price(signal["pair"], "binance")
            if real_price > 0:
                signal["current_price"] = real_price
                signal["price_updated_at"] = datetime.utcnow().isoformat()
        except Exception as e:
            print(f"Failed to update price for {signal['pair']}: {e}")
    
    if pair:
        signals = [s for s in signals if s["pair"] == pair]
    if status:
        signals = [s for s in signals if s["status"] == status]
    
    # Get stats
    stats = signal_generator.get_stats()
    
    return {
        "signals": signals[:limit],
        "total": len(signals),
        "win_rate": stats["win_rate"],
        "wins": stats["wins"],
        "losses": stats["losses"]
    }

@router.get("/active", response_model=SignalListResponse)
async def get_active_signals():
    """Get currently active signals"""
    signals = signal_generator.get_active_signals()
    stats = signal_generator.get_stats()
    
    return {
        "signals": signals,
        "total": len(signals),
        "win_rate": stats["win_rate"],
        "wins": stats["wins"],
        "losses": stats["losses"]
    }

@router.get("/stats")
async def get_signal_stats():
    """Get signal statistics"""
    return signal_generator.get_stats()

@router.get("/{signal_id}", response_model=SignalResponse)
async def get_signal(signal_id: str):
    """Get specific signal details"""
    # Search in active signals
    for signal in signal_generator.get_active_signals():
        if signal["id"] == signal_id:
            return signal
    
    raise HTTPException(status_code=404, detail="Signal not found")

@router.post("/{signal_id}/close")
async def close_signal(signal_id: str):
    """Close a signal manually"""
    # Find and close the signal
    for pair, signal in list(signal_generator.active_signals.items()):
        if signal.id == signal_id:
            signal.status = "CLOSED"
            del signal_generator.active_signals[pair]
            return {"success": True, "message": "Signal closed"}
    
    raise HTTPException(status_code=404, detail="Signal not found")

@router.post("/start-generator")
async def start_generator(background_tasks: BackgroundTasks):
    """Start the dynamic signal generator"""
    background_tasks.add_task(start_signal_generation)
    return {"success": True, "message": "Signal generator started"}

@router.post("/test-telegram")
async def test_telegram():
    """Test Telegram notification"""
    test_signal = {
        "id": "test_001",
        "pair": "BTC/USDT",
        "direction": "LONG",
        "entry": 68726.0,
        "stop_loss": 66004.0,
        "take_profit_1": 71448.0,
        "take_profit_2": 74850.0,
        "confidence": 85,
        "wyckoff_phase": "markup",
        "kill_zone": "New York",
        "risk_reward": 2.5
    }
    
    result = await send_signal_to_telegram(test_signal)
    
    if result:
        return {"success": True, "message": "Test signal sent to Telegram"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send Telegram message")
