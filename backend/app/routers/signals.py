from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.services.signal_generator import generate_signal
from app.services.market_data import get_current_price

router = APIRouter()

VALID_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "AVAX/USDT", "1000PEPE/USDT", "HYPE/USDT"]

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

# Demo signals with new pairs
DEMO_SIGNALS = [
    {
        "id": "demo_1",
        "pair": "BTC/USDT",
        "direction": "LONG",
        "entry": 63500.0,
        "stop_loss": 62800.0,
        "take_profit_1": 64500.0,
        "take_profit_2": 65500.0,
        "confidence": 82,
        "timeframe": "4H",
        "exchange": "binance",
        "status": "ACTIVE",
        "wyckoff_phase": "accumulation",
        "kill_zone": "London",
        "analysis": "Price in accumulation phase. Spring test completed.",
        "created_at": datetime.utcnow()
    },
    {
        "id": "demo_2",
        "pair": "ETH/USDT",
        "direction": "SHORT",
        "entry": 3500.0,
        "stop_loss": 3550.0,
        "take_profit_1": 3400.0,
        "take_profit_2": 3300.0,
        "confidence": 75,
        "timeframe": "4H",
        "exchange": "bingx",
        "status": "ACTIVE",
        "wyckoff_phase": "distribution",
        "kill_zone": "New York",
        "analysis": "Distribution at top. UTAD pattern visible.",
        "created_at": datetime.utcnow()
    },
    {
        "id": "demo_3",
        "pair": "1000PEPE/USDT",
        "direction": "LONG",
        "entry": 0.0085,
        "stop_loss": 0.0082,
        "take_profit_1": 0.0092,
        "take_profit_2": 0.0100,
        "confidence": 78,
        "timeframe": "4H",
        "exchange": "binance",
        "status": "ACTIVE",
        "wyckoff_phase": "accumulation",
        "kill_zone": "Asian",
        "analysis": "Meme momentum building. Breakout from accumulation zone.",
        "created_at": datetime.utcnow()
    },
    {
        "id": "demo_4",
        "pair": "HYPE/USDT",
        "direction": "SHORT",
        "entry": 18.50,
        "stop_loss": 19.20,
        "take_profit_1": 17.20,
        "take_profit_2": 16.00,
        "confidence": 71,
        "timeframe": "4H",
        "exchange": "kucoin",
        "status": "ACTIVE",
        "wyckoff_phase": "distribution",
        "kill_zone": "London Close",
        "analysis": "Distribution after markup. Sign of weakness with volume.",
        "created_at": datetime.utcnow()
    }
]

@router.post("/generate", response_model=SignalResponse)
async def create_signal(request: SignalRequest):
    """Generate a new AI trading signal"""
    # Validate pair
    if request.pair not in VALID_PAIRS:
        raise HTTPException(status_code=400, detail=f"Invalid pair. Valid pairs: {', '.join(VALID_PAIRS)}")
    
    try:
        signal = await generate_signal(
            pair=request.pair,
            timeframe=request.timeframe,
            exchange=request.exchange
        )
        return signal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=SignalListResponse)
async def list_signals(
    status: Optional[str] = None,
    pair: Optional[str] = None,
    limit: int = 50
):
    """List trading signals with optional filters"""
    signals = DEMO_SIGNALS
    if pair:
        signals = [s for s in signals if s["pair"] == pair]
    if status:
        signals = [s for s in signals if s["status"] == status]
    
    return {
        "signals": signals[:limit],
        "total": len(signals),
        "win_rate": 68.5,
        "wins": 87,
        "losses": 40
    }

@router.get("/active", response_model=SignalListResponse)
async def get_active_signals():
    """Get currently active signals"""
    active = [s for s in DEMO_SIGNALS if s["status"] == "ACTIVE"]
    return {
        "signals": active,
        "total": len(active),
        "win_rate": 68.5,
        "wins": 87,
        "losses": 40
    }

@router.get("/{signal_id}", response_model=SignalResponse)
async def get_signal(signal_id: str):
    """Get specific signal details"""
    for signal in DEMO_SIGNALS:
        if signal["id"] == signal_id:
            return signal
    raise HTTPException(status_code=404, detail="Signal not found")
