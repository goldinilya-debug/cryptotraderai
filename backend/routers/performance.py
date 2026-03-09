from fastapi import APIRouter
from pydantic.v1 import BaseModel
from typing import Dict, List

router = APIRouter()

class PerformanceMetrics(BaseModel):
    total_signals: int
    win_rate: float
    total_pnl: float
    avg_pnl_per_trade: float
    hit_tp: int
    hit_sl: int
    by_pair: Dict[str, Dict]
    by_direction: Dict[str, Dict]
    equity_curve: List[Dict]

@router.get("/", response_model=PerformanceMetrics)
async def get_performance(
    period: str = "all",  # 7d, 30d, 90d, all
    pair: str = None
):
    """Get signal performance metrics"""
    # TODO: Implement performance calculation
    return {
        "total_signals": 0,
        "win_rate": 0.0,
        "total_pnl": 0.0,
        "avg_pnl_per_trade": 0.0,
        "hit_tp": 0,
        "hit_sl": 0,
        "by_pair": {},
        "by_direction": {},
        "equity_curve": []
    }

@router.get("/stats")
async def get_quick_stats():
    """Get quick statistics for dashboard"""
    return {
        "total_signals": 42,
        "active_signals": 4,
        "win_rate": 36,
        "hit_tp": 13,
        "hit_sl": 23
    }
