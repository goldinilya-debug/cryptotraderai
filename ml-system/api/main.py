"""
ML API Service
FastAPI сервис для генерации сигналов с self-learning через Supabase
"""
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import asyncio
import json
import logging
import requests
from datetime import datetime
import sys
import os

# Add paths
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'models'))

from fetcher import DataFetcher
from features import FeatureEngineer
from base_model import TradingModel
from signal_generator import SignalGenerator, TradingSignal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────

MAIN_API_URL = os.environ.get("MAIN_API_URL", "https://cryptotraderai.onrender.com")

# Supabase (optional — used for persistent training data)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase connected")
    except Exception as e:
        logger.warning(f"Supabase not available: {e}")

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CryptoTraderAI ML API",
    description="ML-powered trading signals API with self-learning",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Components ───────────────────────────────────────────────────────────────

fetcher = DataFetcher()
engineer = FeatureEngineer()
model = TradingModel()
generator = SignalGenerator()

price_cache = {}
signal_cache = {}  # signal_id → signal data (in-memory, for feedback linking)

# ─── Models ───────────────────────────────────────────────────────────────────

class SignalRequest(BaseModel):
    symbol: str = "BTCUSDT"
    timeframe: str = "1h"
    account_balance: float = 10000

class FeedbackRequest(BaseModel):
    signal_id: str
    outcome: str  # 'WIN' or 'LOSS'
    pnl: Optional[float] = None

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _push_signal_to_main_api(signal_data: dict, symbol: str, timeframe: str) -> bool:
    """Forward generated ML signal to main API so it appears on the dashboard."""
    try:
        direction = "LONG" if signal_data.get("side") == "buy" else "SHORT"
        entry = signal_data.get("entry", {})
        payload = {
            "symbol": symbol.replace("USDT", "/USDT"),
            "direction": direction,
            "entry_price": entry.get("price") if isinstance(entry, dict) else entry,
            "stop_loss": signal_data.get("stop_loss"),
            "take_profit": signal_data.get("take_profit", {}).get("tp1") if isinstance(signal_data.get("take_profit"), dict) else signal_data.get("take_profit"),
            "confidence": round(signal_data.get("metadata", {}).get("confidence", 0) * 100, 1),
            "timeframe": timeframe,
            "signal_type": "ML",
            "exchange": "binance",
        }
        resp = requests.post(f"{MAIN_API_URL}/update_signal", json=payload, timeout=5)
        return resp.status_code == 200
    except Exception as e:
        logger.warning(f"Could not forward signal to main API: {e}")
        return False

def _load_training_data() -> List[Dict]:
    """Load training data: prefer Supabase, fall back to local file."""
    # Try Supabase first
    if supabase:
        try:
            resp = requests.get(f"{MAIN_API_URL}/api/outcomes?limit=500", timeout=5)
            if resp.status_code == 200:
                outcomes = resp.json().get("outcomes", [])
                if outcomes:
                    logger.info(f"Loaded {len(outcomes)} outcomes from Supabase via main API")
                    return outcomes
        except Exception as e:
            logger.warning(f"Could not fetch outcomes from main API: {e}")

    # Fall back to local file
    if os.path.exists('training_data.json'):
        with open('training_data.json', 'r') as f:
            return json.load(f)
    return []

def _save_training_sample(signal_id: str, outcome: str, pnl: Optional[float]):
    """Persist a training sample to local file (Supabase is updated via main API)."""
    data = _load_training_data()
    if signal_id in signal_cache:
        signal_data = signal_cache[signal_id]
        data.append({
            'signal_id': signal_id,
            'features': signal_data.get('metadata', {}).get('features', {}),
            'outcome': outcome,
            'pnl': pnl,
            'timestamp': datetime.utcnow().isoformat()
        })
        try:
            with open('training_data.json', 'w') as f:
                json.dump(data[-500:], f, indent=2)  # keep last 500
        except Exception as e:
            logger.warning(f"Could not save training data locally: {e}")
    return data

# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "CryptoTraderAI ML API",
        "version": "2.0.0",
        "status": "running",
        "supabase": "connected" if supabase else "not configured",
        "main_api": MAIN_API_URL,
        "endpoints": ["/signal/{symbol}/{timeframe}", "/predict", "/feedback", "/train", "/ws/signals"],
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/signal/{symbol}/{timeframe}")
async def get_signal(symbol: str, timeframe: str, balance: float = 10000):
    """Generate a trading signal and push it to the main API dashboard."""
    try:
        df = fetcher.fetch_data(symbol, timeframe, limit=100)
        if df is None:
            raise HTTPException(status_code=404, detail=f"No data for {symbol}")

        features_df = engineer.prepare_features(df)
        prediction = model.predict(features_df)
        signal = generator.generate_signal(
            symbol=symbol, timeframe=timeframe,
            df=features_df, prediction=prediction, account_balance=balance
        )

        if signal is None:
            return {
                "signal": None,
                "message": "No signal (confidence too low or filters rejected)",
                "prediction": prediction,
                "timestamp": datetime.utcnow().isoformat()
            }

        bot_signal = generator.format_signal_for_bot(signal)
        signal_id = f"{symbol}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        bot_signal['id'] = signal_id
        signal_cache[signal_id] = bot_signal

        # Forward to main API → appears on dashboard
        forwarded = _push_signal_to_main_api(bot_signal, symbol, timeframe)
        logger.info(f"Signal {signal_id} forwarded to dashboard: {forwarded}")

        return {
            "signal": bot_signal,
            "model_confidence": prediction['confidence'],
            "forwarded_to_dashboard": forwarded,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error generating signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict(request: SignalRequest):
    try:
        df = fetcher.fetch_data(request.symbol, request.timeframe)
        if df is None:
            raise HTTPException(status_code=404, detail="No data available")

        features_df = engineer.prepare_features(df)
        prediction = model.predict(features_df)
        return {
            "symbol": request.symbol,
            "timeframe": request.timeframe,
            "prediction": prediction,
            "current_price": df['close'].iloc[-1],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def feedback(request: FeedbackRequest):
    """Record trade outcome and retrain model."""
    training_data = _save_training_sample(request.signal_id, request.outcome, request.pnl)

    if request.signal_id not in signal_cache:
        # Signal not in cache (e.g. after restart) — still retrain on all available data
        all_data = _load_training_data()
        if len(all_data) >= 10:
            model.train(all_data)
        return {
            "success": True,
            "message": "Outcome recorded. Signal not in cache but model retrained on existing data.",
            "total_samples": len(all_data)
        }

    if len(training_data) >= 10:
        model.train(training_data)

    return {
        "success": True,
        "message": "Feedback recorded and model retrained",
        "total_samples": len(training_data),
        "new_weights": model.weights
    }

@app.post("/train")
async def train():
    """Manually trigger retraining from Supabase outcomes."""
    training_data = _load_training_data()
    if len(training_data) < 10:
        return {
            "success": False,
            "message": f"Not enough data to train ({len(training_data)}/10 minimum)",
            "total_samples": len(training_data)
        }
    model.train(training_data)
    return {
        "success": True,
        "message": f"Model retrained on {len(training_data)} samples",
        "new_weights": model.weights
    }

@app.get("/stats")
async def get_stats():
    training_data = _load_training_data()
    wins = sum(1 for d in training_data if d.get('outcome') == 'WIN')
    losses = sum(1 for d in training_data if d.get('outcome') == 'LOSS')
    return {
        "model_weights": model.weights,
        "feature_importance": model.get_feature_importance(),
        "cached_signals": len(signal_cache),
        "training_samples": len(training_data),
        "win_rate": round(wins / (wins + losses) * 100, 1) if (wins + losses) > 0 else 0,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.websocket("/ws/signals")
async def websocket_signals(websocket: WebSocket):
    """Real-time signal stream."""
    await websocket.accept()
    logger.info("WebSocket connected")
    try:
        while True:
            data = await websocket.receive_json()
            symbol = data.get('symbol', 'BTCUSDT')
            timeframe = data.get('timeframe', '1h')
            df = fetcher.fetch_data(symbol, timeframe)
            if df is not None:
                features_df = engineer.prepare_features(df)
                prediction = model.predict(features_df)
                await websocket.send_json({
                    "symbol": symbol,
                    "timeframe": timeframe,
                    "prediction": prediction,
                    "current_price": df['close'].iloc[-1],
                    "timestamp": datetime.utcnow().isoformat()
                })
            await asyncio.sleep(30)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        logger.info("WebSocket disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
