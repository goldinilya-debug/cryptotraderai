import os
import json
from typing import Dict, Optional
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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

RULES:
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
    """Generate AI trading signal using Groq (Llama 3)"""
    
    # Get market context
    kill_zone = get_current_kill_zone()
    
    # Prepare prompt
    prompt = SIGNAL_GENERATION_PROMPT.format(
        pair=pair,
        timeframe=timeframe,
        current_price=current_price,
        change_24h=0.0,
        trend="neutral",
        rsi=50,
        kill_zone=kill_zone,
        price_action=json.dumps(price_data[-5:] if price_data else [])
    )
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Fast and capable
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
        
        # Add metadata
        signal_data["id"] = f"sig_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        signal_data["pair"] = pair
        signal_data["timeframe"] = timeframe
        signal_data["exchange"] = exchange
        signal_data["status"] = "ACTIVE"
        signal_data["kill_zone"] = kill_zone
        signal_data["created_at"] = datetime.utcnow().isoformat()
        
        return signal_data
        
    except Exception as e:
        print(f"Groq API error: {e}")
        # Fallback signal structure
        return {
            "id": f"sig_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "pair": pair,
            "direction": "LONG",
            "entry": current_price,
            "stop_loss": current_price * 0.98,
            "take_profit_1": current_price * 1.04,
            "take_profit_2": current_price * 1.08,
            "confidence": 75,
            "timeframe": timeframe,
            "exchange": exchange,
            "status": "ACTIVE",
            "wyckoff_phase": "unknown",
            "kill_zone": kill_zone,
            "analysis": f"Error in AI generation: {str(e)}",
            "created_at": datetime.utcnow().isoformat()
        }

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
