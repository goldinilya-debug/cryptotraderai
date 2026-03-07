import os
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import random

from app.services.market_data import get_current_price, get_ohlcv
from app.services.smc_analysis import analyzeSMC
from app.services.wyckoff_analysis import analyzeWyckoff
from app.services.technical_analysis import calculateTechnicalIndicators
from app.services.telegram_service import send_signal_to_telegram

@dataclass
class Signal:
    id: str
    pair: str
    direction: str  # 'LONG' or 'SHORT'
    entry: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: float
    confidence: int
    timeframe: str
    exchange: str
    status: str  # 'ACTIVE', 'CLOSED', 'HIT_SL', 'HIT_TP'
    wyckoff_phase: str
    kill_zone: str
    smc_bias: str
    risk_reward: float
    created_at: datetime
    analysis: str = ""

class SignalGenerator:
    """Dynamic signal generator with real-time data"""
    
    def __init__(self):
        self.active_signals: Dict[str, Signal] = {}
        self.signal_history: List[Signal] = []
        self.pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "AVAX/USDT", "DOT/USDT"]
        self.running = False
        self.telegram_enabled = True
    
    async def start(self):
        """Start continuous signal generation"""
        self.running = True
        print("🚀 Signal generator started")
        
        while self.running:
            try:
                # Generate signals for each pair
                for pair in self.pairs:
                    await self.analyze_and_generate(pair)
                    await asyncio.sleep(2)  # Small delay between pairs
                
                # Check existing signals (TP/SL)
                await self.check_existing_signals()
                
                # Wait before next cycle
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                print(f"❌ Error in signal generator: {e}")
                await asyncio.sleep(30)
    
    async def analyze_and_generate(self, pair: str):
        """Analyze pair and generate signal if conditions met"""
        try:
            # Get real price data
            current_price = await get_current_price(pair, "binance")
            ohlcv = await get_ohlcv(pair, "1h", limit=100)
            
            if not ohlcv or len(ohlcv) < 50:
                return
            
            # Run analysis
            ta = calculateTechnicalIndicators(ohlcv)
            smc = analyzeSMC(ohlcv)
            wyckoff = analyzeWyckoff(ohlcv)
            
            # Calculate signal score
            long_score = self._calculate_long_score(ta, smc, wyckoff)
            short_score = self._calculate_short_score(ta, smc, wyckoff)
            
            # Generate signal if score high enough
            if long_score >= 70 and long_score > short_score:
                signal = await self._create_signal(
                    pair, "LONG", current_price, ta, smc, wyckoff, long_score
                )
                await self._process_new_signal(signal)
                
            elif short_score >= 70 and short_score > long_score:
                signal = await self._create_signal(
                    pair, "SHORT", current_price, ta, smc, wyckoff, short_score
                )
                await self._process_new_signal(signal)
                
        except Exception as e:
            print(f"❌ Error analyzing {pair}: {e}")
    
    def _calculate_long_score(self, ta: Dict, smc: Dict, wyckoff: Dict) -> int:
        """Calculate bullish signal score"""
        score = 50  # Base score
        
        # TA factors
        if ta.get("rsi", 50) < 70:
            score += 5
        if ta.get("macd", 0) > 0:
            score += 10
        if ta.get("ema20", 0) > ta.get("ema50", 0):
            score += 10
        if ta.get("adx", 0) > 25:
            score += 5
        
        # SMC factors
        if smc.get("bias") == "bullish":
            score += 15
        if len(smc.get("orderBlocks", [])) > 0:
            score += 5
        if len(smc.get("breaks", [])) > 0:
            score += 5
        
        # Wyckoff factors
        if wyckoff.get("phase") in ["accumulation", "markup"]:
            score += 15
        if wyckoff.get("confidence", 0) > 60:
            score += 5
        
        return min(score, 95)
    
    def _calculate_short_score(self, ta: Dict, smc: Dict, wyckoff: Dict) -> int:
        """Calculate bearish signal score"""
        score = 50  # Base score
        
        # TA factors
        if ta.get("rsi", 50) > 30:
            score += 5
        if ta.get("macd", 0) < 0:
            score += 10
        if ta.get("ema20", 0) < ta.get("ema50", 0):
            score += 10
        if ta.get("adx", 0) > 25:
            score += 5
        
        # SMC factors
        if smc.get("bias") == "bearish":
            score += 15
        if len(smc.get("orderBlocks", [])) > 0:
            score += 5
        if len(smc.get("breaks", [])) > 0:
            score += 5
        
        # Wyckoff factors
        if wyckoff.get("phase") in ["distribution", "markdown"]:
            score += 15
        if wyckoff.get("confidence", 0) > 60:
            score += 5
        
        return min(score, 95)
    
    async def _create_signal(
        self, pair: str, direction: str, current_price: float,
        ta: Dict, smc: Dict, wyckoff: Dict, score: int
    ) -> Signal:
        """Create signal object"""
        
        # Calculate levels
        atr = ta.get("atr", current_price * 0.02)
        
        if direction == "LONG":
            entry = current_price
            stop_loss = current_price - (atr * 1.5)
            take_profit_1 = current_price + (atr * 3)
            take_profit_2 = current_price + (atr * 5)
        else:
            entry = current_price
            stop_loss = current_price + (atr * 1.5)
            take_profit_1 = current_price - (atr * 3)
            take_profit_2 = current_price - (atr * 5)
        
        risk = abs(entry - stop_loss)
        reward = abs(take_profit_1 - entry)
        risk_reward = reward / risk if risk > 0 else 1
        
        # Get kill zone
        kill_zone = self._get_current_kill_zone()
        
        signal = Signal(
            id=f"sig_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{pair.replace('/', '')}",
            pair=pair,
            direction=direction,
            entry=round(entry, 2),
            stop_loss=round(stop_loss, 2),
            take_profit_1=round(take_profit_1, 2),
            take_profit_2=round(take_profit_2, 2),
            confidence=score,
            timeframe="1H",
            exchange="binance",
            status="ACTIVE",
            wyckoff_phase=wyckoff.get("phase", "unknown"),
            kill_zone=kill_zone,
            smc_bias=smc.get("bias", "neutral"),
            risk_reward=round(risk_reward, 2),
            created_at=datetime.utcnow(),
            analysis=f"SMC: {smc.get('bias', 'neutral')}, Wyckoff: {wyckoff.get('phase', 'unknown')}"
        )
        
        return signal
    
    async def _process_new_signal(self, signal: Signal):
        """Process new signal - store and send to Telegram"""
        # Check if we already have an active signal for this pair
        existing = self.active_signals.get(signal.pair)
        if existing and existing.direction == signal.direction:
            return  # Don't duplicate
        
        # Store signal
        self.active_signals[signal.pair] = signal
        self.signal_history.append(signal)
        
        print(f"🎯 New signal: {signal.pair} {signal.direction} @ {signal.entry} (confidence: {signal.confidence}%)")
        
        # Send to Telegram
        if self.telegram_enabled:
            signal_dict = {
                "id": signal.id,
                "pair": signal.pair,
                "direction": signal.direction,
                "entry": signal.entry,
                "stop_loss": signal.stop_loss,
                "take_profit_1": signal.take_profit_1,
                "take_profit_2": signal.take_profit_2,
                "confidence": signal.confidence,
                "wyckoff_phase": signal.wyckoff_phase,
                "kill_zone": signal.kill_zone,
                "risk_reward": signal.risk_reward
            }
            await send_signal_to_telegram(signal_dict)
    
    async def check_existing_signals(self):
        """Check if existing signals hit TP or SL"""
        for pair, signal in list(self.active_signals.items()):
            try:
                current_price = await get_current_price(pair, "binance")
                
                if signal.direction == "LONG":
                    if current_price >= signal.take_profit_1:
                        signal.status = "HIT_TP"
                        print(f"✅ {pair} LONG hit TP1 at {current_price}")
                        del self.active_signals[pair]
                    elif current_price <= signal.stop_loss:
                        signal.status = "HIT_SL"
                        print(f"❌ {pair} LONG hit SL at {current_price}")
                        del self.active_signals[pair]
                else:  # SHORT
                    if current_price <= signal.take_profit_1:
                        signal.status = "HIT_TP"
                        print(f"✅ {pair} SHORT hit TP1 at {current_price}")
                        del self.active_signals[pair]
                    elif current_price >= signal.stop_loss:
                        signal.status = "HIT_SL"
                        print(f"❌ {pair} SHORT hit SL at {current_price}")
                        del self.active_signals[pair]
                        
            except Exception as e:
                print(f"❌ Error checking {pair}: {e}")
    
    def _get_current_kill_zone(self) -> str:
        """Get current active kill zone"""
        hour = datetime.utcnow().hour
        
        if 0 <= hour < 8:
            return "Asian"
        elif 8 <= hour < 16:
            return "London"
        elif 13 <= hour < 21:
            return "New York"
        elif 14 <= hour < 16:
            return "London Close"
        return "None"
    
    def get_active_signals(self) -> List[Dict]:
        """Get list of active signals"""
        return [
            {
                "id": s.id,
                "pair": s.pair,
                "direction": s.direction,
                "entry": s.entry,
                "stop_loss": s.stop_loss,
                "take_profit_1": s.take_profit_1,
                "take_profit_2": s.take_profit_2,
                "confidence": s.confidence,
                "timeframe": s.timeframe,
                "exchange": s.exchange,
                "status": s.status,
                "wyckoff_phase": s.wyckoff_phase,
                "kill_zone": s.kill_zone,
                "risk_reward": s.risk_reward,
                "created_at": s.created_at.isoformat()
            }
            for s in self.active_signals.values()
        ]
    
    def get_stats(self) -> Dict:
        """Get signal statistics"""
        total = len(self.signal_history)
        wins = len([s for s in self.signal_history if s.status == "HIT_TP"])
        losses = len([s for s in self.signal_history if s.status == "HIT_SL"])
        active = len(self.active_signals)
        
        return {
            "total_signals": total,
            "active_signals": active,
            "win_rate": round((wins / (wins + losses) * 100), 1) if (wins + losses) > 0 else 0,
            "wins": wins,
            "losses": losses,
            "hit_tp": wins
        }

# Global instance
signal_generator = SignalGenerator()

async def start_signal_generation():
    """Start the signal generator"""
    await signal_generator.start()
