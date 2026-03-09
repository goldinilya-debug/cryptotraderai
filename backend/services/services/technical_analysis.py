"""Technical Analysis module"""
from typing import Dict

def calculateTechnicalIndicators(ohlcv: list) -> Dict:
    """Calculate TA indicators"""
    return {
        "rsi": 50,
        "macd": 0,
        "ema20": 0,
        "ema50": 0,
        "atr": 100,
        "adx": 25
    }
