"""
ML Model Module
Базовая supervised модель для предсказания направления
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import json
import os
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingModel:
    """
    Модель для предсказания направления цены
    Использует взвешенную логику на основе статистики
    """
    
    def __init__(self, model_path: str = "model_weights.json"):
        self.model_path = model_path
        self.weights = self._init_weights()
        self.training_data = []
        
    def _init_weights(self) -> Dict:
        """Инициализация весов модели"""
        default_weights = {
            'rsi': 0.15,
            'macd': 0.15,
            'trend': 0.20,
            'volatility': 0.15,
            'volume': 0.15,
            'support_resistance': 0.20
        }
        
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'r') as f:
                    loaded = json.load(f)
                    logger.info(f"Loaded weights from {self.model_path}")
                    return loaded
            except Exception as e:
                logger.error(f"Error loading weights: {e}")
                
        return default_weights
    
    def save_weights(self):
        """Сохранение весов"""
        try:
            with open(self.model_path, 'w') as f:
                json.dump(self.weights, f, indent=2)
            logger.info(f"Weights saved to {self.model_path}")
        except Exception as e:
            logger.error(f"Error saving weights: {e}")
    
    def _calculate_rsi_score(self, df: pd.DataFrame) -> float:
        """Оценка по RSI"""
        rsi = df['rsi'].iloc[-1]
        
        # RSI < 30: перепроданность (buy signal)
        # RSI > 70: перекупленность (sell signal)
        if rsi < 30:
            return 0.7  # Сильный buy
        elif rsi < 40:
            return 0.4  # Умеренный buy
        elif rsi > 70:
            return -0.7  # Сильный sell
        elif rsi > 60:
            return -0.4  # Умеренный sell
        else:
            return 0.0  # Нейтрально
    
    def _calculate_macd_score(self, df: pd.DataFrame) -> float:
        """Оценка по MACD"""
        macd = df['macd'].iloc[-1]
        macd_signal = df['macd_signal'].iloc[-1]
        histogram = df['macd_histogram'].iloc[-1]
        
        # MACD пересекает сигнальную линию снизу вверх
        if macd > macd_signal and histogram > 0:
            return 0.6 if histogram > df['macd_histogram'].iloc[-2] else 0.3
        # MACD пересекает сверху вниз
        elif macd < macd_signal and histogram < 0:
            return -0.6 if histogram < df['macd_histogram'].iloc[-2] else -0.3
        else:
            return 0.0
    
    def _calculate_trend_score(self, df: pd.DataFrame) -> float:
        """Оценка тренда по EMA"""
        close = df['close'].iloc[-1]
        ema_10 = df['ema_10'].iloc[-1]
        ema_20 = df['ema_20'].iloc[-1]
        ema_50 = df['ema_50'].iloc[-1]
        
        score = 0.0
        
        # Цена выше EMA
        if close > ema_10 > ema_20:
            score += 0.4
        if close > ema_50:
            score += 0.3
            
        # Цена ниже EMA
        if close < ema_10 < ema_20:
            score -= 0.4
        if close < ema_50:
            score -= 0.3
            
        return score
    
    def _calculate_volatility_score(self, df: pd.DataFrame) -> float:
        """Оценка волатильности"""
        atr_pct = df['atr_pct'].iloc[-1]
        bb_width = df['bb_width'].iloc[-1]
        
        # Сжатие волатильности (Bollinger Squeeze) - предвестник движения
        if bb_width < df['bb_width'].rolling(20).mean().iloc[-1] * 0.8:
            return 0.2  # Потенциальный breakout
            
        # Высокая волатильность - снижаем уверенность
        if atr_pct > 0.05:  # 5% ATR
            return -0.2
            
        return 0.0
    
    def _calculate_volume_score(self, df: pd.DataFrame) -> float:
        """Оценка объёма"""
        volume_ratio = df['volume_ratio_20'].iloc[-1]
        
        # Высокий объём подтверждает движение
        if volume_ratio > 2.0:
            return 0.3
        elif volume_ratio > 1.5:
            return 0.2
        elif volume_ratio < 0.5:
            return -0.2  # Низкий объём - слабый сигнал
            
        return 0.0
    
    def _calculate_sr_score(self, df: pd.DataFrame) -> float:
        """Оценка support/resistance"""
        close = df['close'].iloc[-1]
        bb_lower = df['bb_lower'].iloc[-1]
        bb_upper = df['bb_upper'].iloc[-1]
        vwap = df['vwap'].iloc[-1]
        
        score = 0.0
        
        # Отскок от нижней полосы Боллинджера
        if close < bb_lower * 1.02:
            score += 0.4
        # Отскок от VWAP
        elif abs(close - vwap) / vwap < 0.01:
            score += 0.2 if df['direction'].iloc[-1] == 1 else -0.2
        # Отбой от верхней полосы
        elif close > bb_upper * 0.98:
            score -= 0.4
            
        return score
    
    def predict(self, df: pd.DataFrame) -> Dict:
        """
        Предсказание направления
        Returns: {
            'probability_up': float (0-1),
            'probability_down': float (0-1),
            'confidence': float (0-1),
            'signal': 'buy' | 'sell' | 'hold',
            'features': dict
        }
        """
        # Расчёт компонентов
        rsi_score = self._calculate_rsi_score(df)
        macd_score = self._calculate_macd_score(df)
        trend_score = self._calculate_trend_score(df)
        vol_score = self._calculate_volatility_score(df)
        volume_score = self._calculate_volume_score(df)
        sr_score = self._calculate_sr_score(df)
        
        # Взвешенная сумма
        total_score = (
            rsi_score * self.weights['rsi'] +
            macd_score * self.weights['macd'] +
            trend_score * self.weights['trend'] +
            vol_score * self.weights['volatility'] +
            volume_score * self.weights['volume'] +
            sr_score * self.weights['support_resistance']
        )
        
        # Нормализация в вероятности
        # Используем сигмоиду
        prob_up = 1 / (1 + np.exp(-total_score * 3))
        prob_down = 1 - prob_up
        
        # Определение сигнала
        threshold = 0.6
        if prob_up > threshold:
            signal = 'buy'
        elif prob_down > threshold:
            signal = 'sell'
        else:
            signal = 'hold'
            
        confidence = max(prob_up, prob_down)
        
        return {
            'probability_up': round(prob_up, 4),
            'probability_down': round(prob_down, 4),
            'confidence': round(confidence, 4),
            'signal': signal,
            'raw_score': round(total_score, 4),
            'features': {
                'rsi': round(rsi_score, 3),
                'macd': round(macd_score, 3),
                'trend': round(trend_score, 3),
                'volatility': round(vol_score, 3),
                'volume': round(volume_score, 3),
                'support_resistance': round(sr_score, 3)
            }
        }
    
    def train(self, training_data: List[Dict]):
        """
        Обучение модели на исторических данных
        training_data: список {features, outcome, pnl}
        """
        if not training_data or len(training_data) < 10:
            logger.warning("Not enough training data")
            return
            
        logger.info(f"Training on {len(training_data)} samples")
        
        # Анализ важности фичей
        feature_performance = {}
        
        for feature in ['rsi', 'macd', 'trend', 'volatility', 'volume', 'support_resistance']:
            wins = sum(1 for d in training_data if d.get('features', {}).get(feature, 0) > 0 and d.get('outcome') == 'WIN')
            losses = sum(1 for d in training_data if d.get('features', {}).get(feature, 0) > 0 and d.get('outcome') == 'LOSS')
            
            total = wins + losses
            if total > 0:
                winrate = wins / total
                # Корректируем веса на основе winrate
                feature_performance[feature] = winrate
                
        # Обновление весов
        for feature, winrate in feature_performance.items():
            if feature in self.weights:
                # Если winrate > 0.55 - увеличиваем вес, иначе уменьшаем
                adjustment = (winrate - 0.5) * 0.2
                self.weights[feature] = max(0.05, min(0.4, self.weights[feature] + adjustment))
                
        # Нормализация весов
        total_weight = sum(self.weights.values())
        self.weights = {k: v/total_weight for k, v in self.weights.items()}
        
        self.save_weights()
        logger.info(f"Training complete. New weights: {self.weights}")
        
    def get_feature_importance(self) -> Dict:
        """Важность признаков"""
        return dict(sorted(self.weights.items(), key=lambda x: x[1], reverse=True))

# Тест
if __name__ == "__main__":
    import sys
    sys.path.append('../data')
    from fetcher import DataFetcher
    from features import FeatureEngineer
    
    fetcher = DataFetcher()
    df = fetcher.fetch_data("BTCUSDT", "1h", 100)
    
    if df is not None:
        engineer = FeatureEngineer()
        features_df = engineer.prepare_features(df)
        
        model = TradingModel()
        prediction = model.predict(features_df)
        
        print("\n🤖 Trading Model Prediction:")
        print(f"Signal: {prediction['signal'].upper()}")
        print(f"Confidence: {prediction['confidence']*100:.1f}%")
        print(f"Probability UP: {prediction['probability_up']*100:.1f}%")
        print(f"\nFeature Contributions:")
        for feat, score in prediction['features'].items():
            print(f"  {feat}: {score:+.3f}")