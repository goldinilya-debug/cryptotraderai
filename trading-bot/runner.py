"""
CryptoTraderAI — Bot Runner
Runs smc_bot + signal_monitor as background asyncio tasks.
Exposes a minimal FastAPI health endpoint so Render web service stays alive.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
import os
from datetime import datetime

from smc_bot import TradingBot
from signal_monitor import SignalMonitor

# ─── Background tasks ─────────────────────────────────────────────────────────

_status = {
    "smc_bot":        {"running": False, "last_scan": None, "errors": 0},
    "signal_monitor": {"running": False, "last_check": None, "errors": 0},
}

async def run_smc_bot():
    bot = TradingBot()
    _status["smc_bot"]["running"] = True
    try:
        while True:
            try:
                for symbol in bot.SYMBOLS if hasattr(bot, "SYMBOLS") else ["BTC/USDT", "ETH/USDT", "SOL/USDT"]:
                    await bot.analyze_symbol(symbol)
                    await asyncio.sleep(2)
                await bot.check_existing_signals()
                _status["smc_bot"]["last_scan"] = datetime.utcnow().isoformat()
            except Exception as e:
                _status["smc_bot"]["errors"] += 1
                print(f"[smc_bot] error: {e}")
            await asyncio.sleep(30)
    finally:
        await bot.cleanup()
        _status["smc_bot"]["running"] = False

async def run_signal_monitor():
    monitor = SignalMonitor()
    _status["signal_monitor"]["running"] = True
    try:
        await monitor.run()
    finally:
        await monitor.cleanup()
        _status["signal_monitor"]["running"] = False

# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start both bots on startup
    t1 = asyncio.create_task(run_smc_bot())
    t2 = asyncio.create_task(run_signal_monitor())
    print("🚀 smc_bot + signal_monitor started")
    yield
    # Shutdown
    t1.cancel()
    t2.cancel()

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(title="CryptoTraderAI Bot Runner", lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok", "bots": _status, "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
def root():
    return {"name": "CryptoTraderAI Bot Runner", "bots": list(_status.keys())}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("runner:app", host="0.0.0.0", port=port)
