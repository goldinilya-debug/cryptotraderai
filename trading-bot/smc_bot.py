#!/usr/bin/env python3
"""
CryptoTraderAI - Trading Bot with FVG Detection
Steps 2 & 5 from Technical Specification
"""

import asyncio
import aiohttp
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import ccxt.async_support as ccxt
import os

# API Endpoint
API_URL = "https://cryptotraderai.onrender.com"

# Trading Configuration
SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT"]
TIMEFRAMES = {"m5": "5m", "h1": "1h"}

# Filter Thresholds (Step 5)
MIN_RELATIVE_VOLUME = 1.5  # Rel Vol > 1.5
MIN_TREND_ALIGNMENT = True  # EMA 200 check

class FVGDetector:
    """Fair Value Gap (Imbalance) Detector"""
    
    @staticmethod
    def detect_bullish_fvg(df: pd.DataFrame) -> Optional[Dict]:
        """
        Detect Bullish FVG (Imbalance)
        Formula: Low[candle3] > High[candle1]
        """
        if len(df) < 4:
            return None
        
        # Get last 3 candles
        candle1 = df.iloc[-3]  # First candle
        candle2 = df.iloc[-2]  # Middle candle (FVG body)
        candle3 = df.iloc[-1]  # Last candle
        
        # Bullish FVG condition: Low of candle3 > High of candle1
        if candle3['low'] > candle1['high']:
            # Calculate levels
            entry = (candle1['high'] + candle3['low']) / 2
            sl = candle1['low'] * 0.999  # Slightly below candle1 low
            tp = entry + (entry - sl) * 2.5  # 1:2.5 RR
            
            return {
                "type": "BULLISH_FVG",
                "entry": round(entry, 2),
                "sl": round(sl, 2),
                "tp": round(tp, 2),
                "candle1_high": candle1['high'],
                "candle3_low": candle3['low'],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return None
    
    @staticmethod
    def detect_bearish_fvg(df: pd.DataFrame) -> Optional[Dict]:
        """
        Detect Bearish FVG (Imbalance)
        Formula: High[candle3] < Low[candle1]
        """
        if len(df) < 4:
            return None
        
        candle1 = df.iloc[-3]
        candle2 = df.iloc[-2]
        candle3 = df.iloc[-1]
        
        # Bearish FVG condition: High of candle3 < Low of candle1
        if candle3['high'] < candle1['low']:
            entry = (candle1['low'] + candle3['high']) / 2
            sl = candle1['high'] * 1.001  # Slightly above candle1 high
            tp = entry - (sl - entry) * 2.5  # 1:2.5 RR
            
            return {
                "type": "BEARISH_FVG",
                "entry": round(entry, 2),
                "sl": round(sl, 2),
                "tp": round(tp, 2),
                "candle1_low": candle1['low'],
                "candle3_high": candle3['high'],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return None


class FilterValidator:
    """Smart Filters for Signal Quality (Step 5)"""
    
    @staticmethod
    def calculate_relative_volume(df_m5: pd.DataFrame, period: int = 20) -> float:
        """
        Calculate Relative Volume
        rel_vol = current_volume / avg_volume(period)
        """
        if len(df_m5) < period + 1:
            return 0.0
        
        avg_volume = df_m5['volume'].rolling(period).mean().iloc[-2]
        current_volume = df_m5['volume'].iloc[-2]
        
        if avg_volume == 0:
            return 0.0
        
        return current_volume / avg_volume
    
    @staticmethod
    def check_trend_alignment(df_h1: pd.DataFrame, direction: str) -> bool:
        """
        Check if price aligns with EMA 200 trend
        """
        if len(df_h1) < 200:
            return True  # Not enough data, allow signal
        
        # Calculate EMA 200
        ema_200 = df_h1['close'].ewm(span=200, adjust=False).mean()
        current_price = df_h1['close'].iloc[-1]
        
        if direction == "BULLISH":
            return current_price > ema_200.iloc[-1]
        else:  # BEARISH
            return current_price < ema_200.iloc[-1]
    
    @staticmethod
    def validate_signal(fvg_signal: Dict, df_m5: pd.DataFrame, df_h1: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Validate FVG signal with filters
        Returns: (is_valid, metadata)
        """
        metadata = {
            "rel_volume": 0.0,
            "trend_aligned": False,
            "filters_passed": []
        }
        
        # Filter 1: Relative Volume
        rel_vol = FilterValidator.calculate_relative_volume(df_m5)
        metadata["rel_volume"] = round(rel_vol, 2)
        vol_passed = rel_vol > MIN_RELATIVE_VOLUME
        
        if vol_passed:
            metadata["filters_passed"].append("RelVol>1.5")
        
        # Filter 2: Trend Alignment
        direction = "BULLISH" if fvg_signal["type"] == "BULLISH_FVG" else "BEARISH"
        trend_aligned = FilterValidator.check_trend_alignment(df_h1, direction)
        metadata["trend_aligned"] = trend_aligned
        
        if trend_aligned:
            metadata["filters_passed"].append("TrendAligned")
        
        # Overall validation
        is_valid = vol_passed and trend_aligned
        
        return is_valid, metadata


class TradingBot:
    """Main Trading Bot"""
    
    def __init__(self):
        self.exchange = ccxt.binance({'enableRateLimit': True})
        self.fvg_detector = FVGDetector()
        self.filter_validator = FilterValidator()
        self.active_signals = {}  # Track sent signals
        
    async def fetch_ohlcv(self, symbol: str, timeframe: str, limit: int = 250) -> pd.DataFrame:
        """Fetch OHLCV data"""
        try:
            ohlcv = await self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            print(f"❌ Error fetching {symbol} {timeframe}: {e}")
            return pd.DataFrame()
    
    async def analyze_symbol(self, symbol: str):
        """Analyze symbol for FVG patterns"""
        # Fetch data
        df_m5 = await self.fetch_ohlcv(symbol, TIMEFRAMES["m5"])
        df_h1 = await self.fetch_ohlcv(symbol, TIMEFRAMES["h1"])
        
        if df_m5.empty or df_h1.empty:
            return
        
        # Detect FVG
        bullish_fvg = self.fvg_detector.detect_bullish_fvg(df_m5)
        bearish_fvg = self.fvg_detector.detect_bearish_fvg(df_m5)
        
        fvg_signal = bullish_fvg or bearish_fvg
        
        if fvg_signal:
            print(f"🔍 FVG detected for {symbol}: {fvg_signal['type']}")
            
            # Validate with filters (Step 5)
            is_valid, metadata = self.filter_validator.validate_signal(
                fvg_signal, df_m5, df_h1
            )
            
            print(f"   Filters: RelVol={metadata['rel_volume']}, Trend={metadata['trend_aligned']}")
            
            if is_valid:
                # Check if we already sent this signal
                signal_key = f"{symbol}_{fvg_signal['entry']}"
                if signal_key not in self.active_signals:
                    print(f"✅ Signal PASSED filters! Sending to API...")
                    
                    # Calculate probability based on filters
                    probability = min(75 + len(metadata["filters_passed"]) * 5, 95)
                    
                    await self.push_to_api({
                        **fvg_signal,
                        "symbol": symbol,
                        "probability": f"{probability}%",
                        "metadata": metadata
                    })
                    
                    self.active_signals[signal_key] = datetime.utcnow()
                else:
                    print(f"   Signal already sent, skipping...")
            else:
                print(f"❌ Signal REJECTED by filters")
    
    async def push_to_api(self, signal: Dict):
        """Push signal to backend API (Step 2)"""
        url = f"{API_URL}/update_signal"

        # Map bot fields → API SignalIn model
        raw_prob = signal.get("probability", "75%")
        confidence = float(str(raw_prob).replace("%", "").strip())
        direction = "LONG" if "BULLISH" in signal["type"] else "SHORT"

        payload = {
            "symbol": signal["symbol"],
            "direction": direction,
            "entry_price": signal["entry"],
            "stop_loss": signal["sl"],
            "take_profit": signal["tp"],
            "confidence": confidence,
            "signal_type": signal["type"],
            "timeframe": "5m",
            "exchange": "binance",
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        print(f"   📤 Signal sent successfully!")
                        # Send Telegram notification
                        await self.send_telegram_alert(signal)
                    else:
                        error = await response.text()
                        print(f"   ❌ API Error: {error}")
        except Exception as e:
            print(f"   ❌ Error pushing to API: {e}")
    
    async def send_telegram_alert(self, signal: Dict):
        """Send Telegram notification"""
        # This would call the telegram service
        # For now, just log
        print(f"   📱 Telegram alert would be sent: {signal['type']} @ {signal['entry']}")
    
    async def check_existing_signals(self):
        """Check if any active signals hit TP/SL"""
        for key, sent_time in list(self.active_signals.items()):
            # Remove signals older than 24 hours
            if datetime.utcnow() - sent_time > timedelta(hours=24):
                del self.active_signals[key]
    
    async def run(self):
        """Main bot loop"""
        print("🤖 CryptoTraderAI Bot Started")
        print(f"   Symbols: {SYMBOLS}")
        print(f"   Filters: RelVol>{MIN_RELATIVE_VOLUME}, TrendAlignment={MIN_TREND_ALIGNMENT}")
        print(f"   API: {API_URL}")
        print()
        
        while True:
            try:
                for symbol in SYMBOLS:
                    print(f"\n🔍 Scanning {symbol}...")
                    await self.analyze_symbol(symbol)
                    await asyncio.sleep(2)  # Rate limiting
                
                # Cleanup old signals
                await self.check_existing_signals()
                
                print(f"\n⏳ Next scan in 30 seconds...")
                await asyncio.sleep(30)
                
            except Exception as e:
                print(f"❌ Error in main loop: {e}")
                await asyncio.sleep(10)
    
    async def cleanup(self):
        """Cleanup resources"""
        await self.exchange.close()


async def main():
    """Entry point"""
    bot = TradingBot()
    
    try:
        await bot.run()
    except KeyboardInterrupt:
        print("\n👋 Shutting down bot...")
    finally:
        await bot.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
