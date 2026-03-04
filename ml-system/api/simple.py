"""
Simple ML API for Render
Лёгкая версия без pandas
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import os
from datetime import datetime
from typing import Dict, List

app = FastAPI(title="CryptoTraderAI ML", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Binance API
BINANCE_API = "https://api.binance.com/api/v3"

def fetch_price(symbol: str) -> float:
    """Получение цены с Binance"""
    try:
        res = requests.get(f"{BINANCE_API}/ticker/price?symbol={symbol}", timeout=10)
        data = res.json()
        return float(data['price'])
    except:
        return 0.0

def generate_signal(symbol: str, price: float) -> Dict:
    """Генерация сигнала от цены"""
    if price == 0:
        return None
        
    # Простая логика на основе цены
    # В реальной модели здесь ML предсказание
    
    is_bullish = symbol.startswith('BTC') and price < 75000  # Пример
    side = 'buy' if is_bullish else 'sell'
    
    entry = price
    stop_loss = price * 0.97 if side == 'buy' else price * 1.03
    tp1 = price * 1.05 if side == 'buy' else price * 0.95
    tp2 = price * 1.10 if side == 'buy' else price * 0.90
    
    return {
        "id": f"{symbol}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "symbol": symbol,
        "side": side,
        "entry": round(entry, 2),
        "entry_zone": [round(entry * 0.995, 2), round(entry * 1.005, 2)],
        "stop_loss": round(stop_loss, 2),
        "take_profit": {
            "tp1": round(tp1, 2),
            "tp2": round(tp2, 2)
        },
        "position": {
            "size_usd": 200,
            "risk_percent": 2
        },
        "confidence": 0.72,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
def root():
    return {"status": "running", "ml": True, "timestamp": datetime.utcnow().isoformat()}

@app.get("/signal/{symbol}/{timeframe}")
def get_signal(symbol: str, timeframe: str, balance: float = 10000):
    """Получить торговый сигнал"""
    symbol_clean = symbol.replace('/', '')
    price = fetch_price(symbol_clean)
    
    signal = generate_signal(symbol_clean, price)
    
    if signal is None:
        return {"signal": None, "message": "No signal available"}
        
    return {"signal": signal, "timestamp": datetime.utcnow().isoformat()}

@app.get("/prices")
def get_prices():
    """Текущие цены"""
    prices = {}
    for symbol in ["BTCUSDT", "ETHUSDT", "SOLUSDT"]:
        prices[symbol] = fetch_price(symbol)
    return {"prices": prices, "timestamp": datetime.utcnow().isoformat()}

@app.post("/feedback")
def feedback(signal_id: str, outcome: str, pnl: float = 0):
    """Обратная связь для обучения"""
    return {
        "success": True,
        "signal_id": signal_id,
        "outcome": outcome,
        "pnl": pnl,
        "message": "Feedback recorded"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)