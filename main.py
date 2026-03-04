from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime, timedelta
import json
import os
from typing import List, Dict, Optional

app = FastAPI(
    title="CryptoTraderAI API",
    description="AI-powered crypto trading signals API with ML learning",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DATA STORAGE ====================
SIGNALS_HISTORY_FILE = "signals_history.json"
ML_MODEL_FILE = "ml_model.json"

# Загрузка истории сигналов
def load_signals_history() -> List[Dict]:
    if os.path.exists(SIGNALS_HISTORY_FILE):
        with open(SIGNALS_HISTORY_FILE, 'r') as f:
            return json.load(f)
    return []

# Сохранение истории
def save_signals_history(history: List[Dict]):
    with open(SIGNALS_HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

# ==================== ML MODEL ====================
class SignalMLModel:
    """
    Математическая модель обучения на сигналах
    Использует статистический анализ и взвешенные признаки
    """
    
    def __init__(self):
        self.weights = {
            'pair_performance': 0.25,      # Историческая успешность пары
            'direction_bias': 0.20,         # Смещение направления
            'timeframe_accuracy': 0.15,     # Точность таймфрейма
            'wyckoff_phase': 0.15,          # Фаза Wyckoff
            'kill_zone': 0.10,              # Kill Zone эффективность
            'risk_reward': 0.10,            # Соотношение риск/доход
            'market_context': 0.05          # Рыночный контекст
        }
        self.pair_stats = {}
        self.direction_stats = {'LONG': {'wins': 0, 'losses': 0}, 'SHORT': {'wins': 0, 'losses': 0}}
        self.timeframe_stats = {}
        self.wyckoff_stats = {}
        self.killzone_stats = {}
        self.total_signals = 0
        self.total_wins = 0
        self.total_losses = 0
        
    def train(self, signals: List[Dict]):
        """Обучение модели на истории сигналов"""
        if not signals:
            return
            
        # Сброс статистики
        self.pair_stats = {}
        self.direction_stats = {'LONG': {'wins': 0, 'losses': 0}, 'SHORT': {'wins': 0, 'losses': 0}}
        self.timeframe_stats = {}
        self.wyckoff_stats = {}
        self.killzone_stats = {}
        self.total_wins = 0
        self.total_losses = 0
        
        for signal in signals:
            if 'outcome' not in signal:
                continue
                
            pair = signal.get('pair', 'UNKNOWN')
            direction = signal.get('direction', 'LONG')
            timeframe = signal.get('timeframe', '4H')
            wyckoff = signal.get('wyckoff_phase', 'unknown')
            killzone = signal.get('kill_zone', 'unknown')
            outcome = signal.get('outcome')  # 'WIN' или 'LOSS'
            
            # Статистика по парам
            if pair not in self.pair_stats:
                self.pair_stats[pair] = {'wins': 0, 'losses': 0, 'total': 0}
            self.pair_stats[pair]['total'] += 1
            if outcome == 'WIN':
                self.pair_stats[pair]['wins'] += 1
                self.total_wins += 1
            else:
                self.pair_stats[pair]['losses'] += 1
                self.total_losses += 1
                
            # Статистика по направлению
            if outcome == 'WIN':
                self.direction_stats[direction]['wins'] += 1
            else:
                self.direction_stats[direction]['losses'] += 1
                
            # Статистика по таймфреймам
            if timeframe not in self.timeframe_stats:
                self.timeframe_stats[timeframe] = {'wins': 0, 'losses': 0}
            if outcome == 'WIN':
                self.timeframe_stats[timeframe]['wins'] += 1
            else:
                self.timeframe_stats[timeframe]['losses'] += 1
                
            # Статистика по фазам Wyckoff
            if wyckoff not in self.wyckoff_stats:
                self.wyckoff_stats[wyckoff] = {'wins': 0, 'losses': 0}
            if outcome == 'WIN':
                self.wyckoff_stats[wyckoff]['wins'] += 1
            else:
                self.wyckoff_stats[wyckoff]['losses'] += 1
                
            # Статистика по Kill Zones
            if killzone not in self.killzone_stats:
                self.killzone_stats[killzone] = {'wins': 0, 'losses': 0}
            if outcome == 'WIN':
                self.killzone_stats[killzone]['wins'] += 1
            else:
                self.killzone_stats[killzone]['losses'] += 1
                
        self.total_signals = len(signals)
        
    def predict_confidence(self, signal: Dict) -> float:
        """Предсказание уверенности для нового сигнала (0-100)"""
        pair = signal.get('pair', 'UNKNOWN')
        direction = signal.get('direction', 'LONG')
        timeframe = signal.get('timeframe', '4H')
        wyckoff = signal.get('wyckoff_phase', 'unknown')
        killzone = signal.get('kill_zone', 'unknown')
        entry = signal.get('entry', 0)
        stop_loss = signal.get('stop_loss', 0)
        take_profit = signal.get('take_profit_1', 0)
        
        scores = []
        weights_applied = []
        
        # 1. Успешность пары
        if pair in self.pair_stats and self.pair_stats[pair]['total'] > 0:
            pair_winrate = self.pair_stats[pair]['wins'] / self.pair_stats[pair]['total']
            scores.append(pair_winrate * 100)
            weights_applied.append(self.weights['pair_performance'])
        else:
            scores.append(50)  # Нейтрально для новых пар
            weights_applied.append(self.weights['pair_performance'])
            
        # 2. Смещение направления
        dir_total = self.direction_stats[direction]['wins'] + self.direction_stats[direction]['losses']
        if dir_total > 0:
            dir_winrate = self.direction_stats[direction]['wins'] / dir_total
            scores.append(dir_winrate * 100)
            weights_applied.append(self.weights['direction_bias'])
        else:
            scores.append(50)
            weights_applied.append(self.weights['direction_bias'])
            
        # 3. Точность таймфрейма
        if timeframe in self.timeframe_stats:
            tf_total = self.timeframe_stats[timeframe]['wins'] + self.timeframe_stats[timeframe]['losses']
            if tf_total > 0:
                tf_winrate = self.timeframe_stats[timeframe]['wins'] / tf_total
                scores.append(tf_winrate * 100)
                weights_applied.append(self.weights['timeframe_accuracy'])
            else:
                scores.append(50)
                weights_applied.append(self.weights['timeframe_accuracy'])
        else:
            scores.append(50)
            weights_applied.append(self.weights['timeframe_accuracy'])
            
        # 4. Фаза Wyckoff
        if wyckoff in self.wyckoff_stats:
            wyck_total = self.wyckoff_stats[wyckoff]['wins'] + self.wyckoff_stats[wyckoff]['losses']
            if wyck_total > 0:
                wyck_winrate = self.wyckoff_stats[wyckoff]['wins'] / wyck_total
                scores.append(wyck_winrate * 100)
                weights_applied.append(self.weights['wyckoff_phase'])
            else:
                scores.append(50)
                weights_applied.append(self.weights['wyckoff_phase'])
        else:
            scores.append(50)
            weights_applied.append(self.weights['wyckoff_phase'])
            
        # 5. Kill Zone
        if killzone in self.killzone_stats:
            kz_total = self.killzone_stats[killzone]['wins'] + self.killzone_stats[killzone]['losses']
            if kz_total > 0:
                kz_winrate = self.killzone_stats[killzone]['wins'] / kz_total
                scores.append(kz_winrate * 100)
                weights_applied.append(self.weights['kill_zone'])
            else:
                scores.append(50)
                weights_applied.append(self.weights['kill_zone'])
        else:
            scores.append(50)
            weights_applied.append(self.weights['kill_zone'])
            
        # 6. Risk/Reward ratio
        if entry > 0 and stop_loss > 0 and take_profit > 0:
            risk = abs(entry - stop_loss)
            reward = abs(take_profit - entry)
            if risk > 0:
                rr_ratio = reward / risk
                # Нормализация: 1:1 = 50%, 1:2 = 70%, 1:3 = 85%
                rr_score = min(50 + (rr_ratio - 1) * 20, 90)
                scores.append(rr_score)
                weights_applied.append(self.weights['risk_reward'])
            else:
                scores.append(50)
                weights_applied.append(self.weights['risk_reward'])
        else:
            scores.append(50)
            weights_applied.append(self.weights['risk_reward'])
            
        # 7. Рыночный контекст (базовый)
        scores.append(60)  # Нейтрально
        weights_applied.append(self.weights['market_context'])
        
        # Взвешенное среднее
        if weights_applied:
            total_weight = sum(weights_applied)
            weighted_score = sum(s * w for s, w in zip(scores, weights_applied)) / total_weight
            return round(weighted_score, 1)
        
        return 50.0  # Нейтральная уверенность
        
    def get_insights(self) -> Dict:
        """Получение инсайтов от модели"""
        insights = {
            'total_signals': self.total_signals,
            'total_wins': self.total_wins,
            'total_losses': self.total_losses,
            'overall_winrate': 0,
            'best_pairs': [],
            'best_direction': None,
            'best_timeframes': [],
            'best_wyckoff_phases': [],
            'best_killzones': []
        }
        
        if self.total_signals > 0:
            insights['overall_winrate'] = round(self.total_wins / self.total_signals * 100, 2)
            
        # Лучшие пары (минимум 3 сигнала)
        pair_winrates = []
        for pair, stats in self.pair_stats.items():
            if stats['total'] >= 3:
                winrate = stats['wins'] / stats['total']
                pair_winrates.append((pair, winrate, stats['total']))
        pair_winrates.sort(key=lambda x: x[1], reverse=True)
        insights['best_pairs'] = [{'pair': p, 'winrate': round(w * 100, 1), 'samples': s} for p, w, s in pair_winrates[:5]]
        
        # Лучшее направление
        long_total = self.direction_stats['LONG']['wins'] + self.direction_stats['LONG']['losses']
        short_total = self.direction_stats['SHORT']['wins'] + self.direction_stats['SHORT']['losses']
        long_wr = self.direction_stats['LONG']['wins'] / long_total if long_total > 0 else 0
        short_wr = self.direction_stats['SHORT']['wins'] / short_total if short_total > 0 else 0
        insights['best_direction'] = 'LONG' if long_wr > short_wr else 'SHORT'
        insights['direction_stats'] = {
            'LONG': {'winrate': round(long_wr * 100, 1), 'total': long_total},
            'SHORT': {'winrate': round(short_wr * 100, 1), 'total': short_total}
        }
        
        return insights

# Инициализация ML модели
ml_model = SignalMLModel()

# Загрузка и обучение при старте
signals_history = load_signals_history()
ml_model.train(signals_history)
print(f"[ML] Model trained on {len(signals_history)} signals")

# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "name": "CryptoTraderAI API",
        "version": "2.0.0",
        "ml_enabled": True,
        "signals_trained": len(signals_history),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "ml_model": "trained" if signals_history else "untrained",
        "signals_in_history": len(signals_history)
    }

@app.get("/api/ml/status")
async def ml_status():
    """Статус ML модели"""
    insights = ml_model.get_insights()
    return {
        "status": "active",
        "signals_trained": len(signals_history),
        "insights": insights,
        "last_updated": datetime.utcnow().isoformat()
    }

@app.post("/api/ml/feedback")
async def ml_feedback(signal_id: str, outcome: str):
    """
    Отправка feedback о сигнале (WIN или LOSS)
    Это обучает модель
    """
    global signals_history, ml_model
    
    if outcome not in ['WIN', 'LOSS']:
        raise HTTPException(status_code=400, detail="Outcome must be WIN or LOSS")
    
    # Находим сигнал в истории
    signal_found = False
    for signal in signals_history:
        if signal['id'] == signal_id:
            signal['outcome'] = outcome
            signal['feedback_timestamp'] = datetime.utcnow().isoformat()
            signal_found = True
            break
    
    if not signal_found:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    # Сохраняем и переобучаем
    save_signals_history(signals_history)
    ml_model.train(signals_history)
    
    return {
        "success": True,
        "signal_id": signal_id,
        "outcome": outcome,
        "model_retrained": True,
        "total_signals": len(signals_history)
    }

@app.post("/api/ml/predict")
async def ml_predict(signal: dict):
    """
    Предсказание уверенности для нового сигнала
    """
    confidence = ml_model.predict_confidence(signal)
    
    # Добавляем рекомендации
    recommendations = []
    insights = ml_model.get_insights()
    
    pair = signal.get('pair')
    direction = signal.get('direction')
    
    # Проверяем историю пары
    if pair in ml_model.pair_stats:
        stats = ml_model.pair_stats[pair]
        if stats['total'] >= 3:
            winrate = stats['wins'] / stats['total']
            if winrate < 0.4:
                recommendations.append(f"⚠️ Пара {pair} имеет низкий win rate ({winrate*100:.0f}%)")
            elif winrate > 0.6:
                recommendations.append(f"✅ Пара {pair} показывает хорошие результаты ({winrate*100:.0f}%)")
    
    # Проверяем направление
    dir_stats = ml_model.direction_stats.get(direction, {'wins': 0, 'losses': 0})
    dir_total = dir_stats['wins'] + dir_stats['losses']
    if dir_total >= 5:
        dir_wr = dir_stats['wins'] / dir_total
        if dir_wr < 0.4:
            recommendations.append(f"⚠️ Направление {direction} слабое в последнее время")
    
    return {
        "predicted_confidence": confidence,
        "recommendations": recommendations,
        "model_confidence": "high" if len(signals_history) > 20 else "medium" if len(signals_history) > 5 else "low"
    }

# ==================== PRICES & SIGNALS ====================

def fetch_prices():
    """Fetch prices from CoinGecko"""
    try:
        response = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={"ids": "bitcoin,ethereum,solana", "vs_currencies": "usd"},
            timeout=10
        )
        data = response.json()
        return {
            "bitcoin": data.get("bitcoin", {}).get("usd", 68000),
            "ethereum": data.get("ethereum", {}).get("usd", 2450),
            "solana": data.get("solana", {}).get("usd", 142)
        }
    except:
        return {"bitcoin": 68000, "ethereum": 2450, "solana": 142}

@app.get("/api/prices")
async def get_prices():
    prices = fetch_prices()
    return {
        "prices": {
            "BTC/USDT": prices["bitcoin"],
            "ETH/USDT": prices["ethereum"],
            "SOL/USDT": prices["solana"]
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/signals")
async def get_signals():
    """Get signals with ML-enhanced confidence"""
    prices = fetch_prices()
    
    # Базовые сигналы
    base_signals = [
        {
            "id": f"sig_{datetime.now().strftime('%Y%m%d')}_001",
            "pair": "BTC/USDT",
            "direction": "LONG",
            "current_price": prices["bitcoin"],
            "entry": round(prices["bitcoin"] * 1.01, 2),
            "stop_loss": round(prices["bitcoin"] * 0.97, 2),
            "take_profit_1": round(prices["bitcoin"] * 1.05, 2),
            "take_profit_2": round(prices["bitcoin"] * 1.10, 2),
            "confidence": 78,
            "wyckoff_phase": "markup",
            "kill_zone": "New York",
            "timeframe": "4H",
            "exchange": "Binance",
            "status": "ACTIVE"
        },
        {
            "id": f"sig_{datetime.now().strftime('%Y%m%d')}_002",
            "pair": "ETH/USDT",
            "direction": "SHORT",
            "current_price": prices["ethereum"],
            "entry": round(prices["ethereum"] * 0.99, 2),
            "stop_loss": round(prices["ethereum"] * 1.03, 2),
            "take_profit_1": round(prices["ethereum"] * 0.95, 2),
            "take_profit_2": round(prices["ethereum"] * 0.90, 2),
            "confidence": 74,
            "wyckoff_phase": "distribution",
            "kill_zone": "London",
            "timeframe": "4H",
            "exchange": "Binance",
            "status": "ACTIVE"
        }
    ]
    
    # Улучшаем сигналы с помощью ML
    enhanced_signals = []
    for signal in base_signals:
        # Получаем ML предсказание
        ml_confidence = ml_model.predict_confidence(signal)
        
        # Объединяем базовую и ML уверенность
        final_confidence = round((signal['confidence'] + ml_confidence) / 2, 1)
        
        signal['ml_confidence'] = ml_confidence
        signal['confidence'] = final_confidence
        signal['ml_enhanced'] = True
        
        enhanced_signals.append(signal)
        
        # Сохраняем в историю (без outcome пока)
        signal_copy = signal.copy()
        signal_copy['timestamp'] = datetime.utcnow().isoformat()
        signals_history.append(signal_copy)
    
    # Сохраняем историю (ограничиваем 1000 сигналов)
    if len(signals_history) > 1000:
        signals_history[:] = signals_history[-1000:]
    save_signals_history(signals_history)
    
    insights = ml_model.get_insights()
    
    return {
        "signals": enhanced_signals,
        "ml_insights": insights,
        "timestamp": datetime.utcnow().isoformat()
    }