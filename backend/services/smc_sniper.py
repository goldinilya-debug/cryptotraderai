"""
SMC Sniper Module - Smart Money Concepts trading signals
Based on ProfitTown Sniper logic for high-confluence setups
"""

import os
import json
import asyncio
from typing import Dict, Optional, List
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import httpx

class TradeDirection(Enum):
    LONG = "LONG"
    SHORT = "SHORT"

@dataclass
class OrderBlock:
    high: float
    low: float
    open_time: datetime
    close_time: datetime
    volume: float
    is_bullish: bool
    
@dataclass
class SMCSignal:
    id: str
    pair: str
    direction: TradeDirection
    entry: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: float
    confidence: int
    confluence_score: int
    timeframe: str
    analysis: str
    created_at: datetime
    
class SMCSniper:
    """Smart Money Concepts Sniper for high-probability setups"""
    
    def __init__(self):
        self.min_confluence_score = 3  # Minimum 3/4 checks must pass
        self.acceptance_threshold = 5  # For Perfect OB scoring (max 6)
        
    async def generate_sniper_signal(self, pair: str = "BTC/USDT", timeframe: str = "4H") -> Optional[SMCSignal]:
        """Generate SMC sniper signal with confluence checks"""
        
        # Fetch market data
        candles = await self.fetch_candles(pair, timeframe)
        if not candles or len(candles) < 50:
            return None
            
        # 1. Detect Break of Structure
        bos_direction, bos_level = self.detect_bos(candles)
        if not bos_direction:
            return None
            
        # 2. Find Order Block
        ob = self.find_order_block(candles, bos_direction)
        if not ob:
            return None
            
        # 3. Perfect OB Scoring (max 6)
        ob_score = self.score_order_block(candles, ob, bos_direction, bos_level)
        if ob_score < self.acceptance_threshold:
            return None
            
        # 4. Confluence Checks (4 checks)
        confluence_checks = {
            "liquidity_sweep": self.check_liquidity_sweep(candles, ob, bos_direction),
            "fibonacci_zone": self.check_fibonacci_zone(candles, ob, bos_direction),
            "clean_structure": self.check_clean_structure(candles, ob),
            "impulse_from_ob": self.check_impulse_from_ob(candles, ob, bos_level, bos_direction)
        }
        
        confluence_score = sum(confluence_checks.values())
        if confluence_score < self.min_confluence_score:
            return None
            
        # 5. Calculate entry, SL, TP
        entry, stop_loss, take_profit_1, take_profit_2 = self.calculate_levels(
            ob, bos_direction, candles
        )
        
        # 6. Calculate confidence based on scores
        confidence = self.calculate_confidence(ob_score, confluence_score)
        
        return SMCSignal(
            id=f"smc_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            pair=pair,
            direction=bos_direction,
            entry=entry,
            stop_loss=stop_loss,
            take_profit_1=take_profit_1,
            take_profit_2=take_profit_2,
            confidence=confidence,
            confluence_score=confluence_score,
            timeframe=timeframe,
            analysis=self.generate_analysis(ob_score, confluence_checks, ob),
            created_at=datetime.utcnow()
        )
    
    async def fetch_candles(self, pair: str, timeframe: str) -> List[Dict]:
        """Fetch OHLCV data from Binance"""
        try:
            symbol = pair.replace("/", "")
            interval_map = {"1h": "1h", "4h": "4h", "1d": "1d"}
            interval = interval_map.get(timeframe.lower(), "4h")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.binance.com/api/v3/klines",
                    params={
                        "symbol": symbol,
                        "interval": interval,
                        "limit": 100
                    },
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    return []
                    
                data = response.json()
                candles = []
                for candle in data:
                    candles.append({
                        "timestamp": candle[0],
                        "open": float(candle[1]),
                        "high": float(candle[2]),
                        "low": float(candle[3]),
                        "close": float(candle[4]),
                        "volume": float(candle[5])
                    })
                return candles
        except Exception as e:
            print(f"Error fetching candles: {e}")
            return []
    
    def detect_bos(self, candles: List[Dict], lookback: int = 20) -> tuple:
        """Detect Break of Structure"""
        if len(candles) < lookback + 5:
            return None, None
            
        recent_candles = candles[-lookback:]
        
        # Find swing highs and lows
        swing_highs = []
        swing_lows = []
        
        for i in range(2, len(recent_candles) - 2):
            # Swing high
            if (recent_candles[i]["high"] > recent_candles[i-1]["high"] and 
                recent_candles[i]["high"] > recent_candles[i-2]["high"] and
                recent_candles[i]["high"] > recent_candles[i+1]["high"] and
                recent_candles[i]["high"] > recent_candles[i+2]["high"]):
                swing_highs.append((i, recent_candles[i]["high"]))
                
            # Swing low
            if (recent_candles[i]["low"] < recent_candles[i-1]["low"] and 
                recent_candles[i]["low"] < recent_candles[i-2]["low"] and
                recent_candles[i]["low"] < recent_candles[i+1]["low"] and
                recent_candles[i]["low"] < recent_candles[i+2]["low"]):
                swing_lows.append((i, recent_candles[i]["low"]))
        
        if len(swing_highs) < 2 or len(swing_lows) < 2:
            return None, None
            
        # Check for BOS
        last_swing_high = swing_highs[-1]
        prev_swing_high = swing_highs[-2]
        last_swing_low = swing_lows[-1]
        prev_swing_low = swing_lows[-2]
        
        # Bullish BOS: price breaks above previous swing high
        if recent_candles[-1]["close"] > prev_swing_high[1]:
            return TradeDirection.LONG, prev_swing_high[1]
            
        # Bearish BOS: price breaks below previous swing low
        if recent_candles[-1]["close"] < prev_swing_low[1]:
            return TradeDirection.SHORT, prev_swing_low[1]
            
        return None, None
    
    def find_order_block(self, candles: List[Dict], direction: TradeDirection) -> Optional[Dict]:
        """Find valid Order Block"""
        if len(candles) < 10:
            return None
            
        lookback = min(15, len(candles) - 1)
        
        for i in range(-lookback, -1):
            idx = len(candles) + i
            if idx < 1:
                continue
                
            candle = candles[idx]
            prev_candle = candles[idx - 1]
            
            if direction == TradeDirection.LONG:
                # Bullish OB: bearish candle before strong bullish move
                if (candle["close"] < candle["open"] and  # Bearish candle
                    prev_candle["close"] > prev_candle["open"] * 1.01):  # Strong bullish prior
                    return {
                        "high": candle["high"],
                        "low": candle["low"],
                        "open": candle["open"],
                        "close": candle["close"],
                        "index": idx,
                        "is_bullish": True
                    }
            else:
                # Bearish OB: bullish candle before strong bearish move
                if (candle["close"] > candle["open"] and  # Bullish candle
                    prev_candle["close"] < prev_candle["open"] * 0.99):  # Strong bearish prior
                    return {
                        "high": candle["high"],
                        "low": candle["low"],
                        "open": candle["open"],
                        "close": candle["close"],
                        "index": idx,
                        "is_bullish": False
                    }
                    
        return None
    
    def score_order_block(self, candles: List[Dict], ob: Dict, direction: TradeDirection, bos_level: float) -> int:
        """Score Order Block quality (max 6)"""
        score = 0
        
        # 1. OB caused clean displacement (+1)
        if self.check_displacement(candles, ob, direction):
            score += 1
            
        # 2. OB is unmitigated (+1)
        if self.check_unmitigated(candles, ob):
            score += 1
            
        # 3. Liquidity sweep before OB (+1)
        if self.check_liquidity_sweep_before(candles, ob, direction):
            score += 1
            
        # 4. OB in Fib zone (+1)
        if self.check_fibonacci_zone(candles, ob, direction):
            score += 1
            
        # 5. Clean structure around OB (+1)
        if self.check_clean_structure(candles, ob):
            score += 1
            
        # 6. OB impulse caused BOS (+1)
        if self.check_impulse_from_ob(candles, ob, bos_level, direction):
            score += 1
            
        return score
    
    def check_displacement(self, candles: List[Dict], ob: Dict, direction: TradeDirection) -> bool:
        """Check if OB caused clean displacement"""
        ob_idx = ob["index"]
        if ob_idx >= len(candles) - 2:
            return False
            
        next_candle = candles[ob_idx + 1]
        
        if direction == TradeDirection.LONG:
            return next_candle["close"] > next_candle["open"] * 1.005
        else:
            return next_candle["close"] < next_candle["open"] * 0.995
    
    def check_unmitigated(self, candles: List[Dict], ob: Dict) -> bool:
        """Check if OB is unmitigated (price hasn't returned to it)"""
        ob_idx = ob["index"]
        ob_low = ob["low"]
        ob_high = ob["high"]
        
        for candle in candles[ob_idx + 1:]:
            if ob_low <= candle["low"] <= ob_high or ob_low <= candle["high"] <= ob_high:
                return False
        return True
    
    def check_liquidity_sweep_before(self, candles: List[Dict], ob: Dict, direction: TradeDirection) -> bool:
        """Check for liquidity sweep before OB"""
        ob_idx = ob["index"]
        if ob_idx < 3:
            return False
            
        recent_lows = [c["low"] for c in candles[ob_idx-3:ob_idx]]
        recent_highs = [c["high"] for c in candles[ob_idx-3:ob_idx]]
        
        if direction == TradeDirection.LONG:
            # Check for sweep below previous lows
            return min(recent_lows) < min([c["low"] for c in candles[ob_idx-6:ob_idx-3]])
        else:
            # Check for sweep above previous highs
            return max(recent_highs) > max([c["high"] for c in candles[ob_idx-6:ob_idx-3]])
    
    def check_liquidity_sweep(self, candles: List[Dict], ob: Dict, direction: TradeDirection) -> bool:
        """Check for liquidity sweep (confluence check)"""
        return self.check_liquidity_sweep_before(candles, ob, direction)
    
    def check_fibonacci_zone(self, candles: List[Dict], ob: Dict, direction: TradeDirection) -> bool:
        """Check if OB is within 61.8-78.6% Fibonacci retracement"""
        if len(candles) < 20:
            return False
            
        swing_high = max([c["high"] for c in candles[-20:]])
        swing_low = min([c["low"] for c in candles[-20:]])
        
        fib_618 = swing_high - (swing_high - swing_low) * 0.618
        fib_786 = swing_high - (swing_high - swing_low) * 0.786
        
        ob_mid = (ob["high"] + ob["low"]) / 2
        
        return fib_786 <= ob_mid <= fib_618 or fib_618 <= ob_mid <= fib_786
    
    def check_clean_structure(self, candles: List[Dict], ob: Dict) -> bool:
        """Check for clean structure around OB"""
        ob_idx = ob["index"]
        if ob_idx < 3 or ob_idx >= len(candles) - 3:
            return False
            
        # Check for minimal wick chaos around OB
        ob_area = candles[ob_idx-2:ob_idx+3]
        avg_wick_size = sum(
            (c["high"] - max(c["open"], c["close"])) + 
            (min(c["open"], c["close"]) - c["low"])
            for c in ob_area
        ) / len(ob_area)
        
        avg_body_size = sum(
            abs(c["close"] - c["open"])
            for c in ob_area
        ) / len(ob_area)
        
        # Clean structure: wicks not too large compared to bodies
        return avg_wick_size < avg_body_size * 1.5
    
    def check_impulse_from_ob(self, candles: List[Dict], ob: Dict, bos_level: float, direction: TradeDirection) -> bool:
        """Check if OB impulse caused BOS"""
        ob_idx = ob["index"]
        if ob_idx >= len(candles) - 1:
            return False
            
        next_candle = candles[ob_idx + 1]
        
        if direction == TradeDirection.LONG:
            return next_candle["close"] > bos_level
        else:
            return next_candle["close"] < bos_level
    
    def calculate_levels(self, ob: Dict, direction: TradeDirection, candles: List[Dict]) -> tuple:
        """Calculate entry, SL, TP levels"""
        entry = ob["low"] if direction == TradeDirection.LONG else ob["high"]
        
        if direction == TradeDirection.LONG:
            stop_loss = ob["low"] * 0.985  # 1.5% below OB
            risk = entry - stop_loss
            take_profit_1 = entry + risk * 3  # 1:3 RRR
            take_profit_2 = entry + risk * 6  # 1:6 RRR
        else:
            stop_loss = ob["high"] * 1.015  # 1.5% above OB
            risk = stop_loss - entry
            take_profit_1 = entry - risk * 3  # 1:3 RRR
            take_profit_2 = entry - risk * 6  # 1:6 RRR
            
        return (
            round(entry, 8 if entry < 1 else 2),
            round(stop_loss, 8 if stop_loss < 1 else 2),
            round(take_profit_1, 8 if take_profit_1 < 1 else 2),
            round(take_profit_2, 8 if take_profit_2 < 1 else 2)
        )
    
    def calculate_confidence(self, ob_score: int, confluence_score: int) -> int:
        """Calculate final confidence percentage"""
        # OB score: max 6, weight 60%
        # Confluence score: max 4, weight 40%
        ob_confidence = (ob_score / 6) * 60
        confluence_confidence = (confluence_score / 4) * 40
        
        return min(95, int(ob_confidence + confluence_confidence))
    
    def generate_analysis(self, ob_score: int, confluence_checks: Dict, ob: Dict) -> str:
        """Generate human-readable analysis"""
        passed_checks = [k for k, v in confluence_checks.items() if v]
        
        analysis_parts = [
            f"Perfect OB Score: {ob_score}/6",
            f"Confluence Checks Passed: {len(passed_checks)}/4",
            f"Order Block Zone: ${ob['low']:.4f} - ${ob['high']:.4f}",
            "",
            "Key Factors:"
        ]
        
        check_names = {
            "liquidity_sweep": "✓ Liquidity sweep before OB",
            "fibonacci_zone": "✓ OB within 61.8-78.6% Fib zone",
            "clean_structure": "✓ Clean structure around OB",
            "impulse_from_ob": "✓ OB impulse caused BOS"
        }
        
        for check in passed_checks:
            analysis_parts.append(f"  {check_names.get(check, check)}")
            
        return "\n".join(analysis_parts)

# Global instance
sniper = SMCSniper()
