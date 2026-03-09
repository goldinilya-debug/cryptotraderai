from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.services.smc_sniper import sniper, SMCSignal, TradeDirection

router = APIRouter()

class SniperSignalResponse(BaseModel):
    id: str
    pair: str
    direction: str
    entry: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: float
    confidence: int
    confluence_score: int
    timeframe: str
    analysis: str
    created_at: datetime

class SniperScanRequest(BaseModel):
    pair: str = "BTC/USDT"
    timeframe: str = "4H"

class SniperScanResponse(BaseModel):
    signal: Optional[SniperSignalResponse]
    found: bool
    message: str

# Demo signals for showcase
DEMO_SNIPER_SIGNALS = [
    {
        "id": "smc_001",
        "pair": "BTC/USDT",
        "direction": "LONG",
        "entry": 63450.50,
        "stop_loss": 62500.00,
        "take_profit_1": 66000.00,
        "take_profit_2": 69000.00,
        "confidence": 88,
        "confluence_score": 4,
        "timeframe": "4H",
        "analysis": """Perfect OB Score: 6/6
Confluence Checks Passed: 4/4
Order Block Zone: $62,800 - $63,200

Key Factors:
  ✓ Liquidity sweep before OB
  ✓ OB within 61.8-78.6% Fib zone
  ✓ Clean structure around OB
  ✓ OB impulse caused BOS""",
        "created_at": datetime.utcnow()
    },
    {
        "id": "smc_002",
        "pair": "ETH/USDT",
        "direction": "SHORT",
        "entry": 3520.00,
        "stop_loss": 3580.00,
        "take_profit_1": 3400.00,
        "take_profit_2": 3250.00,
        "confidence": 85,
        "confluence_score": 4,
        "timeframe": "4H",
        "analysis": """Perfect OB Score: 5/6
Confluence Checks Passed: 4/4
Order Block Zone: $3,480 - $3,550

Key Factors:
  ✓ Liquidity sweep before OB
  ✓ OB within 61.8-78.6% Fib zone
  ✓ Clean structure around OB
  ✓ OB impulse caused BOS""",
        "created_at": datetime.utcnow()
    },
    {
        "id": "smc_003",
        "pair": "SOL/USDT",
        "direction": "LONG",
        "entry": 142.30,
        "stop_loss": 138.50,
        "take_profit_1": 152.00,
        "take_profit_2": 165.00,
        "confidence": 82,
        "confluence_score": 3,
        "timeframe": "4H",
        "analysis": """Perfect OB Score: 5/6
Confluence Checks Passed: 3/4
Order Block Zone: $138 - $144

Key Factors:
  ✓ Liquidity sweep before OB
  ✓ OB within 61.8-78.6% Fib zone
  ✓ Clean structure around OB""",
        "created_at": datetime.utcnow()
    }
]

@router.post("/scan", response_model=SniperScanResponse)
async def scan_for_setup(request: SniperScanRequest):
    """Scan for SMC sniper setup"""
    try:
        signal = await sniper.generate_sniper_signal(request.pair, request.timeframe)
        
        if signal:
            return {
                "signal": {
                    "id": signal.id,
                    "pair": signal.pair,
                    "direction": signal.direction.value,
                    "entry": signal.entry,
                    "stop_loss": signal.stop_loss,
                    "take_profit_1": signal.take_profit_1,
                    "take_profit_2": signal.take_profit_2,
                    "confidence": signal.confidence,
                    "confluence_score": signal.confluence_score,
                    "timeframe": signal.timeframe,
                    "analysis": signal.analysis,
                    "created_at": signal.created_at
                },
                "found": True,
                "message": "🎯 High-confluence SMC setup detected!"
            }
        else:
            return {
                "signal": None,
                "found": False,
                "message": "📉 No valid SMC setup found. Market conditions don't meet criteria."
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/signals", response_model=List[SniperSignalResponse])
async def get_sniper_signals():
    """Get all active sniper signals"""
    return DEMO_SNIPER_SIGNALS

@router.get("/signals/{signal_id}", response_model=SniperSignalResponse)
async def get_sniper_signal(signal_id: str):
    """Get specific sniper signal"""
    for signal in DEMO_SNIPER_SIGNALS:
        if signal["id"] == signal_id:
            return signal
    raise HTTPException(status_code=404, detail="Signal not found")

@router.get("/check/{pair}")
async def quick_check(pair: str, timeframe: str = "4H"):
    """Quick check if pair has valid setup"""
    try:
        signal = await sniper.generate_sniper_signal(pair, timeframe)
        
        if signal:
            return {
                "pair": pair,
                "has_setup": True,
                "direction": signal.direction.value,
                "confidence": signal.confidence,
                "entry": signal.entry,
                "score": signal.confluence_score
            }
        else:
            return {
                "pair": pair,
                "has_setup": False,
                "message": "No high-confluence setup detected"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
