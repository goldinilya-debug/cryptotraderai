from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.services.signal_generator import generate_signal
from app.services.market_data import get_current_price

router = APIRouter()

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

@router.post("/generate", response_model=SignalResponse)
async def create_signal(request: SignalRequest):
    """Generate a new AI trading signal"""
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
    # TODO: Implement database query
    return {"signals": [], "total": 0}

@router.get("/active", response_model=SignalListResponse)
async def get_active_signals():
    """Get currently active signals"""
    # TODO: Implement database query
    return {"signals": [], "total": 0}

@router.get("/{signal_id}", response_model=SignalResponse)
async def get_signal(signal_id: str):
    """Get specific signal details"""
    # TODO: Implement database query
    raise HTTPException(status_code=404, detail="Signal not found")
