"""
Signal Generator Module
Генерация торговых сигналов с риск-менеджментом
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TradingSignal:
    """Структура торгового сигнала"""
    symbol: str
    timeframe: str
    side: str  # 'buy' или 'sell'
    entry_price: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: float
    position_size_usd: float
    confidence: float
    risk_reward_ratio: float
    expected_return: float
    features: Dict
    timestamp: str
    
class SignalGenerator:
    """Генератор сигналов с риск-менеджментом"""
    
    def __init__(
        self,
        risk_per_trade: float = 0.02,  # 2% риска на сделку
        max_position_size: float = 1000,  # Макс $1000
        min_confidence: float = 0.65,
        leverage: float = 1.0
    ):
        self.risk_per_trade = risk_per_trade
        self.max_position_size = max_position_size
        self.min_confidence = min_confidence
        self.leverage = leverage
        self.commission = 0.0006  # 0.06% Bybit комиссия
        
    def calculate_position_size(
        self,
        account_balance: float,
        entry: float,
        stop_loss: float
    ) -> float:
        """
        Расчёт размера позиции на основе риска
        """
        # Риск в USD
        risk_usd = account_balance * self.risk_per_trade
        
        # Риск на единицу контракта
        risk_per_unit = abs(entry - stop_loss)
        
        if risk_per_unit == 0:
            return 0
            
        # Размер позиции в единицах
        position_units = risk_usd / risk_per_unit
        
        # Стоимость позиции в USD
        position_value = position_units * entry
        
        # Применяем плечо
        position_value_with_leverage = position_value / self.leverage
        
        # Ограничения
        position_value_with_leverage = min(
            position_value_with_leverage,
            self.max_position_size,
            account_balance * 0.5  # Не более 50% баланса
        )
        
        return round(position_value_with_leverage, 2)
    
    def calculate_stop_loss(
        self,
        df: pd.DataFrame,
        side: str,
        atr_multiplier: float = 2.0
    ) -> float:
        """Расчёт стоп-лосса на основе ATR"""
        close = df['close'].iloc[-1]
        atr = df['atr'].iloc[-1]
        
        if side == 'buy':
            # Стоп ниже цены
            stop = close - (atr * atr_multiplier)
            # Минимум 1% от цены
            stop = min(stop, close * 0.99)
        else:
            # Стоп выше цены
            stop = close + (atr * atr_multiplier)
            stop = max(stop, close * 1.01)
            
        return round(stop, 2)
    
    def calculate_take_profits(
        self,
        entry: float,
        stop_loss: float,
        side: str
    ) -> tuple:
        """Расчёт целей прибыли"""
        risk = abs(entry - stop_loss)
        
        if side == 'buy':
            tp1 = entry + (risk * 2.0)  # 1:2 R:R
            tp2 = entry + (risk * 3.5)  # 1:3.5 R:R
        else:
            tp1 = entry - (risk * 2.0)
            tp2 = entry - (risk * 3.5)
            
        return round(tp1, 2), round(tp2, 2)
    
    def generate_signal(
        self,
        symbol: str,
        timeframe: str,
        df: pd.DataFrame,
        prediction: Dict,
        account_balance: float = 10000
    ) -> Optional[TradingSignal]:
        """
        Генерация сигнала на основе предсказания модели
        """
        signal_type = prediction.get('signal', 'hold')
        confidence = prediction.get('confidence', 0)
        
        # Фильтр по уверенности
        if signal_type == 'hold' or confidence < self.min_confidence:
            return None
            
        close = df['close'].iloc[-1]
        
        # Определение стороны
        side = 'buy' if signal_type == 'buy' else 'sell'
        
        # Расчёт уровней
        stop_loss = self.calculate_stop_loss(df, side)
        tp1, tp2 = self.calculate_take_profits(close, stop_loss, side)
        
        # Расчёт размера позиции
        position_size = self.calculate_position_size(
            account_balance, close, stop_loss
        )
        
        # R:R ratio
        risk = abs(close - stop_loss)
        reward = abs(tp1 - close)
        rr_ratio = reward / risk if risk > 0 else 0
        
        # Фильтр по R:R (минимум 1:1.5)
        if rr_ratio < 1.5:
            logger.info(f"Signal rejected: R:R {rr_ratio:.2f} too low")
            return None
            
        # Ожидаемая доходность с учётом комиссий
        expected_return = (reward / close) - (self.commission * 2)
        
        return TradingSignal(
            symbol=symbol,
            timeframe=timeframe,
            side=side,
            entry_price=round(close, 2),
            stop_loss=stop_loss,
            take_profit_1=tp1,
            take_profit_2=tp2,
            position_size_usd=position_size,
            confidence=confidence,
            risk_reward_ratio=round(rr_ratio, 2),
            expected_return=round(expected_return, 4),
            features=prediction.get('features', {}),
            timestamp=datetime.utcnow().isoformat()
        )
    
    def filter_by_market_conditions(
        self,
        df: pd.DataFrame,
        signal: TradingSignal
    ) -> bool:
        """Дополнительные фильтры рыночных условий"""
        # Проверка волатильности
        atr_pct = df['atr_pct'].iloc[-1]
        if atr_pct > 0.08:  # Слишком волатильно
            logger.warning("Market too volatile, skipping signal")
            return False
            
        # Проверка объёма
        volume_ratio = df['volume_ratio_20'].iloc[-1]
        if volume_ratio < 0.7:  # Слишком низкий объём
            logger.warning("Volume too low, skipping signal")
            return False
            
        # Проверка времени (избегаем низкой ликвидности)
        # Можно добавить логику для фильтрации выходных/ночи
        
        return True
    
    def format_signal_for_bot(self, signal: TradingSignal) -> Dict:
        """Форматирование сигнала для отправки боту"""
        return {
            'symbol': signal.symbol,
            'timeframe': signal.timeframe,
            'side': signal.side,
            'entry': {
                'price': signal.entry_price,
                'zone': [
                    round(signal.entry_price * 0.995, 2),
                    round(signal.entry_price * 1.005, 2)
                ]
            },
            'stop_loss': signal.stop_loss,
            'take_profit': {
                'tp1': signal.take_profit_1,
                'tp2': signal.take_profit_2
            },
            'position': {
                'size_usd': signal.position_size_usd,
                'leverage': self.leverage,
                'risk_percent': self.risk_per_trade * 100
            },
            'metadata': {
                'confidence': signal.confidence,
                'risk_reward': signal.risk_reward_ratio,
                'expected_return': signal.expected_return,
                'features': signal.features,
                'timestamp': signal.timestamp
            }
        }

# Тест
if __name__ == "__main__":
    import sys
    sys.path.append('../data')
    sys.path.append('.')
    from fetcher import DataFetcher
    from features import FeatureEngineer
    from base_model import TradingModel
    
    fetcher = DataFetcher()
    df = fetcher.fetch_data("BTCUSDT", "1h", 100)
    
    if df is not None:
        engineer = FeatureEngineer()
        features_df = engineer.prepare_features(df)
        
        model = TradingModel()
        prediction = model.predict(features_df)
        
        generator = SignalGenerator()
        signal = generator.generate_signal(
            "BTCUSDT",
            "1h",
            features_df,
            prediction,
            account_balance=10000
        )
        
        if signal:
            print("\n🎯 TRADING SIGNAL GENERATED:")
            print(f"Side: {signal.side.upper()}")
            print(f"Entry: ${signal.entry_price}")
            print(f"Stop: ${signal.stop_loss}")
            print(f"TP1: ${signal.take_profit_1} | TP2: ${signal.take_profit_2}")
            print(f"Position Size: ${signal.position_size_usd}")
            print(f"Confidence: {signal.confidence*100:.1f}%")
            print(f"R:R: 1:{signal.risk_reward_ratio}")
            
            # Формат для бота
            bot_signal = generator.format_signal_for_bot(signal)
            print(f"\n📤 Bot Format:\n{bot_signal}")
        else:
            print("❌ No signal generated")