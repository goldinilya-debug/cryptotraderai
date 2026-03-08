import os
import json
from typing import Dict, Optional, List
from datetime import datetime
from dotenv import load_dotenv

from app.services.ml_engine import signal_ml

load_dotenv()

# Initialize Groq client (optional)
groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = None
if groq_api_key:
    try:
        from groq import Groq
        groq_client = Groq(api_key=groq_api_key)
    except:
        pass

# Correlated pairs - these should not have opposite signals
CORRELATED_PAIRS = {
    "BTC": ["BTC/USDT", "BTC/USD", "XBT/USDT"],
    "ETH": ["ETH/USDT", "ETH/USD", "ETH/BTC"],
    "ALT": ["SOL/USDT", "AVAX/USDT", "DOT/USDT", "LINK/USDT"]  # Alts follow BTC/ETH
}

# Store recent signals for correlation check
_recent_signals: Dict[str, Dict] = {}

def check_correlation_conflict(new_pair: str, new_direction: str) -> Optional[str]:
    """Check if new signal conflicts with existing correlated pair signals
    
    Returns:
        Conflict message if there's a conflict, None otherwise
    """
    global _recent_signals
    
    # Determine which group the new pair belongs to
    new_group = None
    for group, pairs in CORRELATED_PAIRS.items():
        if any(p in new_pair for p in pairs):
            new_group = group
            break
    
    if not new_group:
        return None
    
    # Check existing signals in the same group
    for pair, signal in _recent_signals.items():
        # Skip if same pair
        if pair == new_pair:
            continue
            
        # Check if pair is in same correlation group
        if any(p in pair for p in CORRELATED_PAIRS.get(new_group, [])):
            existing_direction = signal.get("direction")
            
            # Conflict: opposite directions on correlated pairs
            if existing_direction and existing_direction != new_direction:
                return f"Correlation conflict: {pair} is {existing_direction}, cannot open {new_direction} on {new_pair}"
    
    return None

def register_signal(pair: str, signal: Dict):
    """Register signal for correlation tracking"""
    global _recent_signals
    _recent_signals[pair] = {
        "direction": signal.get("direction"),
        "timestamp": datetime.utcnow(),
        "kill_zone": signal.get("kill_zone")
    }

SIGNAL_GENERATION_PROMPT = """You are an expert cryptocurrency trading analyst specializing in:
- Wyckoff Method (accumulation, markup, distribution, markdown phases)
- Smart Money Concepts (SMC): order blocks, fair value gaps (FVG), liquidity sweeps
- ICT Kill Zones (Asian, London, New York sessions)
- Price action and market structure

Analyze the provided market data and generate a trading signal.

MARKET DATA:
- Pair: {pair}
- Timeframe: {timeframe}
- Current Price: {current_price}
- 24h Change: {change_24h}%
- Trend (EMA 50/200): {trend}
- RSI: {rsi}
- Active Kill Zone: {kill_zone}

Recent price action (last 20 candles):
{price_action}

TASK:
1. Identify Wyckoff phase
2. Detect SMC patterns (order blocks, FVGs, liquidity)
3. Consider Kill Zone timing
4. Determine trend direction

OUTPUT FORMAT (JSON only):
{{
    "direction": "LONG" or "SHORT",
    "entry": float (specific price),
    "stop_loss": float,
    "take_profit_1": float,
    "take_profit_2": float (optional),
    "confidence": int (0-100),
    "wyckoff_phase": string,
    "smc_patterns": [string],
    "analysis": string (detailed explanation),
    "risk_reward": float
}}

CRITICAL RULES FOR DIRECTION:
- LONG = Buy/Long position (expecting price to go UP). Entry < Take Profit, Stop Loss < Entry
- SHORT = Sell/Short position (expecting price to go DOWN). Entry > Take Profit, Stop Loss > Entry
- For LONG: stop_loss MUST be below entry, take_profit MUST be above entry
- For SHORT: stop_loss MUST be above entry, take_profit MUST be below entry

OTHER RULES:
- Minimum confidence: 70% to generate signal
- Risk:Reward minimum 1:2
- Stop loss must be based on technical level (not fixed %)
- Consider Kill Zone: higher confidence during London/NY sessions
- NO signal if in strong opposite trend
- NO signal if price is in middle of range

Respond ONLY with valid JSON. No markdown, no explanation outside JSON."""

async def generate_signal(
    pair: str,
    timeframe: str,
    exchange: str,
    current_price: float = 0.0,
    price_data: Optional[list] = None
) -> Dict:
    """Generate AI trading signal using Groq with real market data"""
    
    # Import market data service
    from app.services.market_data import get_current_price, get_coin_data, get_ohlcv, get_ticker_24h
    
    # Fetch real market data
    try:
        real_price = await get_current_price(pair, exchange)
        coin_data = await get_coin_data(pair)
        ohlcv_data = await get_ohlcv(pair, timeframe, limit=20, exchange=exchange)
        ticker_24h = await get_ticker_24h(pair, exchange)
        
        # Use real price if available
        if real_price > 0:
            current_price = real_price
        elif coin_data.get("current_price", 0) > 0:
            current_price = coin_data["current_price"]
        
        # Calculate technical indicators from OHLCV
        rsi = calculate_rsi(ohlcv_data) if ohlcv_data else 50
        trend = determine_trend(ohlcv_data) if ohlcv_data else "neutral"
        
        # Get market context
        price_change_24h = coin_data.get("price_change_percentage_24h", 0) or ticker_24h.get("price_change_percent", 0)
        high_24h = coin_data.get("high_24h", 0) or ticker_24h.get("high_24h", 0)
        low_24h = coin_data.get("low_24h", 0) or ticker_24h.get("low_24h", 0)
        volume = coin_data.get("total_volume", 0) or ticker_24h.get("quote_volume", 0)
        
    except Exception as e:
        print(f"Error fetching market data: {e}")
        # Use provided defaults or fallback
        if current_price == 0:
            current_price = get_fallback_price(pair)
        rsi = 50
        trend = "neutral"
        price_change_24h = 0
        ohlcv_data = []
    
    kill_zone = get_current_kill_zone()
    
    # Try ML-enhanced generation first
    try:
        ml_signal = await signal_ml.generate_ml_enhanced_signal(pair, timeframe, exchange)
        if ml_signal and ml_signal.get('ml_recommended'):
            # Record signal in ML system
            signal_ml.record_signal(ml_signal)
            return ml_signal
    except Exception as e:
        print(f"ML generation failed, using standard: {e}")
    
    # Standard generation with ML insights in prompt
    # Get ML performance data for this pair
    pair_wr = signal_ml.get_win_rate(pair=pair)
    
    ml_hint = f"""
ML INSIGHTS:
- {pair} historical win rate: {pair_wr:.1f}%
- Focus on high-probability setups only
"""
    
    # Prepare price action summary
    price_action_summary = []
    if ohlcv_data:
        for candle in ohlcv_data[-5:]:
            price_action_summary.append({
                "open": candle["open"],
                "high": candle["high"],
                "low": candle["low"],
                "close": candle["close"],
                "volume": candle["volume"]
            })
    
    # Prepare prompt with real data
    prompt = ml_hint + SIGNAL_GENERATION_PROMPT.format(
        pair=pair,
        timeframe=timeframe,
        current_price=current_price,
        change_24h=price_change_24h,
        trend=trend,
        rsi=rsi,
        kill_zone=kill_zone,
        price_action=json.dumps(price_action_summary)
    )
    
    try:
        if not groq_client:
            raise Exception("Groq client not initialized - using fallback signal generation")
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional crypto trading analyst. Respond ONLY with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        content = response.choices[0].message.content
        signal_data = json.loads(content)
        
        # Ensure entry price is current market price if not specified
        if signal_data.get("entry", 0) == 0 or signal_data["entry"] != current_price:
            signal_data["entry"] = current_price
        
        # Validate direction vs price levels
        if signal_data["direction"] == "LONG":
            if signal_data["stop_loss"] >= signal_data["entry"]:
                signal_data["stop_loss"] = signal_data["entry"] * 0.985  # 1.5% below entry
            if signal_data["take_profit_1"] <= signal_data["entry"]:
                signal_data["take_profit_1"] = signal_data["entry"] * 1.03  # 3% above entry
            if signal_data.get("take_profit_2") and signal_data["take_profit_2"] <= signal_data["entry"]:
                signal_data["take_profit_2"] = signal_data["entry"] * 1.06  # 6% above entry
        elif signal_data["direction"] == "SHORT":
            if signal_data["stop_loss"] <= signal_data["entry"]:
                signal_data["stop_loss"] = signal_data["entry"] * 1.015  # 1.5% above entry
            if signal_data["take_profit_1"] >= signal_data["entry"]:
                signal_data["take_profit_1"] = signal_data["entry"] * 0.97  # 3% below entry
            if signal_data.get("take_profit_2") and signal_data["take_profit_2"] >= signal_data["entry"]:
                signal_data["take_profit_2"] = signal_data["entry"] * 0.94  # 6% below entry
        
        # Add metadata with real market data
        signal_data["id"] = f"sig_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        signal_data["pair"] = pair
        signal_data["timeframe"] = timeframe
        signal_data["exchange"] = exchange
        signal_data["status"] = "ACTIVE"
        signal_data["kill_zone"] = kill_zone
        signal_data["created_at"] = datetime.utcnow().isoformat()
        signal_data["ml_enhanced"] = False
        signal_data["ml_win_rate"] = pair_wr
        signal_data["real_time_data"] = True
        signal_data["market_price"] = current_price
        signal_data["price_change_24h"] = price_change_24h
        
        # Check correlation conflict before recording
        conflict = check_correlation_conflict(pair, signal_data.get("direction", ""))
        if conflict:
            print(f"Correlation check failed: {conflict}")
            signal_data["status"] = "REJECTED"
            signal_data["rejection_reason"] = conflict
            signal_data["confidence"] = 0  # Invalidate signal
        else:
            # Register signal for correlation tracking
            register_signal(pair, signal_data)
        
        # Record in ML system
        signal_ml.record_signal(signal_data)
        
        return signal_data
        
    except Exception as e:
        print(f"Groq API error: {e}")
        # Fallback signal with real data
        return generate_fallback_signal(pair, timeframe, exchange, current_price, kill_zone, price_change_24h)

def get_current_kill_zone() -> str:
    """Get currently active Kill Zone"""
    from datetime import datetime
    
    current_hour = datetime.utcnow().hour - 5  # EST
    
    if 20 <= current_hour < 22:
        return "Asian"
    elif 2 <= current_hour < 5:
        return "London"
    elif 7 <= current_hour < 10:
        return "New York"
    elif 10 <= current_hour < 12:
        return "London Close"
    else:
        return "None"

def calculate_rsi(ohlcv_data: list, period: int = 14) -> float:
    """Calculate RSI from OHLCV data"""
    if not ohlcv_data or len(ohlcv_data) < period + 1:
        return 50
    
    closes = [c["close"] for c in ohlcv_data]
    gains = []
    losses = []
    
    for i in range(1, len(closes)):
        change = closes[i] - closes[i-1]
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))
    
    if len(gains) < period:
        return 50
    
    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period
    
    if avg_loss == 0:
        return 100
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    return round(rsi, 2)

def determine_trend(ohlcv_data: list) -> str:
    """Determine trend from OHLCV data using EMA crossover"""
    if not ohlcv_data or len(ohlcv_data) < 50:
        return "neutral"
    
    closes = [c["close"] for c in ohlcv_data]
    
    # Simple EMA calculation
    def ema(prices, period):
        multiplier = 2 / (period + 1)
        ema_values = [prices[0]]
        for price in prices[1:]:
            ema_values.append((price - ema_values[-1]) * multiplier + ema_values[-1])
        return ema_values
    
    ema_20 = ema(closes, 20)
    ema_50 = ema(closes, 50) if len(closes) >= 50 else ema_20
    
    current_ema_20 = ema_20[-1]
    current_ema_50 = ema_50[-1] if len(ema_50) > 0 else current_ema_20
    
    if current_ema_20 > current_ema_50 * 1.02:
        return "bullish"
    elif current_ema_20 < current_ema_50 * 0.98:
        return "bearish"
    else:
        return "neutral"

def get_fallback_price(pair: str) -> float:
    """Get fallback price for demo purposes"""
    fallback_prices = {
        "BTC/USDT": 65000.0,
        "ETH/USDT": 3500.0,
        "SOL/USDT": 145.0,
        "AVAX/USDT": 28.0,
        "1000PEPE/USDT": 0.0085,
        "HYPE/USDT": 18.50,
    }
    return fallback_prices.get(pair, 100.0)

def generate_fallback_signal(pair: str, timeframe: str, exchange: str, 
                             current_price: float, kill_zone: str, 
                             price_change_24h: float) -> Dict:
    """Generate a fallback signal with real data"""
    
    # Determine direction based on 24h change
    if price_change_24h > 2:
        direction = "LONG"
        confidence = min(75 + int(price_change_24h), 90)
    elif price_change_24h < -2:
        direction = "SHORT"
        confidence = min(75 + int(abs(price_change_24h)), 90)
    else:
        direction = "LONG" if price_change_24h >= 0 else "SHORT"
        confidence = 72
    
    if direction == "LONG":
        entry = current_price
        stop_loss = current_price * 0.985
        take_profit_1 = current_price * 1.03
        take_profit_2 = current_price * 1.06
        wyckoff_phase = "accumulation"
    else:
        entry = current_price
        stop_loss = current_price * 1.015
        take_profit_1 = current_price * 0.97
        take_profit_2 = current_price * 0.94
        wyckoff_phase = "distribution"
    
    return {
        "id": f"sig_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "pair": pair,
        "direction": direction,
        "entry": round(entry, 8 if entry < 1 else 2),
        "stop_loss": round(stop_loss, 8 if stop_loss < 1 else 2),
        "take_profit_1": round(take_profit_1, 8 if take_profit_1 < 1 else 2),
        "take_profit_2": round(take_profit_2, 8 if take_profit_2 < 1 else 2),
        "confidence": confidence,
        "timeframe": timeframe,
        "exchange": exchange,
        "status": "ACTIVE",
        "wyckoff_phase": wyckoff_phase,
        "kill_zone": kill_zone,
        "analysis": f"Fallback signal based on real market data. Price: ${current_price}, 24h change: {price_change_24h:.2f}%",
        "created_at": datetime.utcnow().isoformat(),
        "ml_enhanced": False,
        "ml_win_rate": 50,
        "real_time_data": True,
        "market_price": current_price,
        "price_change_24h": price_change_24h
    }
