from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, time as dt_time
import time

from app.routers import signals, analysis, performance, killzones, ml, ml_settings, sniper, tradingview, auth
from app.services.signal_generator_dynamic import start_signal_generation

# Global storage for SMC signals (Step 1 from TD)
current_signal = {
    "active": False,
    "type": "NONE",
    "entry": 0,
    "sl": 0,
    "tp": 0,
    "probability": "0%",
    "symbol": "BTC/USDT",
    "timestamp": None
}

trade_history = []  # Step 6 - Trade journal

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start background tasks on startup"""
    # Start signal generator in background
    import asyncio
    asyncio.create_task(start_signal_generation())
    print("🚀 Signal generator started")
    
    yield
    
    # Cleanup on shutdown
    print("👋 Shutting down...")

app = FastAPI(
    title="CryptoTraderAI API",
    description="AI-powered crypto trading signals API with ML + SMC Sniper + Multi-tenant + Dynamic Signals + FVG Detection",
    version="3.2.0",
    lifespan=lifespan
)

# CORS - Updated for TD Step 1
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cryptotraderai.app",
        "https://goldinilya-debug.github.io",
        "https://cryptotraderai-bot.loca.lt",
        "http://localhost:3000",
        "*"  # Temporary for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(performance.router, prefix="/api/performance", tags=["performance"])
app.include_router(killzones.router, prefix="/api/killzones", tags=["killzones"])
app.include_router(ml.router, prefix="/api/ml", tags=["ml"])
app.include_router(ml_settings.router, prefix="/api/ml/settings", tags=["ml-settings"])
app.include_router(sniper.router, prefix="/api/sniper", tags=["sniper"])
app.include_router(tradingview.router, prefix="", tags=["tradingview"])

# Step 1: New endpoints for SMC FVG signals
@app.post("/update_signal")
async def update_signal(data: Request):
    """Receive FVG signal from trading bot"""
    global current_signal
    payload = await data.json()
    
    current_signal = {
        "active": True,
        "type": payload.get("type", "BULLISH_FVG"),
        "entry": payload.get("entry"),
        "sl": payload.get("sl"),
        "tp": payload.get("tp"),
        "probability": payload.get("probability", "75%"),
        "symbol": payload.get("symbol", "BTC/USDT"),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Step 6: Save to history
    trade_history.append({
        "time": datetime.utcnow().strftime("%H:%M:%S"),
        "type": payload.get("type", "BULLISH_FVG"),
        "entry": payload.get("entry"),
        "result": "PENDING",
        "symbol": payload.get("symbol", "BTC/USDT")
    })
    
    # Keep only last 50 trades
    if len(trade_history) > 50:
        trade_history.pop(0)
    
    return {"status": "updated", "signal": current_signal}

@app.get("/analyze")
async def analyze(symbol: str = "BTC/USDT"):
    """Get current FVG setup for frontend"""
    return {
        "setup": current_signal,
        "current_price": current_signal["entry"] if current_signal["active"] else 0,
        "history": [],  # OHLCV data would be fetched here
        "symbol": symbol,
        "timestamp": datetime.utcnow().isoformat()
    }

# Step 6: History endpoint
@app.get("/history")
async def get_history(limit: int = 10):
    """Get last N trade signals"""
    return {
        "history": trade_history[-limit:][::-1],  # Return newest first
        "total": len(trade_history)
    }

@app.post("/update_result")
async def update_result(data: Request):
    """Update result of a trade (called by bot when TP/SL hit)"""
    payload = await data.json()
    entry = payload.get("entry")
    result = payload.get("result")  # "WIN" or "LOSS"
    
    # Find and update the trade
    for trade in reversed(trade_history):
        if trade["entry"] == entry and trade["result"] == "PENDING":
            trade["result"] = result
            return {"status": "updated", "trade": trade}
    
    return {"status": "not_found"}

@app.get("/")
async def root():
    return {
        "name": "CryptoTraderAI API",
        "version": "3.2.0",
        "status": "running",
        "ai_provider": "groq",
        "ml_enabled": True,
        "fvg_detection": True,
        "features": ["ML", "SMC", "FVG", "Telegram", "Trade Journal"]
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "ml_model": "trained",
        "active_signals": 1 if current_signal["active"] else 0,
        "history_count": len(trade_history),
        "signal_generator": "running"
    }

@app.post("/generate_manual")
async def generate_manual():
    """Manually trigger signal generation"""
    from app.services.signal_generator_dynamic import signal_generator
    import asyncio
    
    # Generate signals for all pairs
    pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT"]
    results = []
    
    for pair in pairs:
        try:
            await signal_generator.analyze_and_generate(pair)
            results.append({"pair": pair, "status": "processed"})
            await asyncio.sleep(1)
        except Exception as e:
            results.append({"pair": pair, "status": "error", "error": str(e)})
    
    return {"status": "generation_complete", "results": results, "timestamp": datetime.utcnow().isoformat()}
