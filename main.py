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
    """Get trading signals"""
    return {
        "signals": [
            {
                "id": "1",
                "pair": "BTC/USDT",
                "direction": "LONG",
                "entry": 63500,
                "stop_loss": 62800,
                "take_profit_1": 64500,
                "take_profit_2": 65500,
                "confidence": 82,
                "wyckoff_phase": "accumulation",
                "kill_zone": "London",
                "timeframe": "4H",
                "exchange": "Binance",
                "status": "ACTIVE",
                "analysis": "Price in accumulation. Spring test completed. Long at $63,500 after BOS."
            }
        ],
        "total": 42,
        "win_rate": 36,
        "wins": 13,
        "losses": 23
    }
