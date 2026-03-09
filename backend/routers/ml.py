from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime

from services.ml_engine import signal_ml

router = APIRouter()

class SignalResult(BaseModel):
    signal_id: str
    result: str  # 'WIN', 'LOSS', 'CANCELLED'
    exit_price: Optional[float] = None
    pnl_percent: Optional[float] = None

class MLStats(BaseModel):
    total_signals: int
    completed_signals: int
    wins: int
    losses: int
    win_rate: float
    best_pairs: List[tuple]
    optimal_confidence: int

@router.post("/feedback")
async def submit_feedback(feedback: SignalResult):
    """Submit result for a signal (user feedback)"""
    try:
        signal_ml.update_result(
            signal_id=feedback.signal_id,
            result=feedback.result,
            exit_price=feedback.exit_price,
            pnl=feedback.pnl_percent
        )
        
        return {
            "status": "success",
            "message": f"Signal {feedback.signal_id} marked as {feedback.result}",
            "ml_updated": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=Dict)
async def get_ml_stats():
    """Get ML system statistics and performance metrics"""
    try:
        stats = signal_ml.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pair-performance")
async def get_pair_performance():
    """Get performance data by trading pair"""
    try:
        performance = {}
        for pair, stats in signal_ml.pair_performance.items():
            if stats['total'] > 0:
                performance[pair] = {
                    'win_rate': (stats['wins'] / stats['total']) * 100,
                    'total_signals': stats['total'],
                    'wins': stats['wins'],
                    'losses': stats['losses']
                }
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wyckoff-performance")
async def get_wyckoff_performance():
    """Get performance by Wyckoff phase"""
    try:
        performance = {}
        for phase, stats in signal_ml.wyckoff_performance.items():
            if stats.get('total', 0) > 0:
                performance[phase] = {
                    'win_rate': (stats['wins'] / stats['total']) * 100,
                    'total': stats['total']
                }
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/killzone-performance")
async def get_killzone_performance():
    """Get performance by Kill Zone"""
    try:
        performance = {}
        for kz, stats in signal_ml.killzone_performance.items():
            if stats.get('total', 0) > 0:
                performance[kz] = {
                    'win_rate': (stats['wins'] / stats['total']) * 100,
                    'total': stats['total']
                }
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations")
async def get_recommendations():
    """Get ML-based trading recommendations"""
    try:
        stats = signal_ml.get_stats()
        best_pairs = signal_ml.get_best_performing_pairs(min_signals=3)
        
        recommendations = {
            'optimal_confidence_threshold': stats['optimal_confidence'],
            'best_pairs': [p[0] for p in best_pairs[:3]],
            'avoid_pairs': [],  # Pairs with low win rates
            'recommended_timeframes': ['4H', '1H'],
            'ml_insights': f"Current system win rate: {stats['win_rate']:.1f}%. "
                          f"Focus on pairs with proven track record."
        }
        
        # Find pairs to avoid (less than 40% win rate, min 5 signals)
        for pair, perf in signal_ml.pair_performance.items():
            if perf['total'] >= 5:
                wr = (perf['wins'] / perf['total']) * 100
                if wr < 40:
                    recommendations['avoid_pairs'].append({
                        'pair': pair,
                        'win_rate': wr,
                        'total_signals': perf['total']
                    })
        
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/retrain")
async def trigger_retrain():
    """Trigger ML model retraining (admin only)"""
    try:
        # In production, this would retrain the model
        # For now, just refresh statistics
        stats = signal_ml.get_stats()
        
        return {
            "status": "success",
            "message": "ML statistics refreshed",
            "new_stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
