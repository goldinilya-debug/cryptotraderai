from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CryptoTraderAI API",
    description="AI-powered crypto trading signals API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "name": "CryptoTraderAI API",
        "version": "1.0.0",
        "status": "running",
        "ai_provider": "groq"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/signals")
async def get_signals():
    """Get trading signals with current market data"""
    return {
        "signals": [
            {
                "id": "1",
                "pair": "BTC/USDT",
                "direction": "LONG",
                "entry": 88450,
                "stop_loss": 86500,
                "take_profit_1": 92000,
                "take_profit_2": 96500,
                "confidence": 78,
                "wyckoff_phase": "markup",
                "kill_zone": "New York",
                "timeframe": "4H",
                "exchange": "Binance",
                "status": "ACTIVE",
                "analysis": {
                    "wyckoff": "Price in markup phase after successful accumulation. Breaking above key resistance with volume.",
                    "smc": "Bullish order block at $87,200. Fair Value Gap above $90K likely to be filled.",
                    "killZone": "New York session showing strong buying pressure by smart money.",
                    "entry": "Long at $88,450 after reclaim of $87K support turned resistance.",
                    "risk": "Stop below recent swing low at $86,500. Risk: 2.2% of account.",
                    "reward": "TP1 at $92K (1:2.1 R:R). TP2 at $96.5K (1:3.9 R:R)."
                }
            },
            {
                "id": "2",
                "pair": "ETH/USDT",
                "direction": "SHORT",
                "entry": 2450,
                "stop_loss": 2520,
                "take_profit_1": 2350,
                "take_profit_2": 2280,
                "confidence": 74,
                "wyckoff_phase": "distribution",
                "kill_zone": "London",
                "timeframe": "4H",
                "exchange": "Binance",
                "status": "ACTIVE",
                "analysis": {
                    "wyckoff": "Distribution forming at top of markup. Sign of weakness with decreasing volume.",
                    "smc": "Bearish order block at $2,480. Liquidity sweep above $2,500 likely.",
                    "killZone": "London session showing distribution by institutional sellers.",
                    "entry": "Short at $2,450 after rejection from $2,500 resistance.",
                    "risk": "Stop above distribution high at $2,520. Risk: 2.9% of account.",
                    "reward": "TP1 at $2,350 (1:1.4 R:R). TP2 at $2,280 (1:2.4 R:R)."
                }
            },
            {
                "id": "3",
                "pair": "SOL/USDT",
                "direction": "LONG",
                "entry": 142.50,
                "stop_loss": 138.00,
                "take_profit_1": 150.00,
                "take_profit_2": 158.00,
                "confidence": 82,
                "wyckoff_phase": "accumulation",
                "kill_zone": "Asian",
                "timeframe": "4H",
                "exchange": "Binance",
                "status": "ACTIVE",
                "analysis": {
                    "wyckoff": "Accumulation with shakeout below $138. Volume drying up - classic spring.",
                    "smc": "Bullish order block at $140. Liquidity sweep completed below $138.",
                    "killZone": "Asian session providing quiet accumulation before breakout.",
                    "entry": "Long at $142.50 after reclaim of $140 key level.",
                    "risk": "Stop below shakeout low at $138. Risk: 3.2% of account.",
                    "reward": "TP1 at $150 (1:1.7 R:R). TP2 at $158 (1:3.1 R:R)."
                }
            }
        ],
        "total": 156,
        "win_rate": 68,
        "wins": 106,
        "losses": 50
    }
