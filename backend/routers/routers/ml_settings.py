from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from pydantic import BaseModel

from app.services.ml_engine import signal_ml

router = APIRouter()

class MLSettings(BaseModel):
    min_confidence: int = 70
    min_risk_reward: float = 1.5
    max_daily_signals: int = 10
    auto_adjust_confidence: bool = True
    learning_rate: float = 0.1
    min_samples_for_ml: int = 5
    preferred_pairs: List[str] = []
    avoid_low_performance: bool = True
    min_pair_win_rate: float = 40.0

# Default settings
DEFAULT_ML_SETTINGS = {
    "min_confidence": 70,
    "min_risk_reward": 1.5,
    "max_daily_signals": 10,
    "auto_adjust_confidence": True,
    "learning_rate": 0.1,
    "min_samples_for_ml": 5,
    "preferred_pairs": ["BTC/USDT", "ETH/USDT"],
    "avoid_low_performance": True,
    "min_pair_win_rate": 40.0
}

# Current settings (in-memory, in production use database)
current_settings = DEFAULT_ML_SETTINGS.copy()

@router.get("/settings")
async def get_ml_settings():
    """Get current ML settings"""
    try:
        # Add current stats to settings
        stats = signal_ml.get_stats()
        settings_with_stats = {
            **current_settings,
            "current_stats": {
                "total_signals": stats['total_signals'],
                "win_rate": stats['win_rate'],
                "optimal_confidence": stats['optimal_confidence']
            }
        }
        return settings_with_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings")
async def update_ml_settings(settings: MLSettings):
    """Update ML settings"""
    try:
        global current_settings
        current_settings = settings.dict()
        
        # Apply settings to ML engine
        signal_ml.min_confidence_threshold = current_settings["min_confidence"]
        signal_ml.min_risk_reward = current_settings["min_risk_reward"]
        signal_ml.max_daily_signals = current_settings["max_daily_signals"]
        signal_ml.auto_adjust = current_settings["auto_adjust_confidence"]
        signal_ml.learning_rate = current_settings["learning_rate"]
        
        return {
            "status": "success",
            "message": "ML settings updated",
            "settings": current_settings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings/reset")
async def reset_ml_settings():
    """Reset ML settings to defaults"""
    try:
        global current_settings
        current_settings = DEFAULT_ML_SETTINGS.copy()
        
        # Reset ML engine
        signal_ml.min_confidence_threshold = DEFAULT_ML_SETTINGS["min_confidence"]
        signal_ml.min_risk_reward = DEFAULT_ML_SETTINGS["min_risk_reward"]
        signal_ml.max_daily_signals = DEFAULT_ML_SETTINGS["max_daily_signals"]
        signal_ml.auto_adjust = DEFAULT_ML_SETTINGS["auto_adjust_confidence"]
        signal_ml.learning_rate = DEFAULT_ML_SETTINGS["learning_rate"]
        
        return {
            "status": "success",
            "message": "ML settings reset to defaults",
            "settings": current_settings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings/advanced")
async def get_advanced_ml_params():
    """Get advanced ML parameters"""
    try:
        return {
            "weight_recent_signals": 0.7,
            "weight_pair_performance": 0.3,
            "confidence_decay": 0.95,
            "min_trade_distance_hours": 4,
            "max_correlation_threshold": 0.8,
            "volatility_adjustment": True,
            "trend_filter_enabled": True,
            "description": {
                "weight_recent_signals": "Weight given to recent signals vs historical (0-1)",
                "weight_pair_performance": "Weight given to pair-specific performance (0-1)",
                "confidence_decay": "Decay factor for old signals (0-1, higher = slower decay)",
                "min_trade_distance": "Minimum hours between signals for same pair",
                "max_correlation": "Maximum correlation allowed between concurrent positions",
                "volatility_adjustment": "Adjust confidence based on market volatility",
                "trend_filter": "Filter signals against major trend"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings/advanced")
async def update_advanced_params(params: Dict):
    """Update advanced ML parameters"""
    try:
        # Apply advanced parameters to ML engine
        if "weight_recent_signals" in params:
            signal_ml.weight_recent = params["weight_recent_signals"]
        if "volatility_adjustment" in params:
            signal_ml.volatility_adjust = params["volatility_adjustment"]
        if "trend_filter_enabled" in params:
            signal_ml.trend_filter = params["trend_filter_enabled"]
            
        return {
            "status": "success",
            "message": "Advanced ML parameters updated",
            "params": params
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/learning-status")
async def get_learning_status():
    """Get ML learning status and progress"""
    try:
        stats = signal_ml.get_stats()
        
        return {
            "learning_enabled": True,
            "signals_collected": stats['total_signals'],
            "signals_with_feedback": stats['completed_signals'],
            "learning_progress": min(100, (stats['completed_signals'] / 20) * 100),  # 20 signals = 100%
            "confidence_trend": "improving" if stats['win_rate'] > 50 else "calibrating",
            "last_update": "auto",
            "next_retrain": "after 5 more signals",
            "model_version": "1.0.0",
            "status": "active" if stats['completed_signals'] >= 5 else "collecting_data"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pause-learning")
async def pause_learning():
    """Pause ML learning"""
    try:
        signal_ml.learning_enabled = False
        return {"status": "success", "message": "ML learning paused"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resume-learning")
async def resume_learning():
    """Resume ML learning"""
    try:
        signal_ml.learning_enabled = True
        return {"status": "success", "message": "ML learning resumed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
