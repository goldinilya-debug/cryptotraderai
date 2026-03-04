"""
ML API Service
FastAPI сервис для генерации сигналов
"""
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import asyncio
import json
import logging
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

app = FastAPI(
    title="CryptoTraderAI ML API",
    description="ML-powered trading signals API",
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

# Инициализация компонентов
fetcher = DataFetcher()
engineer = FeatureEngineer()
model = TradingModel()
generator = SignalGenerator()

# Кэш данных
price_cache = {}
signal_cache = {}

class SignalRequest(BaseModel):
    symbol: str = "BTCUSDT"
    timeframe: str = "1h"
    account_balance: float = 10000

class FeedbackRequest(BaseModel):
    signal_id: str
    outcome: str  # 'WIN' или 'LOSS'
    pnl: Optional[float] = None

@app.get("/")
async def root():
    return {
        "name": "CryptoTraderAI ML API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/signal/{symbol}/{timeframe}",
            "/predict",
            "/feedback",
            "/ws/signals"
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/signal/{symbol}/{timeframe}")
async def get_signal(symbol: str, timeframe: str, balance: float = 10000):
    """
    Получение торгового сигнала
    """
    try:
        # Получаем данные
        df = fetcher.fetch_data(symbol, timeframe, limit=100)
        if df is None:
            raise HTTPException(status_code=404, detail=f"No data for {symbol}")
            
        # Готовим признаки
        features_df = engineer.prepare_features(df)
        
        # Предсказание
        prediction = model.predict(features_df)
        
        # Генерация сигнала
        signal = generator.generate_signal(
            symbol=symbol,
            timeframe=timeframe,
            df=features_df,
            prediction=prediction,
            account_balance=balance
        )
        
        if signal is None:
            return {
                "signal": None,
                "message": "No signal at this time (confidence too low or filters)",
                "prediction": prediction,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        # Формат для бота
        bot_signal = generator.format_signal_for_bot(signal)
        
        # Кэшируем
        signal_id = f"{symbol}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        bot_signal['id'] = signal_id
        signal_cache[signal_id] = bot_signal
        
        return {
            "signal": bot_signal,
            "model_confidence": prediction['confidence'],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict(request: SignalRequest):
    """
    Получение предсказания модели
    """
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
    """
    Отправка feedback для обучения модели
    """
    try:
        # Загружаем историю
        training_data = []
        if os.path.exists('training_data.json'):
            with open('training_data.json', 'r') as f:
                training_data = json.load(f)
        
        # Добавляем новый результат
        if request.signal_id in signal_cache:
            signal_data = signal_cache[request.signal_id]
            training_data.append({
                'signal_id': request.signal_id,
                'features': signal_data['metadata']['features'],
                'outcome': request.outcome,
                'pnl': request.pnl,
                'timestamp': datetime.utcnow().isoformat()
            })
            
            # Сохраняем
            with open('training_data.json', 'w') as f:
                json.dump(training_data, f, indent=2)
                
            # Переобучаем модель
            model.train(training_data)
            
            return {
                "success": True,
                "message": "Feedback recorded and model retrained",
                "total_samples": len(training_data),
                "new_weights": model.weights
            }
        else:
            raise HTTPException(status_code=404, detail="Signal not found in cache")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Статистика модели"""
    return {
        "model_weights": model.weights,
        "feature_importance": model.get_feature_importance(),
        "cached_signals": len(signal_cache),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.websocket("/ws/signals")
async def websocket_signals(websocket: WebSocket):
    """WebSocket для real-time сигналов"""
    await websocket.accept()
    logger.info("WebSocket connected")
    
    try:
        while True:
            # Получаем настройки от клиента
            data = await websocket.receive_json()
            symbol = data.get('symbol', 'BTCUSDT')
            timeframe = data.get('timeframe', '1h')
            
            # Генерируем сигнал
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
            
            # Ждём перед следующим обновлением
            await asyncio.sleep(30)
            
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        logger.info("WebSocket disconnected")

# Запуск
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)